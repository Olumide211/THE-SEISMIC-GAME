import React from 'react';
import {C, FONT, label, num} from '../ui/theme';
import {CoinIcon} from '../ui/coins';
import {SpendaMark} from '../ui/Logo';
import * as I from '../ui/icons';

/* Phone screens for Spenda Race. Every screen is 860x1860 CSS (rendered 2x) and mapped onto
   the glass of a 3D phone. Fixed anchors (exported) are where the 3D layer adds taps,
   live digits, lifted buttons and flying chips. */

export const PW = 860;
export const PH = 1860;
export const ANCHOR = {
  sellBtn: {x: 430, y: 1600, w: 768, h: 128},
  withdrawBtn: {x: 430, y: 1560, w: 768, h: 128},
  timer: {x: 430, y: 525, size: 200},
  spinner: {x: 430, y: 820, r: 92},
  airtime: {x: 236, y: 880},
  electricity: {x: 624, y: 880},
  notif: {x: 430, y: 640, w: 790, h: 230},
};

const RED = C.red;
const P2P = {bg: '#1C1C1E', card: '#2A2A2D', card2: '#333337', line: '#3A3A3E', text: '#D8D8DC', dim: '#8E8E93', yellow: '#C9A227'};

const Screen: React.FC<{children: React.ReactNode; bg?: string; style?: React.CSSProperties}> = ({children, bg = C.surface, style}) => (
  <div style={{width: PW, height: PH, background: bg, position: 'relative', overflow: 'hidden', fontFamily: FONT, color: C.text, ...style}}>{children}</div>
);

const StatusBar: React.FC<{dark?: boolean; time?: string}> = ({time = '09:41'}) => (
  <div style={{display: 'flex', alignItems: 'center', height: 104, padding: '0 54px', fontSize: 30, fontWeight: 600}}>
    <div>{time}</div>
    <div style={{flex: 1}} />
    <div style={{display: 'flex', gap: 5, alignItems: 'flex-end', marginRight: 16}}>
      {[10, 16, 22, 28].map((h) => (
        <div key={h} style={{width: 7, height: h, background: '#ddd', borderRadius: 2}} />
      ))}
    </div>
    <div style={{width: 58, height: 30, borderRadius: 10, border: '2px solid #888', position: 'relative'}}>
      <div style={{position: 'absolute', inset: 3, right: 14, background: '#ddd', borderRadius: 5}} />
    </div>
  </div>
);

const Head: React.FC<{title: string; back?: boolean; right?: React.ReactNode}> = ({title, back = true, right}) => (
  <div style={{display: 'flex', alignItems: 'center', height: 110, padding: '0 46px', gap: 20}}>
    {back && <div style={{fontSize: 44, color: C.grey, transform: 'rotate(90deg)'}}><I.IChevron size={40} color={C.grey} /></div>}
    <div style={{flex: 1, textAlign: 'center', fontSize: 36, fontWeight: 500, marginRight: back ? 60 : 0}}>{title}</div>
    {right}
  </div>
);

const WhiteBtn: React.FC<{children: React.ReactNode; top: number}> = ({children, top}) => (
  <div
    style={{
      position: 'absolute',
      left: 46,
      right: 46,
      top,
      height: 128,
      borderRadius: 30,
      background: '#FFFFFF',
      color: '#0B0B0B',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 40,
      fontWeight: 600,
    }}
  >
    {children}
  </div>
);

const Card: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{background: C.card, border: `1px solid ${C.line}`, borderRadius: 32, ...style}}>{children}</div>
);

/* ====================================================================== SPENDA */

export const SpSplash = () => (
  <Screen bg="#050505">
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40}}>
      <div style={{filter: 'drop-shadow(0 0 40px rgba(255,255,255,0.65)) drop-shadow(0 0 90px rgba(255,255,255,0.35))'}}>
        <SpendaMark height={300} />
      </div>
    </div>
  </Screen>
);

