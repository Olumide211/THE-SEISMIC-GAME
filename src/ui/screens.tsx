import React from 'react';
import {C, FONT, label, num} from './theme';
import {CoinIcon} from './coins';
import {SpendaMark} from './Logo';
import * as I from './icons';

/* Every screen is a fixed-size block rendered to a PNG texture (scripts/render-textures.mjs)
   and mapped onto the front face of a slab in the 3D scene. */

const Page: React.FC<{w: number; h: number; children: React.ReactNode; bg?: string; radius?: number; style?: React.CSSProperties}> = ({
  w,
  h,
  children,
  bg = C.surface,
  radius = 0,
  style,
}) => (
  <div
    style={{
      width: w,
      height: h,
      background: bg,
      borderRadius: radius,
      overflow: 'hidden',
      position: 'relative',
      fontFamily: FONT,
      color: C.text,
      ...style,
    }}
  >
    {children}
  </div>
);

const Card: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{background: C.card, borderRadius: 18, border: `1px solid ${C.line}`, ...style}}>{children}</div>
);

const Stat: React.FC<{k: string; v: React.ReactNode; size?: number; color?: string}> = ({k, v, size = 30, color = C.white}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
    <div style={{...label, fontSize: 17}}>{k}</div>
    <div style={{...num, fontSize: size, color}}>{v}</div>
  </div>
);

const Divider = ({h = 56}: {h?: number}) => <div style={{width: 1, height: h, background: C.line}} />;

