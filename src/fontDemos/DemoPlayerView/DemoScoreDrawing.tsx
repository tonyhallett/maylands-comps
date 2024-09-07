import { useState } from "react";
import { DraggableCard } from "../../demoHelpers/DraggableCard";
import { NameWeightFontInfo, nameWeightFontInfos } from "../useFontCanvas";
import { fillArray } from "../../helpers/fillArray";
import { DemoGameScore, DemoScore } from "./DemoScore";
import { CardContent } from "@mui/material";

export let scoreIndex = 0;
export const scores: DemoGameScore[] = [
  {
    left: { games: 0, points: 0 },
    right: { games: 1, points: 1 },
  },
  {
    left: { games: 2, points: 2 },
    right: { games: 1, points: 3 },
  },
  ...fillArray(30, (i) => {
    const demoScore: DemoGameScore = {
      left: { games: 2, points: 4 + i },
      right: { games: 1, points: 5 + i },
    };
    return demoScore;
  }),
];

export let fontIndex = 0;
export function DemoScoreDrawing() {
  const [score, setScore] = useState<DemoGameScore>(scores[scoreIndex]);
  const [font, setFont] = useState<NameWeightFontInfo>(
    nameWeightFontInfos[fontIndex],
  );
  return (
    <>
      <DemoScore score={score} fontInfo={font} />
      <DraggableCard cardStyle={{ position: "fixed", bottom: 10, right: 10 }}>
        <CardContent>
          <button
            onClick={() => {
              setScore(scores[++scoreIndex]);
            }}
          >
            Next score
          </button>
          <button
            onClick={() => {
              let nextFontIndex = 0;
              if (fontIndex !== nameWeightFontInfos.length - 1) {
                nextFontIndex = fontIndex + 1;
              }
              fontIndex = nextFontIndex;
              setFont(nameWeightFontInfos[nextFontIndex]);
            }}
          >
            Next font
          </button>
          <button
            onClick={() => {
              let nextFontIndex = fontIndex - 1;
              if (nextFontIndex < 0) {
                nextFontIndex = nameWeightFontInfos.length - 1;
              }
              fontIndex = nextFontIndex;
              setFont(nameWeightFontInfos[nextFontIndex]);
            }}
          >
            Prev font
          </button>
          <div>{`${font.fontInfo["font-family"]} ${font.weight}`}</div>
        </CardContent>
      </DraggableCard>
    </>
  );
}
