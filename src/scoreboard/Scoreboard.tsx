import { useRef } from "react";
import { ScoreDrawer, CalculatedInstructions } from "./ScoreDrawer";
import { LandscapeFullScreenWithMouseExit } from "../screenComponents/LandscapeFullScreenWithMouseExit";
import { GoFullScreen } from "../screenComponents/GoFullScreen";
import { Typography } from "@mui/material";
import { useWakeLock } from "../hooks/useWakeLock";
import { CanvasFontMax, CanvasFontMaxProps } from "./CanvasFontMax";
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
  fontInfo: CanvasFontMaxProps<undefined>["fontInfo"];
}

/* const demoSerializedStorage =
  new SerializedSessionStorage<CalculatedInstructions>(); */
export function Scoreboard({ score, fontInfo }: ScoreboardProps) {
  useWakeLock();
  const demoCanvasFontMaxImplRef = useRef(new ScoreDrawer());
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