const GreenChip: React.FC<{children: React.ReactNode; size?: number}> = ({children, size = 18}) => (
  <div
    style={{
      ...num,
      fontSize: size,
      color: C.greenHi,
      background: 'rgba(34,197,94,0.14)',
      border: '1px solid rgba(34,197,94,0.45)',
      padding: '8px 16px',
      borderRadius: 100,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </div>
);

/* ------------------------------------------------------------------ sidebar */
const NAV: [string, (p: any) => JSX.Element][] = [
  ['Home', I.IHomeSolid],
  ['Wallet', I.IWallet],
  ['Card', I.ICard],
  ['Rewards', I.IGift],
  ['Profile', I.IUser],
];

const Sidebar: React.FC<{h: number}> = ({h}) => (
  <div
    style={{
      width: 112,
      height: h,
      background: '#080808',
      borderRight: `1px solid ${C.line}`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 34,
      gap: 18,
      flexShrink: 0,
    }}
  >
    <div style={{marginBottom: 30}}>
      <SpendaMark height={46} />
    </div>
    {NAV.map(([name, Icon], i) => (
      <div key={name} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
        <div
          style={{
            width: 62,
            height: 62,
            borderRadius: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: i === 0 ? '#262626' : 'transparent',
            border: i === 0 ? '1px solid #3A3A3A' : '1px solid transparent',
            color: i === 0 ? C.white : C.grey,
          }}
        >
          <Icon size={30} color={i === 0 ? C.white : C.grey} />
        </div>
        <div style={{fontSize: 14, color: i === 0 ? C.white : C.greyDim, fontWeight: i === 0 ? 500 : 400}}>{name}</div>
      </div>
    ))}
  </div>
);

/* ------------------------------------------------------------------ dashboard (shots 3-5) */
export const DEPOSIT_SLOT = {x: 152, y: 172, w: 420, h: 96}; // CSS px inside the 1600x900 dashboard

export const Dashboard: React.FC<{slot?: boolean}> = ({slot = true}) => (
  <Page w={1600} h={900} style={{display: 'flex'}}>
    <Sidebar h={900} />
    <div style={{flex: 1, padding: '34px 40px', display: 'flex', flexDirection: 'column', gap: 26}}>
      {/* header row */}
      <div style={{display: 'flex', alignItems: 'center', gap: 34, height: 112}}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '16px 24px',
            border: `1px solid ${C.line}`,
            borderRadius: 100,
            background: C.card,
          }}
        >
          <div style={{fontSize: 30, fontWeight: 500}}>Hi, Breeze</div>
          <div style={{fontSize: 28}}>👋</div>
        </div>
        <Stat k="Total Balance" v="₦2,450,000.00" size={38} />
        <Divider />
        <Stat k="USDT" v="1,805.40" />
        <Stat k="USDC" v="320.00" />
        <Divider />
        <GreenChip size={20}>+₦50,000 received</GreenChip>
        <div style={{flex: 1}} />
        <div style={{width: 54, height: 54, borderRadius: 54, border: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <I.IBell size={24} color={C.grey} />
        </div>
      </div>

      {/* action row: Deposit button lives in the slot (lifted in 3D) */}
      <div style={{display: 'flex', alignItems: 'center', gap: 34, height: 96}}>
        <div
          style={{
            width: DEPOSIT_SLOT.w,
            height: DEPOSIT_SLOT.h,
            borderRadius: 100,
            background: slot ? '#050505' : 'transparent',
            boxShadow: slot ? 'inset 0 2px 10px rgba(0,0,0,0.9), inset 0 0 0 1px #1F1F1F' : 'none',
          }}
        >
          {!slot && <DepositButtonInner />}
        </div>
        <Stat k="Rate" v="₦1,357.20 / USDT" size={28} />
        <Stat k="24H" v="+0.12%" size={28} color={C.greenHi} />
        <Stat k="Fee" v="₦0" size={28} />
        <Stat k="Settles in" v="3s" size={28} />
      </div>

      {/* Your Assets */}
      <Card style={{flex: 1, padding: '30px 34px', display: 'flex', flexDirection: 'column', gap: 20}}>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <div style={{fontSize: 44, fontWeight: 500, letterSpacing: '-0.02em'}}>Your Assets</div>
          <div style={{flex: 1}} />
          <div style={{...label, fontSize: 18}}>View all</div>
        </div>
        {[
          ['USDT', 'Tether', '1,805.40', '≈ ₦2,450,309'],
          ['USDC', 'USD Coin', '320.00', '≈ ₦434,304'],
          ['NGN', 'Naira', '₦2,450,000.00', 'Available'],
        ].map(([s, n, b, f]) => (
          <div key={s} style={{display: 'flex', alignItems: 'center', gap: 18, padding: '14px 0', borderTop: `1px solid ${C.line}`}}>
            <CoinIcon sym={s} size={44} />
            <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
              <div style={{fontSize: 22, fontWeight: 500}}>{s}</div>
              <div style={{...label, fontSize: 16}}>{n}</div>
            </div>
            <div style={{flex: 1}} />
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4}}>
              <div style={{...num, fontSize: 22}}>{b}</div>
              <div style={{...label, fontSize: 16}}>{f}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  </Page>
);

const DepositButtonInner: React.FC<{dark?: boolean}> = ({dark = false}) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      borderRadius: 100,
      boxSizing: 'border-box',
      background: dark ? 'linear-gradient(180deg, #1E1E1E, #0E0E0E)' : '#FFFFFF',
      border: dark ? '3px solid #D8D8D8' : 'none',
      color: dark ? '#FFFFFF' : '#0B0B0B',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14,
      fontSize: 30,
      fontWeight: 600,
      letterSpacing: '-0.01em',
    }}
  >
    <I.IPlus size={30} color={dark ? '#FFFFFF' : '#0B0B0B'} stroke={2.4} />
    Deposit Naira
    <span style={{width: 44, height: 44, borderRadius: 44, background: dark ? '#FFFFFF' : '#0B0B0B', color: dark ? '#0B0B0B' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 600}}>₦</span>
  </div>
);

export const DepositButton: React.FC<{dark?: boolean}> = ({dark}) => (
  <div style={{width: DEPOSIT_SLOT.w, height: DEPOSIT_SLOT.h, fontFamily: FONT}}>
    <DepositButtonInner dark={dark} />
  </div>
);

/* ------------------------------------------------------------------ assets table (shot 6) */
const ROWS: [string, string, string, string, string, boolean][] = [
  ['NGN', 'Nigerian Naira', '₦2,450,000.00', '₦1.00', '0.00%', true],
  ['USDT', 'Tether', '1,805.40', '₦1,357.20', '+0.12%', true],
  ['USDC', 'USD Coin', '320.00', '₦1,356.95', '+0.08%', true],
  ['BTC', 'Bitcoin', '0.0042', '₦152,400,000', '+2.4%', true],
  ['ETH', 'Ethereum', '0.185', '₦5,980,500', '+1.8%', true],
  ['SOL', 'Solana', '4.20', '₦265,140', '+3.1%', true],
  ['BNB', 'BNB', '0.62', '₦1,184,300', '+0.9%', true],
  ['TRX', 'TRON', '1,250.00', '₦468.40', '+0.4%', true],
];

