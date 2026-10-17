"""Voiceover, step 2: pick the best take per line, trim fillers, place lines, export vo.wav + word timings.

For every take in vo/takes/: transcribe with Whisper small.en (word timestamps), score it
against the line's script (normalized word match, phonetic spellings folded to their real
spelling), reject takes that don't fit the scene window, cut stray "um"/"uh" using the word
timestamps, trim edge silence, then place the winner at its scene time.
Writes:
  vo/vo.wav             mono 48 kHz, 30 s, the assembled voiceover
  vo/report.json        every take: transcript, score, duration, chosen flag
  src/race/vo-words.json  word timings (real spelling) + caption chunks for the film

usage: /tmp/claude-0/voxenv/bin/python scripts/vo_select.py
"""
import difflib
import glob
import json
import os
import re

import numpy as np
import soundfile as sf
import whisper

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
DUR = 30.0
FILLERS = {'um', 'uh', 'erm', 'er', 'hmm', 'mm', 'ah', 'eh', 'umm', 'uhh'}

# fold phonetic / numeric variants onto one canonical token
CANON = [
    (r'\bu[\s.-]*s[\s.-]*d[\s.-]*t\b', ' usdt '),
    (r'\bp[\s.-]*(?:two|to|2)[\s.-]*p\b', ' p2p '),
    (r'\bone hundred\b|\ba hundred\b|\b100\b', ' 100 '),
    (r'\bauto[\s-]*converts?\b', ' autoconverts '),
    (r"\byou're\b|\byou are\b", ' youre '),
]


def norm(text):
    t = text.lower().replace('’', "'")
    for pat, rep in CANON:
        t = re.sub(pat, rep, t)
    t = re.sub(r"[^a-z0-9' ]+", ' ', t).replace("'", '')
    return [w for w in t.split() if w]


def load(path):
    a, sr = sf.read(path, dtype='float32', always_2d=True)
    a = a.mean(1)
    if sr != SR:
        import subprocess

        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
        a = np.frombuffer(raw, np.float32).copy()
    return a


def words_of(result):
    out = []
    for seg in result['segments']:
        for w in seg.get('words', []):
            out.append({'w': w['word'].strip(), 'start': float(w['start']), 'end': float(w['end']), 'p': float(w.get('probability', 1))})
    return out


def cut_spans(audio, spans, fade=0.012):
    """remove [a,b) spans (seconds) with short crossfades; returns audio and a time-mapping fn"""
    spans = sorted(spans)
    pieces, kept = [], []
    last = 0.0
    for a, b in spans:
        if a > last:
            pieces.append(audio[int(last * SR): int(a * SR)])
            kept.append((last, a))
        last = max(last, b)
    pieces.append(audio[int(last * SR):])
    kept.append((last, len(audio) / SR))
    f = int(fade * SR)
    out = pieces[0]
    for p in pieces[1:]:
        if len(out) > f and len(p) > f:
            ramp = np.linspace(0, 1, f, dtype=np.float32)
            head = out[-f:] * (1 - ramp) + p[:f] * ramp
            out = np.concatenate([out[:-f], head, p[f:]])
        else:
            out = np.concatenate([out, p])

    def remap(t):
        acc = 0.0
        for i, (a, b) in enumerate(kept):
            if t < b or i == len(kept) - 1:
                return acc + max(0.0, t - a) - (i * fade)
            acc += b - a
        return t

    return out, remap