export const SpSell = () => (
  <Screen>
    <StatusBar />
    <Head title="Sell" />
    <div style={{padding: '30px 46px'}}>
      <div style={{...label, fontSize: 28, marginBottom: 18}}>You sell</div>
      <Card style={{padding: '40px 40px', display: 'flex', alignItems: 'center', gap: 24}}>
        <CoinIcon sym="USDT" size={84} />
        <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
          <div style={{fontSize: 34, fontWeight: 600}}>USDT</div>
          <div style={{...label, fontSize: 24}}>Tether · TRC20</div>
        </div>
        <div style={{flex: 1}} />
        <div style={{...num, fontSize: 96}}>100</div>
      </Card>
      <div style={{display: 'flex', justifyContent: 'center', margin: '28px 0'}}>
        <div style={{width: 84, height: 84, borderRadius: 84, background: C.card, border: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <I.IArrowDown size={40} color={C.white} />
        </div>
      </div>
      <div style={{...label, fontSize: 28, marginBottom: 18}}>You receive</div>
      <Card style={{padding: '40px 40px', display: 'flex', alignItems: 'center', gap: 24}}>
        <CoinIcon sym="NGN" size={84} />
        <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
          <div style={{fontSize: 34, fontWeight: 600}}>Naira</div>
          <div style={{...label, fontSize: 24}}>To your bank</div>
        </div>
        <div style={{flex: 1}} />
        <div style={{...num, fontSize: 68}}>₦135,720</div>
      </Card>
      <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 40, fontSize: 28}}>
        <div style={{color: C.grey}}>Rate</div>
        <div style={num}>1 USDT = ₦1,357.20</div>
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 22, fontSize: 28}}>
        <div style={{color: C.grey}}>Fee</div>
        <div style={num}>₦0</div>
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 22, fontSize: 28}}>
        <div style={{color: C.grey}}>Arrives</div>
        <div style={num}>In seconds</div>
      </div>
    </div>
    <WhiteBtn top={ANCHOR.sellBtn.y - 64}>Sell 100 USDT</WhiteBtn>
  </Screen>
);

const Qr = () => {
  // deterministic pseudo-QR
  const cells: React.ReactNode[] = [];
  let s = 1337;
  for (let y = 0; y < 25; y++)
    for (let x = 0; x < 25; x++) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      const finder = (x < 7 && y < 7) || (x > 17 && y < 7) || (x < 7 && y > 17);
      const ring = finder && (x % 6 === 0 || y % 6 === 0 || (x > 17 && (x - 18) % 6 === 0) || (y > 17 && (y - 18) % 6 === 0) || [2, 3, 4].includes(x % 18 > 6 ? x - 18 : x) && [2, 3, 4].includes(y % 18 > 6 ? y - 18 : y));
      const on = finder ? ring : (s >> 7) % 2 === 0;
      if (on) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />);
    }
  return (
    <svg width={400} height={400} viewBox="0 0 25 25" style={{background: '#fff', borderRadius: 24, padding: 22}} fill="#0B0B0B" shapeRendering="crispEdges">
      {cells}
    </svg>
  );
};