export const ASSET_ROWS = ROWS.map((r) => r[0]);
export const ASSETS_LAYOUT = {head: 340, row: 80, padX: 48};
const GRID = '1.4fr 1fr 1fr 0.6fr';

export const AssetRow: React.FC<{i: number}> = ({i}) => {
  const [s, n, b, r, ch] = ROWS[i];
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: GRID,
        alignItems: 'center',
        padding: '0 8px',
        width: 1600 - ASSETS_LAYOUT.padX * 2,
        height: ASSETS_LAYOUT.row,
        borderBottom: `1px solid ${C.line}`,
        background: C.surface,
        fontFamily: FONT,
        color: C.text,
        boxSizing: 'border-box',
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
        <CoinIcon sym={s} size={44} />
        <div style={{fontSize: 24, fontWeight: 500}}>{s}</div>
        <div style={{...label, fontSize: 18}}>{n}</div>
      </div>
      <div style={{...num, fontSize: 24, textAlign: 'right'}}>{b}</div>
      <div style={{...num, fontSize: 24, textAlign: 'right'}}>{r}</div>
      <div style={{...num, fontSize: 22, textAlign: 'right', color: ch.startsWith('+') ? C.green : C.grey}}>{ch}</div>
    </div>
  );
};

export const AssetsTable: React.FC<{rows?: boolean}> = ({rows = true}) => (
  <Page w={1600} h={1000} style={{padding: `40px ${ASSETS_LAYOUT.padX}px 0`}}>
    <div style={{height: ASSETS_LAYOUT.head - 40, display: 'flex', flexDirection: 'column'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
        <div style={{fontSize: 52, fontWeight: 600, letterSpacing: '-0.02em'}}>Assets</div>
        <div style={{flex: 1}} />
        <div
          style={{
            width: 420,
            height: 60,
            borderRadius: 100,
            background: C.card,
            border: `1px solid ${C.line}`,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '0 22px',
            color: C.greyDim,
            fontSize: 20,
          }}
        >
          <I.ISearch size={22} color={C.grey} /> Search assets
        </div>
      </div>
      <div style={{display: 'flex', gap: 12, marginTop: 28}}>
        {['All', 'Stablecoins', 'Crypto', 'Fiat'].map((t, i) => (
          <div
            key={t}
            style={{
              fontSize: 20,
              fontWeight: 500,
              padding: '12px 26px',
              borderRadius: 100,
              background: i === 0 ? '#FFFFFF' : C.card,
              color: i === 0 ? '#0B0B0B' : C.grey,
              border: i === 0 ? 'none' : `1px solid ${C.line}`,
            }}
          >
            {t}
          </div>
        ))}
      </div>
      <div style={{flex: 1}} />
      <div style={{display: 'grid', gridTemplateColumns: GRID, padding: '0 8px 16px', ...label, fontSize: 18, borderBottom: `1px solid ${C.line}`}}>
        <div>Asset</div>
        <div style={{textAlign: 'right'}}>Balance</div>
        <div style={{textAlign: 'right'}}>Rate (₦)</div>
        <div style={{textAlign: 'right'}}>24H</div>
      </div>
    </div>
    {rows && ROWS.map((_, i) => <AssetRow key={i} i={i} />)}
  </Page>
);

/* ------------------------------------------------------------------ convert (shot 8) */
// arrow anchor (CSS px) where the 3D line lands between From and To
export const CONVERT_ARROW = {x: 800, y: 405, x0: 730, x1: 870};

export const Convert = () => (
  <Page w={1600} h={1000} style={{padding: '40px 56px'}}>
    <div style={{display: 'flex', alignItems: 'center', height: 60}}>
      <div style={{fontSize: 48, fontWeight: 600, letterSpacing: '-0.02em'}}>Convert</div>
      <div style={{flex: 1}} />
      <div style={{...label, fontSize: 20, display: 'flex', alignItems: 'center', gap: 10}}>
        <I.IBolt size={22} color={C.green} /> Instant · No P2P
      </div>
    </div>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 22, marginTop: 30, height: 120}}>
      {[
        ['Converted Today', '₦50,000'],
        ['Time', '3s'],
        ['Fee', '₦0'],
      ].map(([k, v]) => (
        <Card key={k} style={{padding: '24px 28px', boxSizing: 'border-box', height: 120}}>
          <Stat k={k} v={v} size={40} color={k === 'Fee' ? C.greenHi : C.white} />
        </Card>
      ))}
    </div>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 140px 1fr', alignItems: 'center', marginTop: 40, height: 230}}>
      <Card style={{padding: '30px 32px', height: 230, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <div style={{...label, fontSize: 20}}>From</div>
          <div style={{flex: 1}} />
          <CoinIcon sym="NGN" size={40} />
          <div style={{fontSize: 24, fontWeight: 600}}>NGN</div>
          <I.IChevron size={22} color={C.grey} />
        </div>
        <div style={{...num, fontSize: 64}}>50,000.00</div>
        <div style={{...label, fontSize: 18}}>Balance ₦2,450,000.00</div>
      </Card>
      <div />
      <Card style={{padding: '30px 32px', height: 230, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderColor: 'rgba(34,197,94,0.5)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <div style={{...label, fontSize: 20}}>To</div>
          <div style={{flex: 1}} />
          <CoinIcon sym="USDT" size={40} />
          <div style={{fontSize: 24, fontWeight: 600}}>USDT</div>
          <I.IChevron size={22} color={C.grey} />
        </div>
        <div style={{...num, fontSize: 64, color: C.white}}>36.85</div>
        <div style={{...label, fontSize: 18}}>Balance 1,805.40 USDT</div>
      </Card>
    </div>
    <div style={{display: 'flex', alignItems: 'center', marginTop: 30, padding: '0 6px', fontSize: 22}}>
      <div style={{...num, color: C.grey}}>1 USDT ≈ ₦1,357</div>
      <div style={{flex: 1}} />
      <div style={{color: C.grey}}>Fee</div>
      <div style={{...num, color: C.greenHi, marginLeft: 12}}>₦0</div>
    </div>
    <div
      style={{
        marginTop: 30,
        height: 100,
        borderRadius: 100,
        background: '#FFFFFF',
        color: '#0B0B0B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 36,
        fontWeight: 600,
      }}
    >
      Convert
    </div>
  </Page>
);

/* ------------------------------------------------------------------ portfolio (shot 9) */
export const PORTFOLIO_DONUT = {cx: 380, cy: 470, r: 175}; // CSS px

export const Portfolio = () => (
  <Page w={760} h={1060} style={{padding: '36px 40px'}}>
    <div style={{display: 'flex', alignItems: 'center'}}>
      <div style={{fontSize: 38, fontWeight: 600, letterSpacing: '-0.02em'}}>Portfolio</div>
      <div style={{flex: 1}} />
      <div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, color: C.grey, border: `1px solid ${C.line}`, borderRadius: 100, padding: '8px 16px'}}>
        <I.IFilter size={18} color={C.grey} /> Filter
      </div>
    </div>
    <div style={{display: 'flex', gap: 26, marginTop: 20, fontSize: 19}}>
      <div style={{color: C.white, fontWeight: 500, paddingBottom: 10, borderBottom: '2px solid #fff'}}>Stablecoins</div>
      <div style={{color: C.greyDim, paddingBottom: 10}}>Naira</div>
    </div>
    <div style={{position: 'absolute', left: 40, right: 40, bottom: 36}}>
      <div style={{display: 'flex', alignItems: 'flex-end', marginBottom: 22}}>
        <Stat k="Total value" v="₦2,450,000.00" size={36} />
        <div style={{flex: 1}} />
        <div style={{...num, fontSize: 28, color: C.greenHi}}>+2.04%</div>
      </div>
      {[
        ['USDT', '60%', '₦1,470,000', C.green],
        ['USDC', '25%', '₦612,500', C.greenHi],
        ['NGN', '15%', '₦367,500', '#F5F5F5'],
      ].map(([s, p, v, col]) => (
        <div key={s} style={{display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderTop: `1px solid ${C.line}`, fontSize: 20}}>
          <div style={{width: 12, height: 12, borderRadius: 12, background: col}} />
          <div style={{fontWeight: 500}}>{s}</div>
          <div style={{flex: 1}} />
          <div style={{...num, color: C.grey}}>{v}</div>
          <div style={{...num, width: 70, textAlign: 'right'}}>{p}</div>
        </div>
      ))}
    </div>
  </Page>
);

/* ------------------------------------------------------------------ statement (shot 10) */
const Field: React.FC<{k: string; v: string; icon?: React.ReactNode}> = ({k, v, icon}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
    <div style={{...label, fontSize: 20}}>{k}</div>
    <div
      style={{
        height: 76,
        borderRadius: 16,
        background: C.card,
        border: `1px solid ${C.line}`,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '0 24px',
        fontSize: 26,
        fontWeight: 500,
      }}
    >
      {icon}
      {v}
      <div style={{flex: 1}} />
      <I.IChevron size={24} color={C.grey} />
    </div>
  </div>
);

export const Statement = () => (
  <Page w={1500} h={900} style={{padding: '44px 56px'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
      <I.IDoc size={40} color={C.white} />
      <div style={{fontSize: 50, fontWeight: 600, letterSpacing: '-0.02em'}}>Account Statement</div>
    </div>
    <div style={{...label, fontSize: 22, marginTop: 12}}>Every naira and stablecoin movement, in one file.</div>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginTop: 46}}>
      <Field k="Timeline" v="Last 1 month" icon={<I.ICalendar size={26} color={C.grey} />} />
      <Field k="Transaction type" v="All" />
      <Field k="Account" v="Breeze · NGN + Stablecoins" />
      <Field k="Format" v="PDF" />
    </div>
    <div
      style={{
        marginTop: 56,
        height: 100,
        borderRadius: 100,
        background: '#FFFFFF',
        color: '#0B0B0B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        fontSize: 34,
        fontWeight: 600,
      }}
    >
      <I.IDownload size={34} color="#0B0B0B" stroke={2.4} /> Download
    </div>
  </Page>
);

/* ------------------------------------------------------------------ settings (shot 11) */
const Toggle: React.FC<{on: boolean}> = ({on}) => (
  <div
    style={{
      width: 92,
      height: 52,
      borderRadius: 52,
      background: on ? C.green : '#2E2E2E',
      boxShadow: on ? '0 0 22px rgba(34,197,94,0.55)' : 'none',
      position: 'relative',
    }}
  >
    <div style={{position: 'absolute', top: 5, left: on ? 45 : 5, width: 42, height: 42, borderRadius: 42, background: '#fff'}} />
  </div>
);

const SetRow: React.FC<{icon: React.ReactNode; k: string; sub: string; right: React.ReactNode}> = ({icon, k, sub, right}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 24, height: 132, borderBottom: `1px solid ${C.line}`}}>
    <div style={{width: 66, height: 66, borderRadius: 18, background: C.card, border: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {icon}
    </div>
    <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
      <div style={{fontSize: 30, fontWeight: 500}}>{k}</div>
      <div style={{...label, fontSize: 20}}>{sub}</div>
    </div>
    <div style={{flex: 1}} />
    {right}
  </div>
);

export const Settings: React.FC<{dark: boolean; twofa: boolean}> = ({dark, twofa}) => (
  <Page w={1000} h={900} style={{padding: '44px 56px'}}>
    <div style={{fontSize: 48, fontWeight: 600, letterSpacing: '-0.02em'}}>Security</div>
    <div style={{...label, fontSize: 22, marginTop: 10, marginBottom: 20}}>Settings · Breeze</div>
    <SetRow icon={<I.IMoon size={32} color={C.white} />} k="Dark Mode" sub="Appearance" right={<Toggle on={dark} />} />
    <SetRow icon={<I.ILock size={32} color={twofa ? C.greenHi : C.white} />} k="Two-Factor Authentication" sub="Authenticator app" right={<Toggle on={twofa} />} />
    <SetRow icon={<I.IKey size={32} color={C.white} />} k="Transaction PIN" sub="Required for every transfer" right={<div style={{...num, fontSize: 40, letterSpacing: '0.2em', color: C.white}}>•••••</div>} />
    <SetRow
      icon={<I.IFinger size={32} color={C.white} />}
      k="Biometric login"
      sub="Face / fingerprint"
      right={
        <div style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 24, color: C.greenHi, fontWeight: 500}}>
          <I.ICheck size={26} color={C.greenHi} stroke={2.4} /> Enabled
        </div>
      }
    />
  </Page>
);

