import { useRef } from "react";
import { CanvasFontMax } from "./CanvasFontMax";
import { DemoScoreDrawer, CalculatedInstructions } from "./DemoScoreDrawer";
import { WeightFontInfo } from "../useFontCanvas";
import {
  GoFullScreen,
  LandscapeFullScreenWithMouseExit,
} from "../../OnlyIfFullScreenOrNotAvailable";
import { Typography } from "@mui/material";
import { useWakeLock } from "./useWakeLock";
//import { SerializedSessionStorage } from "./SerializedSessionStorage";

export interface TeamScore {
  games: number;
  points: number;
}
export interface Score {
  left: TeamScore;
  right: TeamScore;
}
export interface ScoreboardProps {
  score: Score;
  fontInfo: WeightFontInfo;
}

/* const demoSerializedStorage =
  new SerializedSessionStorage<CalculatedInstructions>(); */
export function Scoreboard({ score, fontInfo }: ScoreboardProps) {
  useWakeLock();
  const demoCanvasFontMaxImplRef = useRef(new DemoScoreDrawer());
  demoCanvasFontMaxImplRef.current.cardBorderColor = "orange";
  demoCanvasFontMaxImplRef.current.digitColor = "pink";
  demoCanvasFontMaxImplRef.current.score = score;
  return (
    <LandscapeFullScreenWithMouseExit
      wrongOrientation={<Typography>Landscape please</Typography>}
      notfullScreen={<GoFullScreen moveMouseToExit />}
    >
      <CanvasFontMax<CalculatedInstructions>
        fontInfo={fontInfo}
        /* store={demoSerializedStorage} */
        impl={demoCanvasFontMaxImplRef.current}
      />
    </LandscapeFullScreenWithMouseExit>
  );
}
