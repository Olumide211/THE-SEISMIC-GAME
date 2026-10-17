import {Ctx} from './engine/shot';
import {Segment} from './engine/director';
import {Dashboard} from './shots/Dashboard';
import {Assets} from './shots/Assets';
import {LineConvert} from './shots/LineConvert';
import {Coins} from './shots/Coins';
import {Statement} from './shots/Statement';
import {Security} from './shots/Security';
import {Hero} from './shots/Hero';

/* Global timeline (seconds). Overlaps are crossfades riding on whip-pan motion blur;
   0-2.9s is the Blender cloth plate (see director.ts). */
export function buildTimeline(ctx: Ctx): Segment[] {
  return [
    {shot: new Dashboard(ctx), a: 2.35, b: 7.05},
    {shot: new Assets(ctx), a: 6.95, b: 8.5},
    {shot: new LineConvert(ctx), a: 8.35, b: 12.45},
    {shot: new Coins(ctx), a: 12.3, b: 15.0},
    {shot: new Statement(ctx), a: 14.85, b: 16.45},
    {shot: new Security(ctx), a: 16.3, b: 17.55},
    {shot: new Hero(ctx), a: 17.4, b: 25.25},
  ];
}
