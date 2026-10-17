import {Composition} from 'remotion';
import {TexComp} from './TexComp';
import {TEXTURES} from './ui/registry';
import {SpendaLaunch} from './SpendaLaunch';

export const Root = () => (
  <>
    <Composition id="SpendaLaunch" component={SpendaLaunch} durationInFrames={756} fps={30} width={1920} height={1080} />
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