/* ------------------------------------------------------------------ transactions (behind settings + phone) */
const TX: [string, string, string, boolean][] = [
  ['Transfer sent', 'Realman Unique Global · Oct 16', '-₦4,120.00', false],
  ['USDT received', 'Converted · Oct 16', '+36.85 USDT', true],
  ['Deposit', 'Naira wallet · Oct 16', '+₦50,000.00', true],
  ['Transfer sent', 'Ebuka C. Edeh · Oct 16', '-₦240.00', false],
  ['Transfer sent', 'Mubo Special Comms · Oct 16', '-₦1,020.00', false],
  ['USDC received', 'Deposit · Oct 15', '+3.00 USDC', true],
];

const TxRow: React.FC<{t: (typeof TX)[number]; scale?: number}> = ({t: [title, sub, amt, inc], scale = 1}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 22 * scale, padding: `${20 * scale}px 0`}}>
    <div
      style={{
        width: 76 * scale,
        height: 76 * scale,
        borderRadius: 76 * scale,
        background: title === 'Transfer sent' ? 'rgba(34,197,94,0.14)' : '#F5F5F5',
        border: title === 'Transfer sent' ? `2px solid ${C.green}` : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {title === 'Transfer sent' ? (
        <I.ICheck size={38 * scale} color={C.green} stroke={2.8} />
      ) : title === 'Deposit' ? (
        <I.IBank size={36 * scale} color="#0B0B0B" />
      ) : (
        <span style={{fontSize: 34 * scale, fontWeight: 600, color: '#0B0B0B'}}>$</span>
      )}
    </div>
    <div style={{display: 'flex', flexDirection: 'column', gap: 6 * scale}}>
      <div style={{fontSize: 30 * scale, fontWeight: 500, color: title === 'Transfer sent' ? C.greenHi : C.white}}>{title}</div>
      <div style={{...label, fontSize: 22 * scale}}>{sub}</div>
    </div>
    <div style={{flex: 1}} />
    <div style={{...num, fontSize: 30 * scale, color: inc ? C.green : C.text}}>{amt}</div>
  </div>
);

export const TxList = () => (
  <Page w={1000} h={1100} style={{padding: '44px 50px'}}>
    <div style={{fontSize: 44, fontWeight: 600, marginBottom: 16}}>Transactions</div>
    {TX.concat(TX.slice(0, 2)).map((t, i) => (
      <TxRow key={i} t={t} />
    ))}
  </Page>
);

/* ------------------------------------------------------------------ phone home (shots 13-15) */
// balance digits are drawn live in 3D (ticking) at this anchor
export const PHONE_BALANCE = {x: 430, y: 376, size: 80};

export const PhoneHome = () => (
  <Page w={860} h={1860} radius={0} style={{padding: '0 46px'}}>
    {/* status bar */}
    <div style={{display: 'flex', alignItems: 'center', height: 96, fontSize: 30, fontWeight: 600}}>
      <div>01:05</div>
      <div style={{flex: 1}} />
      <div style={{width: 58, height: 30, borderRadius: 10, border: '2px solid #888', position: 'relative'}}>
        <div style={{position: 'absolute', inset: 3, right: 18, background: '#ddd', borderRadius: 5}} />
      </div>
    </div>
    {/* balance card */}
    <div style={{background: C.surface, border: `1px solid ${C.line}`, borderRadius: 40, padding: '36px 40px', height: 680, position: 'relative', backgroundImage: 'radial-gradient(120% 80% at 70% 0%, #1c1c1c 0%, #0B0B0B 60%)'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
        <div style={{width: 76, height: 76, borderRadius: 76, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0B0B0B', fontSize: 32, fontWeight: 600}}>B</div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
          <div style={{...label, fontSize: 22}}>Welcome back</div>
          <div style={{fontSize: 30, fontWeight: 500}}>Breeze</div>
        </div>
        <div style={{flex: 1}} />
        <div style={{width: 72, height: 72, borderRadius: 72, border: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <I.IBell size={32} color={C.white} />
        </div>
      </div>
      <div style={{textAlign: 'center', marginTop: 70, ...label, fontSize: 28, color: '#CFCFCF'}}>Total Balance</div>
      {/* balance number drawn live in 3D at PHONE_BALANCE */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 340, display: 'flex', justifyContent: 'center', gap: 14}}>
        <GreenChip size={22}>+₦50,000 received</GreenChip>
      </div>
      <div style={{position: 'absolute', left: 40, right: 40, bottom: 40, borderTop: `1px solid ${C.line}`, paddingTop: 36, display: 'flex', gap: 24}}>
        {[
          ['USDT', '1,805.40'],
          ['USDC', '320.00'],
        ].map(([s, v]) => (
          <div key={s} style={{flex: 1, display: 'flex', alignItems: 'center', gap: 16, background: C.card, borderRadius: 24, padding: '20px 22px'}}>
            <CoinIcon sym={s} size={52} />
            <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
              <div style={{...label, fontSize: 20}}>{s}</div>
              <div style={{...num, fontSize: 30}}>{v}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
    {/* quick actions */}
    <div style={{display: 'flex', justifyContent: 'space-between', padding: '48px 18px 34px'}}>
      {[
        ['Deposit', I.IPlus, true],
        ['Send', I.IArrowUp, false],
        ['Convert', I.ISwap, false],
        ['Withdraw', I.IArrowDown, false],
      ].map(([n, Icon, primary]: any) => (
        <div key={n} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
          <div
            style={{
              width: 116,
              height: 116,
              borderRadius: 116,
              background: primary ? '#FFFFFF' : C.card,
              border: primary ? 'none' : `1px solid ${C.line}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={46} color={primary ? '#0B0B0B' : C.white} stroke={2.2} />
          </div>
          <div style={{fontSize: 26, color: '#D4D4D4'}}>{n}</div>
        </div>
      ))}
    </div>
    <div style={{height: 1, background: C.line, margin: '0 -46px'}} />
    <div style={{display: 'flex', alignItems: 'center', margin: '30px 0 6px'}}>
      <div style={{fontSize: 32, fontWeight: 600}}>Recent Transactions</div>
      <div style={{flex: 1}} />
      <div style={{...label, fontSize: 24}}>View All</div>
    </div>
    {TX.slice(0, 5).map((t, i) => (
      <TxRow key={i} t={t} scale={0.92} />
    ))}
    {/* tab bar */}
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 150, background: '#070707', borderTop: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 20}}>
      {NAV.map(([n, Icon], i) => (
        <div key={n} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
          <Icon size={42} color={i === 0 ? C.white : C.greyDim} />
          <div style={{fontSize: 22, color: i === 0 ? C.white : C.greyDim, fontWeight: i === 0 ? 600 : 400}}>{n}</div>
        </div>
      ))}
    </div>
  </Page>
);

/* ------------------------------------------------------------------ small pieces */
export const P2PGhost = () => (
  <div
    style={{
      width: 900,
      height: 260,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 34,
      fontFamily: FONT,
      color: C.red,
      background: 'transparent',
    }}
  >
    <div style={{fontSize: 120, fontWeight: 700, letterSpacing: '-0.03em'}}>P2P</div>
    <svg width={92} height={120} viewBox="0 0 24 32" fill="none" stroke={C.red} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2h18M3 30h18M5 2c0 8 7 9 7 14S5 22 5 30M19 2c0 8-7 9-7 14s7 6 7 14" />
      <path d="M8 27c1.5-2.5 6.5-2.5 8 0z" fill={C.red} />
    </svg>
    <div style={{...num, fontSize: 120, color: C.red, fontWeight: 600}}>40:00</div>
  </div>
);

export const CoinFace: React.FC<{sym: 'USDT' | 'USDC'}> = ({sym}) => (
  <div
    style={{
      width: 512,
      height: 512,
      borderRadius: 512,
      background: `radial-gradient(circle at 35% 30%, ${C.greenHi} 0%, ${C.green} 45%, ${C.greenDeep} 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: FONT,
      position: 'relative',
    }}
  >
    <div style={{position: 'absolute', inset: 34, borderRadius: 512, border: '10px solid rgba(255,255,255,0.55)'}} />
    <div style={{fontSize: 290, fontWeight: 700, color: '#FFFFFF', textShadow: '0 6px 0 rgba(20,83,45,0.6)', marginTop: -10}}>{sym === 'USDT' ? '₮' : '$'}</div>
  </div>
);
