import { useRef } from "react";
import { CanvasFontMax } from "./CanvasFontMax";
import { DemoScoreDrawer, CalculatedInstructions } from "./DemoScoreDrawer";
import { WeightFontInfo } from "../useFontCanvas";
import {
  GoFullScreen,
  LandscapeFullScreen,
} from "../../OnlyIfFullScreenOrNotAvailable";
import { Typography } from "@mui/material";
import { useWakeLock } from "./useWakeLock";
//import { SerializedSessionStorage } from "./SerializedSessionStorage";

export interface DemoTeamScore {
  games: number;
  points: number;
}
export interface DemoGameScore {
  left: DemoTeamScore;
  right: DemoTeamScore;
}
export interface DemoScoreProps {
  score: DemoGameScore;
  fontInfo: WeightFontInfo;
}

/* const demoSerializedStorage =
  new SerializedSessionStorage<CalculatedInstructions>(); */
export function DemoScore({ score, fontInfo }: DemoScoreProps) {
  useWakeLock();
  const demoCanvasFontMaxImplRef = useRef(new DemoScoreDrawer());
  demoCanvasFontMaxImplRef.current.cardBorderColor = "orange";
  demoCanvasFontMaxImplRef.current.digitColor = "pink";
  demoCanvasFontMaxImplRef.current.score = score;
  return (
    <LandscapeFullScreen
      wrongOrientation={<Typography>Landscape please</Typography>}
      notfullScreen={<GoFullScreen />}
    >
      <CanvasFontMax<CalculatedInstructions>
        fontInfo={fontInfo}
        /* store={demoSerializedStorage} */
        impl={demoCanvasFontMaxImplRef.current}
      />
    </LandscapeFullScreen>
  );
}