def main():
    script = json.load(open(os.path.join(ROOT, 'vo/script.json')))
    model = whisper.load_model('small.en')
    report, placed = [], []
    vo = np.zeros(int(DUR * SR), np.float32)
    words_out, captions = [], []
    for line in script['lines']:
        target = norm(line['show'])
        window = line['max'] - line['at']
        best = None
        for path in sorted(glob.glob(os.path.join(ROOT, 'vo/takes', f"{line['id']}_*.wav"))):
            audio = load(path)
            res = model.transcribe(path, language='en', word_timestamps=True, temperature=0.0, condition_on_previous_text=False, initial_prompt=line['show'])
            ws = words_of(res)
            heard = [w for w in ws if norm(w['w']) and norm(w['w'])[0] not in FILLERS]
            fillers = [w for w in ws if norm(w['w']) and norm(w['w'])[0] in FILLERS]
            got = [t for w in heard for t in norm(w['w'])]
            score = difflib.SequenceMatcher(None, target, got).ratio()
            if heard:
                speech = heard[-1]['end'] - heard[0]['start'] - sum(f['end'] - f['start'] for f in fillers if heard[0]['start'] < f['start'] < heard[-1]['end'])
            else:
                speech = len(audio) / SR
            fits = speech <= window
            rank = score - (0 if fits else 0.25 + 0.1 * (speech - window))
            entry = {'take': os.path.basename(path), 'heard': res['text'].strip(), 'score': round(score, 3), 'speech_s': round(speech, 2), 'window_s': round(window, 2), 'fits': fits, 'fillers': [f['w'] for f in fillers]}
            report.append({'line': line['id'], **entry})
            print(line['id'], entry, flush=True)
            if best is None or rank > best[0]:
                best = (rank, path, audio, heard, fillers, entry)
        if best is None:
            print('no takes for', line['id'])
            continue
        _, path, audio, heard, fillers, entry = best
        for r in report:
            if r['line'] == line['id'] and r['take'] == entry['take']:
                r['chosen'] = True
        # cut fillers, then trim to first/last real word with a little air
        spans = [(f['start'] - 0.02, f['end'] + 0.02) for f in fillers]
        clean, remap = cut_spans(audio, spans)
        hw = [{**w, 'start': remap(w['start']), 'end': remap(w['end'])} for w in heard]
        a = max(0.0, hw[0]['start'] - 0.06)
        b = min(len(clean) / SR, hw[-1]['end'] + 0.18)
        clip = clean[int(a * SR): int(b * SR)].copy()
        fl = int(0.01 * SR)
        clip[:fl] *= np.linspace(0, 1, fl)
        clip[-int(0.06 * SR):] *= np.linspace(1, 0, int(0.06 * SR))
        # if it still overruns its window, tighten with a gentle tempo change (max 10%)
        dur = len(clip) / SR
        speed = 1.0
        if dur > window:
            speed = min(1.12, dur / window)
            import subprocess

            raw = subprocess.run(
                ['ffmpeg', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-af', f'atempo={speed:.4f}', '-f', 'f32le', '-'],
                input=clip.tobytes(), capture_output=True, check=True,
            ).stdout
            clip = np.frombuffer(raw, np.float32).copy()
        start = line['at']
        i = int(start * SR)
        vo[i: i + len(clip)] += clip[: len(vo) - i]
        # word timings in film time, mapped onto the real spelling
        tw = [{'w': w['w'], 'start': start + (w['start'] - a) / speed, 'end': start + (w['end'] - a) / speed} for w in hw]
        show_words = line['show'].split()
        show_norm = [norm(s) for s in show_words]
        flat_show = [(k, t) for k, toks in enumerate(show_norm) for t in toks]
        flat_heard = [(k, t) for k, w in enumerate(tw) for t in norm(w['w'])]
        sm = difflib.SequenceMatcher(None, [t for _, t in flat_show], [t for _, t in flat_heard])
        times = [None] * len(show_words)
        for blk in sm.get_matching_blocks():
            for j in range(blk.size):
                sk = flat_show[blk.a + j][0]
                hk = flat_heard[blk.b + j][0]
                s0, e0 = tw[hk]['start'], tw[hk]['end']
                if times[sk] is None:
                    times[sk] = [s0, e0]
                else:
                    times[sk] = [min(times[sk][0], s0), max(times[sk][1], e0)]
        # interpolate any unmatched words
        first, last = tw[0]['start'], tw[-1]['end']
        known = [(k, t) for k, t in enumerate(times) if t]
        for k in range(len(times)):
            if times[k] is None:
                prev = max([kk for kk, _ in known if kk < k], default=None)
                nxt = min([kk for kk, _ in known if kk > k], default=None)
                s0 = times[prev][1] if prev is not None else first
                e0 = times[nxt][0] if nxt is not None else last
                times[k] = [s0, max(s0 + 0.05, e0)]
        line_words = [{'w': w, 'start': round(t[0], 3), 'end': round(t[1], 3), 'line': line['id']} for w, t in zip(show_words, times)]
        words_out += line_words
        # caption chunks: break at sentence/clause punctuation, 2-5 words each
        chunk = []
        for k, w in enumerate(line_words):
            chunk.append(w)
            end_here = re.search(r'[.,?!…]$', w['w']) is not None
            if (end_here and len(chunk) >= 2) or len(chunk) >= 5 or k == len(line_words) - 1:
                # never end a caption on a dangling function word; carry it into the next one
                carry = []
                while not end_here and k < len(line_words) - 1 and len(chunk) > 2 and re.sub(r'\W', '', chunk[-1]['w'].lower()) in {'to', 'your', 'a', 'the', 'of', 'in', 'and', 'on'}:
                    carry.insert(0, chunk.pop())
                captions.append({'text': ' '.join(c['w'] for c in chunk), 'start': chunk[0]['start'], 'end': chunk[-1]['end'], 'words': chunk})
                chunk = carry
        placed.append({'line': line['id'], 'take': entry['take'], 'start': round(start, 3), 'end': round(start + len(clip) / SR, 3), 'speed': round(speed, 3)})
    # merge 1-word stragglers into the previous caption of the same line
    merged = []
    for c in captions:
        if merged and len(c['words']) == 1 and merged[-1]['words'][-1]['line'] == c['words'][0]['line'] and len(merged[-1]['words']) < 5:
            m = merged[-1]
            m['text'] += ' ' + c['text']
            m['end'] = c['end']
            m['words'] += c['words']
        else:
            merged.append(c)
    peak = np.abs(vo).max()
    if peak > 0:
        vo = vo / peak * 0.89
    sf.write(os.path.join(ROOT, 'vo/vo.wav'), vo, SR, subtype='PCM_16')
    json.dump({'takes': report, 'placed': placed}, open(os.path.join(ROOT, 'vo/report.json'), 'w'), indent=2)
    json.dump({'words': words_out, 'captions': [{k: v for k, v in c.items() if k != 'words'} | {'words': c['words']} for c in merged]}, open(os.path.join(ROOT, 'src/race/vo-words.json'), 'w'), indent=1)
    print('placed', json.dumps(placed, indent=1))


if __name__ == '__main__':
    main()
