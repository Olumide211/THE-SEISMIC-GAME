import {Composition} from 'remotion';
import {TexComp} from './TexComp';
import {TEXTURES as LAUNCH_TEXTURES} from './ui/registry';
import {RACE_TEXTURES} from './race/registry';

const TEXTURES = {...LAUNCH_TEXTURES, ...RACE_TEXTURES};
import {SpendaLaunch} from './SpendaLaunch';
import {SpendaRace} from './SpendaRace';

export const Root = () => (
  <>
    <Composition id="SpendaLaunch" component={SpendaLaunch} durationInFrames={756} fps={30} width={1920} height={1080} />
    <Composition id="SpendaRace" component={SpendaRace} durationInFrames={900} fps={30} width={1080} height={1920} defaultProps={{layer: 'all' as const}} />
    <Composition
      id="Tex"
      component={TexComp}
      durationInFrames={1}
      fps={30}
      width={100}
      height={100}
      defaultProps={{id: 'dashboard'}}
      calculateMetadata={({props}) => {
        const d = TEXTURES[props.id];
        return {width: d.w * 2, height: d.h * 2};
      }}
    />
  </>
);
