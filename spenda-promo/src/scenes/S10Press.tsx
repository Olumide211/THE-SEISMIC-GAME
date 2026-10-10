import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { brand } from "../brand";
import { Phone } from "../components/Phone";
import { phonePose } from "../components/camera";
import { StepLabel } from "../components/StepLabel";
import { Ripple } from "../components/Ripple";
import { CONVERT_LAYOUT, ConvertScreen } from "../screens/ConvertScreen";
import { convertState } from "./phoneState";
import { prog } from "../anim";
import { dur, scenes, t } from "../timeline";

export const S10Press: React.FC = () => {
  const frame = useCurrentFrame();
  const abs = frame + scenes.s10.from;
  const c = convertState(abs);
  return (
    <AbsoluteFill>
      <Phone
        {...phonePose(abs)}
        screen={
          <ConvertScreen
            fromAmount={c.fromAmount}
            toAmount={c.toAmount}
            caret={false}
            swapRotation={c.swapRotation}
            pressed={Math.max(0, c.pressed)}
            loading={c.loading}
            done={c.converted}
            overlay={
              <Ripple
                p={prog(abs, t.pressConvert, t.pressConvert + 14, (x) => x)}
                x={195}
                y={CONVERT_LAYOUT.buttonTop + 28}
                size={80}
                color={brand.colors.primaryLight}
              />
            }
          />
        }
      />
      <StepLabel line1="No vendor." line2="No screenshots." side="left" inset={150} start={4} exit={dur(scenes.s10) - 8} />
    </AbsoluteFill>
  );
};
