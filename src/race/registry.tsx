import React from 'react';
import type {TexDef} from '../ui/registry';
import * as S from './screens';

const phone = (el: () => React.ReactElement): TexDef => ({w: S.PW, h: S.PH, el});

export const RACE_TEXTURES: Record<string, TexDef> = {
  sp_splash: phone(() => <S.SpSplash />),
  sp_sell: phone(() => <S.SpSell />),
  sp_deposit: phone(() => <S.SpDeposit />),
  sp_received: phone(() => <S.SpReceived />),
  sp_convert: phone(() => <S.SpConvert />),
  sp_withdraw: {w: S.ANCHOR.withdrawBtn.w, h: S.ANCHOR.withdrawBtn.h, el: () => <S.SpWithdrawBtn />, transparent: true},
  sp_lock: phone(() => <S.SpLock />),
  notif: {w: S.ANCHOR.notif.w, h: S.ANCHOR.notif.h, el: () => <S.Notif />, transparent: true},
  sp_bills: phone(() => <S.SpBills />),
  chip_airtime: {w: 560, h: 104, el: () => <S.Chip text="Airtime ₦2,000" />, transparent: true},
  chip_power: {w: 700, h: 104, el: () => <S.Chip text="Electricity bill paid" />, transparent: true},
  sp_sent: phone(() => <S.SpSent />),
  p2p_sell: phone(() => <S.P2pSell />),
  p2p_vendors: phone(() => <S.P2pVendors />),
  p2p_chat: phone(() => <S.P2pChat />),
  p2p_timer: phone(() => <S.P2pTimer />),
  p2p_offline: phone(() => <S.P2pOffline />),
  p2p_pending: phone(() => <S.P2pPending />),
  p2p_stuck: phone(() => <S.P2pOffline timer="31:12" stuck />),
  p2p_label: {w: 400, h: 120, el: () => <S.P2pLabel />, transparent: true},
};
