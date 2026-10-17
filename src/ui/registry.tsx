import React from 'react';
import * as S from './screens';

export type TexDef = {w: number; h: number; el: () => React.ReactElement; transparent?: boolean};

// id -> CSS size; rendered at 2x into public/tex/<id>.png
export const TEXTURES: Record<string, TexDef> = {
  dashboard: {w: 1600, h: 900, el: () => <S.Dashboard slot />},
  deposit: {w: S.DEPOSIT_SLOT.w, h: S.DEPOSIT_SLOT.h, el: () => <S.DepositButton />, transparent: true},
  deposit_dark: {w: S.DEPOSIT_SLOT.w, h: S.DEPOSIT_SLOT.h, el: () => <S.DepositButton dark />, transparent: true},
  assets: {w: 1600, h: 1000, el: () => <S.AssetsTable />},
  assets_frame: {w: 1600, h: 1000, el: () => <S.AssetsTable rows={false} />},
  ...Object.fromEntries(
    S.ASSET_ROWS.map((sym, i) => [`row_${sym}`, {w: 1600 - S.ASSETS_LAYOUT.padX * 2, h: S.ASSETS_LAYOUT.row, el: () => <S.AssetRow i={i} />}]),
  ),
  convert: {w: 1600, h: 1000, el: () => <S.Convert />},
  portfolio: {w: 760, h: 1060, el: () => <S.Portfolio />},
  statement: {w: 1500, h: 900, el: () => <S.Statement />},
  settings0: {w: 1000, h: 900, el: () => <S.Settings dark={false} twofa={false} />},
  settings1: {w: 1000, h: 900, el: () => <S.Settings dark twofa={false} />},
  settings2: {w: 1000, h: 900, el: () => <S.Settings dark twofa />},
  txlist: {w: 1000, h: 1100, el: () => <S.TxList />},
  phone: {w: 860, h: 1860, el: () => <S.PhoneHome />},
  p2p: {w: 900, h: 260, el: () => <S.P2PGhost />, transparent: true},
  coin_usdt: {w: 512, h: 512, el: () => <S.CoinFace sym="USDT" />, transparent: true},
  coin_usdc: {w: 512, h: 512, el: () => <S.CoinFace sym="USDC" />, transparent: true},
};