export const SpDeposit = () => (
  <Screen>
    <StatusBar />
    <Head title="Deposit USDT" />
    <div style={{padding: '20px 46px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{display: 'flex', gap: 14, marginBottom: 40}}>
        {['TRC20', 'BEP20', 'ERC20'].map((n, i) => (
          <div key={n} style={{fontSize: 26, fontWeight: 500, padding: '14px 28px', borderRadius: 100, background: i === 0 ? '#fff' : C.card, color: i === 0 ? '#0B0B0B' : C.grey}}>
            {n}
          </div>
        ))}
      </div>
      <Qr />
      <div style={{...label, fontSize: 26, marginTop: 50, alignSelf: 'flex-start'}}>Your USDT address</div>
      <Card style={{marginTop: 18, padding: '34px 34px', width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 20}}>
        <div style={{...num, fontSize: 30, lineHeight: 1.4, flex: 1, letterSpacing: '0.01em'}}>TQ7x9Kp2mW4n…Rv3sZ8aB1cY6</div>
        <div style={{width: 70, height: 70, borderRadius: 20, background: C.cardHi, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <I.IDoc size={34} color={C.white} />
        </div>
      </Card>
      <div
        style={{
          marginTop: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '20px 40px',
          borderRadius: 100,
          background: '#FFFFFF',
          color: '#0B0B0B',
          fontSize: 34,
          fontWeight: 600,
        }}
      >
        Copied <I.ICheck size={34} color="#0B0B0B" stroke={3} />
      </div>
      <div style={{...label, fontSize: 24, marginTop: 50, textAlign: 'center', lineHeight: 1.5}}>
        Send only USDT on TRC20. Auto-converts to Naira
        <br />
        the moment it lands.
      </div>
    </div>
  </Screen>
);

export const SpReceived = () => (
  <Screen>
    <StatusBar />
    <Head title="Deposit" />
    <div style={{position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div
        style={{
          width: 260,
          height: 260,
          borderRadius: 260,
          border: `14px solid ${C.green}`,
          boxShadow: `0 0 80px rgba(34,197,94,0.55), inset 0 0 40px rgba(34,197,94,0.25)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#06140B',
        }}
      >
        <I.ICheck size={150} color={C.green} stroke={3.2} />
      </div>
      <div style={{...num, fontSize: 96, marginTop: 70, color: C.greenHi}}>100 USDT</div>
      <div style={{fontSize: 48, fontWeight: 500, marginTop: 10}}>received</div>
      <div style={{...label, fontSize: 28, marginTop: 30}}>TRC20 · 1 confirmation · just now</div>
      <Card style={{marginTop: 80, padding: '32px 40px', width: 768, boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 20}}>
        <I.IBolt size={40} color={C.green} />
        <div style={{fontSize: 30}}>Converting to Naira…</div>
        <div style={{flex: 1}} />
        <div style={{...num, fontSize: 30, color: C.grey}}>auto</div>
      </Card>
    </div>
  </Screen>
);

export const SpConvert = () => (
  <Screen>
    <StatusBar />
    <Head title="Withdraw" />
    <div style={{padding: '20px 46px'}}>
      <Card style={{padding: '44px 40px', borderColor: 'rgba(34,197,94,0.5)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <I.IBolt size={36} color={C.green} />
          <div style={{fontSize: 30, color: C.greenHi, fontWeight: 500}}>Auto-converted</div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 26, marginTop: 44}}>
          <CoinIcon sym="USDT" size={76} />
          <div style={{...num, fontSize: 64}}>100 USDT</div>
        </div>
        <div style={{margin: '26px 0 26px 22px'}}>
          <I.IArrowDown size={44} color={C.grey} />
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
          <CoinIcon sym="NGN" size={76} />
          <div style={{...num, fontSize: 84, color: C.white}}>₦135,720</div>
        </div>
        <div style={{height: 1, background: C.line, margin: '44px 0 30px'}} />
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 28}}>
          <div style={{color: C.grey}}>Rate</div>
          <div style={num}>₦1,357.20</div>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 28, marginTop: 18}}>
          <div style={{color: C.grey}}>Fee</div>
          <div style={num}>₦0</div>
        </div>
      </Card>
      <div style={{...label, fontSize: 26, margin: '50px 0 18px'}}>Send to</div>
      <Card style={{padding: '30px 34px', display: 'flex', alignItems: 'center', gap: 24}}>
        <div style={{width: 80, height: 80, borderRadius: 80, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <I.IBank size={40} color="#0B0B0B" />
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
          <div style={{fontSize: 32, fontWeight: 500}}>OPay</div>
          <div style={{...label, fontSize: 26}}>Breeze · 904****867</div>
        </div>
        <div style={{flex: 1}} />
        <I.ICheck size={36} color={C.white} stroke={2.6} />
      </Card>
    </div>
    {/* the Withdraw button is a separate 3D slab sitting in this slot */}
    <div style={{position: 'absolute', left: 46, right: 46, top: ANCHOR.withdrawBtn.y - 64, height: 128, borderRadius: 30, background: '#050505', boxShadow: 'inset 0 0 0 1px #1F1F1F'}} />
  </Screen>
);

export const SpWithdrawBtn = () => (
  <div
    style={{
      width: ANCHOR.withdrawBtn.w,
      height: ANCHOR.withdrawBtn.h,
      borderRadius: 30,
      background: '#FFFFFF',
      color: '#0B0B0B',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      fontSize: 40,
      fontWeight: 600,
      fontFamily: FONT,
    }}
  >
    <I.IBank size={40} color="#0B0B0B" /> Withdraw to bank
  </div>
);

export const SpLock = () => (
  <Screen bg="#030303" style={{backgroundImage: 'radial-gradient(90% 60% at 50% 0%, #1b1b1b 0%, #050505 70%)'}}>
    <StatusBar />
    <div style={{textAlign: 'center', marginTop: 40}}>
      <div style={{...label, fontSize: 34, color: '#CFCFCF'}}>Friday, 17 October</div>
      <div style={{...num, fontSize: 210, fontWeight: 500, letterSpacing: '-0.04em', marginTop: -4}}>09:41</div>
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 70, display: 'flex', justifyContent: 'space-between', padding: '0 90px'}}>
      {[I.IBolt, I.ICard].map((Ic, i) => (
        <div key={i} style={{width: 100, height: 100, borderRadius: 100, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Ic size={44} color={C.white} />
        </div>
      ))}
    </div>
  </Screen>
);

export const Notif = () => (
  <div
    style={{
      width: ANCHOR.notif.w,
      height: ANCHOR.notif.h,
      borderRadius: 44,
      background: 'linear-gradient(180deg, rgba(58,58,60,0.97), rgba(36,36,38,0.97))',
      boxSizing: 'border-box',
      padding: '30px 34px',
      fontFamily: FONT,
      color: C.text,
      display: 'flex',
      gap: 26,
      alignItems: 'center',
    }}
  >
    <div style={{width: 96, height: 96, borderRadius: 26, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 0 0 3px ${C.green}`}}>
      <I.IBank size={52} color="#0B0B0B" />
    </div>
    <div style={{display: 'flex', flexDirection: 'column', gap: 8, flex: 1}}>
      <div style={{display: 'flex', alignItems: 'center'}}>
        <div style={{fontSize: 26, color: '#BDBDBD', fontWeight: 500, letterSpacing: '0.02em'}}>OPAY</div>
        <div style={{flex: 1}} />
        <div style={{fontSize: 24, color: '#9A9A9A'}}>now</div>
      </div>
      <div style={{fontSize: 36, fontWeight: 600}}>
        🔔 Credit Alert: <span style={{...num, color: C.greenHi, fontWeight: 600}}>₦135,720.00</span>
      </div>
      <div style={{fontSize: 24, color: '#A8A8A8'}}>Acct 904****867 · from Spenda</div>
    </div>
  </div>
);

export const SpBills = () => (
  <Screen>
    <StatusBar />
    <Head title="Spend" back={false} />
    <div style={{padding: '10px 46px'}}>
      <Card style={{padding: '40px 40px'}}>
        <div style={{...label, fontSize: 28}}>Naira balance</div>
        <div style={{...num, fontSize: 92, marginTop: 10}}>₦135,720.00</div>
        <div style={{marginTop: 18, display: 'inline-block', ...num, fontSize: 26, color: C.greenHi, background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.45)', borderRadius: 100, padding: '10px 22px'}}>
          Withdrawn in 9s
        </div>
      </Card>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 40}}>
        {[
          ['Airtime', I.IBolt],
          ['Electricity', I.IBolt],
          ['Data', I.IArrowUp],
          ['Cable TV', I.ICard],
        ].map(([n, Ic]: any, i) => (
          <Card key={n} style={{height: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22}}>
            <div style={{width: 110, height: 110, borderRadius: 110, background: i < 2 ? '#FFFFFF' : C.cardHi, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              {i === 0 ? <span style={{fontSize: 52, color: '#0B0B0B'}}>☎</span> : <Ic size={52} color={i < 2 ? '#0B0B0B' : C.white} />}
            </div>
            <div style={{fontSize: 32, fontWeight: 500}}>{n}</div>
          </Card>
        ))}
      </div>
      <div style={{...label, fontSize: 26, margin: '44px 0 10px'}}>Recent</div>
      {[
        ['Withdrawal to OPay', '₦135,720.00'],
        ['100 USDT converted', '+₦135,720.00'],
      ].map(([a, b]) => (
        <div key={a} style={{display: 'flex', alignItems: 'center', padding: '24px 0', borderBottom: `1px solid ${C.line}`, fontSize: 30}}>
          <div>{a}</div>
          <div style={{flex: 1}} />
          <div style={{...num, color: b.startsWith('+') ? C.green : C.text}}>{b}</div>
        </div>
      ))}
    </div>
  </Screen>
);

export const Chip: React.FC<{text: string}> = ({text}) => (
  <div
    style={{
      height: 104,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 18,
      padding: '0 40px 0 22px',
      borderRadius: 104,
      background: 'linear-gradient(180deg, #2BD468, #16A34A)',
      color: '#03140A',
      fontFamily: FONT,
      fontSize: 40,
      fontWeight: 600,
      boxSizing: 'border-box',
      whiteSpace: 'nowrap',
    }}
  >
    <div style={{width: 64, height: 64, borderRadius: 64, background: '#03140A', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <I.ICheck size={40} color={C.greenHi} stroke={3} />
    </div>
    {text}
  </div>
);

export const SpSent = () => (
  <Screen>
    <StatusBar />
    <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{width: 240, height: 240, borderRadius: 240, border: `14px solid ${C.green}`, boxShadow: '0 0 80px rgba(34,197,94,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#06140B'}}>
        <I.ICheck size={140} color={C.green} stroke={3.2} />
      </div>
      <div style={{fontSize: 56, fontWeight: 600, marginTop: 70}}>Transfer sent</div>
      <div style={{...num, fontSize: 104, marginTop: 24}}>₦135,720.00</div>
      <div style={{...label, fontSize: 30, marginTop: 20}}>to OPay · Breeze · 904****867</div>
      <Card style={{marginTop: 80, width: 768, boxSizing: 'border-box', padding: '34px 40px'}}>
        {[
          ['From', '100 USDT'],
          ['Rate', '₦1,357.20'],
          ['Fee', '₦0'],
          ['Total time', '9 seconds'],
        ].map(([a, b]) => (
          <div key={a} style={{display: 'flex', justifyContent: 'space-between', fontSize: 30, padding: '14px 0'}}>
            <div style={{color: C.grey}}>{a}</div>
            <div style={{...num, color: a === 'Total time' ? C.greenHi : C.text}}>{b}</div>
          </div>
        ))}
      </Card>
    </div>
    <div style={{position: 'absolute', left: 46, right: 46, bottom: 90, display: 'flex', gap: 24}}>
      <div style={{flex: 1, height: 120, borderRadius: 30, border: `2px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36}}>View Receipt</div>
      <div style={{flex: 1, height: 120, borderRadius: 30, background: '#fff', color: '#0B0B0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 600}}>Done</div>
    </div>
  </Screen>
);

/* ====================================================================== GENERIC P2P (cluttered, grey) */

const P2PTop: React.FC<{title: string}> = ({title}) => (
  <>
    <StatusBar />
    <div style={{display: 'flex', alignItems: 'center', height: 100, padding: '0 36px', gap: 18, background: P2P.card}}>
      <div style={{fontSize: 34, fontWeight: 700, color: P2P.text}}>P2P</div>
      <div style={{fontSize: 26, color: P2P.dim, background: P2P.card2, padding: '6px 14px', borderRadius: 8}}>{title}</div>
      <div style={{flex: 1}} />
      {[I.ISearch, I.IFilter, I.IBell].map((Ic, i) => (
        <Ic key={i} size={34} color={P2P.dim} />
      ))}
    </div>
    <div style={{background: '#3A2A12', color: P2P.yellow, fontSize: 22, padding: '12px 36px', display: 'flex', gap: 12}}>
      ⚠ Beware of scammers. Never release crypto before confirming payment!
    </div>
  </>
);

export const P2pSell = () => (
  <Screen bg={P2P.bg}>
    <P2PTop title="Express" />
    <div style={{display: 'flex', margin: '20px 36px', background: P2P.card, borderRadius: 14, overflow: 'hidden'}}>
      {['Buy', 'Sell', 'Orders', 'Ads'].map((t, i) => (
        <div key={t} style={{flex: 1, textAlign: 'center', padding: '20px 0', fontSize: 28, background: i === 1 ? '#4A4A4F' : 'transparent', color: i === 1 ? '#fff' : P2P.dim}}>
          {t}
        </div>
      ))}
    </div>
    <div style={{padding: '10px 36px', color: P2P.text}}>
      <div style={{fontSize: 24, color: P2P.dim}}>Amount (USDT)</div>
      <div style={{background: P2P.card, borderRadius: 14, padding: '26px 28px', marginTop: 12, display: 'flex', fontSize: 52, ...num}}>
        100 <div style={{flex: 1}} /> <span style={{fontSize: 26, color: P2P.dim, alignSelf: 'center'}}>USDT ▾</span>
      </div>
      <div style={{fontSize: 24, color: P2P.dim, marginTop: 26}}>Payment method</div>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12}}>
        {['Bank Transfer', 'Opay', 'Palmpay', 'Kuda', 'Moniepoint', '+6 more'].map((b, i) => (
          <div key={b} style={{fontSize: 22, padding: '10px 18px', borderRadius: 8, border: `1px solid ${P2P.line}`, color: i === 0 ? '#fff' : P2P.dim, background: i === 0 ? '#4A4A4F' : 'transparent'}}>
            {b}
          </div>
        ))}
      </div>
      <div style={{background: P2P.card, borderRadius: 14, padding: '24px 28px', marginTop: 28, fontSize: 24, color: P2P.dim, lineHeight: 1.7}}>
        Price ₦1,349.50 – ₦1,371.00 · varies by merchant
        <br />
        Est. receive ≈ ₦134,950 – ₦137,100*
        <br />
        <span style={{color: RED}}>*Payment window 15–45 min</span>
      </div>
      <div style={{display: 'flex', gap: 12, marginTop: 24}}>
        {['KYC Lv.2 required', 'Limit ₦500k/day', 'Tier 1'].map((b) => (
          <div key={b} style={{fontSize: 20, padding: '8px 14px', borderRadius: 6, background: P2P.card2, color: P2P.dim}}>
            {b}
          </div>
        ))}
      </div>
      <div style={{marginTop: 30, height: 200, borderRadius: 14, background: 'linear-gradient(90deg,#33333a,#2a2a30)', display: 'flex', alignItems: 'center', padding: '0 30px', fontSize: 26, color: P2P.dim}}>
        AD · Trade futures with 125x leverage →
      </div>
    </div>
    <div style={{position: 'absolute', left: 46, right: 46, top: ANCHOR.sellBtn.y - 64, height: 128, borderRadius: 16, background: '#5A5A60', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 600}}>
      Sell 100 USDT
    </div>
  </Screen>
);

const VENDORS: [string, string, string, string, boolean][] = [
  ['CryptoKing_NG', '1,363.00', '98.1% · 2,301 orders', '15 min', true],
  ['FastNaira247', '1,361.50', '94.0% · 812 orders', '30 min', false],
  ['Mr_Tobi_Trades', '1,360.00', '88.7% · 190 orders', '45 min', false],
  ['Blessing_USDT', '1,358.80', '96.2% · 1,044 orders', '15 min', true],
  ['NairaPlug', '1,355.00', '79.4% · 67 orders', '30 min', false],
  ['OgaVendor', '1,352.25', '91.0% · 403 orders', '45 min', false],
];

export const P2pVendors = () => (
  <Screen bg={P2P.bg}>
    <P2PTop title="Select merchant" />
    <div style={{display: 'flex', gap: 12, padding: '18px 36px', fontSize: 22, color: P2P.dim}}>
      {['Price ▾', 'Completion ▾', 'Online only', 'Verified'].map((b) => (
        <div key={b} style={{padding: '8px 14px', border: `1px solid ${P2P.line}`, borderRadius: 6}}>
          {b}
        </div>
      ))}
    </div>
    {VENDORS.map(([n, p, s, w, on], i) => (
      <div key={n} style={{margin: '0 36px 14px', background: i === 1 ? '#3A3A3F' : P2P.card, borderRadius: 14, padding: '22px 24px', color: P2P.text, border: i === 1 ? '2px solid #777' : 'none'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <div style={{width: 52, height: 52, borderRadius: 52, background: '#55555A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700}}>{n[0]}</div>
          <div style={{fontSize: 28, fontWeight: 600}}>{n}</div>
          <div style={{width: 12, height: 12, borderRadius: 12, background: on ? '#6b6' : '#777'}} />
          <div style={{flex: 1}} />
          <div style={{fontSize: 20, color: P2P.dim}}>{s}</div>
        </div>
        <div style={{display: 'flex', alignItems: 'baseline', marginTop: 12, gap: 10}}>
          <div style={{fontSize: 22, color: P2P.dim}}>₦</div>
          <div style={{...num, fontSize: 42}}>{p}</div>
          <div style={{flex: 1}} />
          <div style={{fontSize: 22, color: RED}}>⏱ {w}</div>
          <div style={{fontSize: 24, padding: '10px 22px', borderRadius: 8, background: '#5A5A60', color: '#fff', marginLeft: 14}}>Sell</div>
        </div>
        <div style={{fontSize: 20, color: P2P.dim, marginTop: 8}}>Limit ₦20,000 – ₦300,000 · Bank Transfer · Opay · Palmpay</div>
      </div>
    ))}
  </Screen>
);

const Bubble: React.FC<{me?: boolean; children: React.ReactNode; red?: boolean}> = ({me, children, red}) => (
  <div style={{display: 'flex', justifyContent: me ? 'flex-end' : 'flex-start', margin: '14px 36px'}}>
    <div
      style={{
        maxWidth: 600,
        padding: '22px 28px',
        borderRadius: 28,
        fontSize: 30,
        lineHeight: 1.35,
        background: me ? '#4A4A4F' : P2P.card,
        color: red ? '#FFD7D8' : P2P.text,
        border: red ? `2px solid ${RED}` : 'none',
        boxShadow: red ? `0 0 30px rgba(229,72,77,0.35)` : 'none',
      }}
    >
      {children}
    </div>
  </div>
);

export const P2pChat = () => (
  <Screen bg={P2P.bg}>
    <P2PTop title="Order chat" />
    <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '20px 36px', color: P2P.text, borderBottom: `1px solid ${P2P.line}`}}>
      <div style={{width: 60, height: 60, borderRadius: 60, background: '#55555A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700}}>F</div>
      <div>
        <div style={{fontSize: 28, fontWeight: 600}}>FastNaira247</div>
        <div style={{fontSize: 22, color: P2P.dim}}>Last seen 12 min ago</div>
      </div>
      <div style={{flex: 1}} />
      <div style={{fontSize: 26, color: RED, ...num}}>⏱ 39:59</div>
    </div>
    <div style={{textAlign: 'center', fontSize: 22, color: P2P.dim, margin: '24px 0'}}>Order #88310294 created · 100 USDT</div>
    <Bubble>Hello, I am online. Pls wait</Bubble>
    <Bubble me>Ok. How long?</Bubble>
    <Bubble>Pls dont cancel. Network is slow on my side</Bubble>
    <Bubble red>Send proof of payment 📸</Bubble>
    <Bubble me>I'm the seller… you send first?</Bubble>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 150, background: P2P.card, display: 'flex', alignItems: 'center', padding: '0 36px', gap: 20}}>
      <div style={{flex: 1, height: 86, borderRadius: 43, background: P2P.card2, color: P2P.dim, fontSize: 28, display: 'flex', alignItems: 'center', padding: '0 30px'}}>Type a message…</div>
      <div style={{fontSize: 44}}>📎</div>
    </div>
  </Screen>
);

export const P2pTimer = () => (
  <Screen bg={P2P.bg}>
    <P2PTop title="Order #88310294" />
    <div style={{textAlign: 'center', color: P2P.text, marginTop: 70}}>
      <div style={{fontSize: 34, color: P2P.dim}}>Waiting for buyer to pay</div>
      {/* live countdown drawn in 3D at ANCHOR.timer */}
      <div style={{height: 320}} />
      <div style={{fontSize: 26, color: P2P.dim}}>Order will auto-cancel when the timer ends</div>
    </div>
    <div style={{margin: '60px 36px 0', background: P2P.card, borderRadius: 14, padding: '30px 28px', color: P2P.text, fontSize: 28, lineHeight: 2}}>
      {[
        ['Amount', '100 USDT'],
        ['Price', '₦1,361.50'],
        ['You receive', '₦136,150'],
        ['Buyer', 'FastNaira247'],
        ['Status', 'UNPAID'],
      ].map(([a, b]) => (
        <div key={a} style={{display: 'flex'}}>
          <div style={{color: P2P.dim}}>{a}</div>
          <div style={{flex: 1}} />
          <div style={{...num, color: b === 'UNPAID' ? RED : P2P.text}}>{b}</div>
        </div>
      ))}
    </div>
    <div style={{display: 'flex', gap: 20, margin: '40px 36px'}}>
      <div style={{flex: 1, height: 110, borderRadius: 14, border: `2px solid ${P2P.line}`, color: P2P.dim, fontSize: 30, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Appeal</div>
      <div style={{flex: 1, height: 110, borderRadius: 14, background: '#3A3A3F', color: '#777', fontSize: 30, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Release crypto</div>
    </div>
  </Screen>
);

export const P2pOffline: React.FC<{timer?: string; stuck?: boolean}> = ({timer = '35:41', stuck}) => (
  <Screen bg={P2P.bg}>
    <P2PTop title="Order #88310294" />
    <div style={{margin: '60px 36px 0', borderRadius: 22, border: `3px solid ${RED}`, background: 'rgba(229,72,77,0.12)', padding: '50px 40px', textAlign: 'center', boxShadow: '0 0 60px rgba(229,72,77,0.3)'}}>
      <div style={{fontSize: 90}}>⚠</div>
      <div style={{fontSize: 56, fontWeight: 700, color: '#FF6B70', marginTop: 10}}>Seller is offline</div>
      <div style={{...num, fontSize: 110, color: RED, marginTop: 30}}>{timer}</div>
      <div style={{fontSize: 28, color: P2P.dim, marginTop: 20}}>No response from counterparty</div>
    </div>
    <div style={{margin: '50px 36px', background: P2P.card, borderRadius: 14, padding: '30px 28px', color: P2P.dim, fontSize: 28, lineHeight: 1.8}}>
      {stuck ? 'Your 100 USDT is locked in escrow until the order is resolved or the appeal is reviewed (24–72h).' : 'You can open an appeal after the payment window ends. Do not release crypto.'}
    </div>
    <div style={{margin: '0 36px', display: 'flex', gap: 20}}>
      <div style={{flex: 1, height: 110, borderRadius: 14, background: '#4A2224', color: '#FF8A8E', fontSize: 30, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Cancel order</div>
      <div style={{flex: 1, height: 110, borderRadius: 14, border: `2px solid ${P2P.line}`, color: P2P.dim, fontSize: 30, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Appeal</div>
    </div>
  </Screen>
);

export const P2pPending = () => (
  <Screen bg={P2P.bg}>
    <P2PTop title="Order #88310294" />
    <div style={{textAlign: 'center', color: P2P.text}}>
      {/* spinner drawn live in 3D at ANCHOR.spinner */}
      <div style={{height: 820 - 204 + 160}} />
      <div style={{fontSize: 52, fontWeight: 600}}>Payment pending…</div>
      <div style={{fontSize: 28, color: P2P.dim, marginTop: 20}}>Buyer marked as paid. Check your bank app.</div>
      <div style={{fontSize: 28, color: RED, marginTop: 14}}>Not received? Do NOT release.</div>
    </div>
    <div style={{margin: '60px 36px', background: P2P.card, borderRadius: 14, padding: '26px 28px', color: P2P.dim, fontSize: 26, lineHeight: 1.8}}>
      Bank: Opay · Ref: none provided
      <br />
      Screenshot: 1 image (unverified)
    </div>
  </Screen>
);

export const P2pLabel = () => (
  <div style={{width: 400, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 64, fontWeight: 500, letterSpacing: '0.2em', color: '#9A9A9A'}}>P2P</div>
);
