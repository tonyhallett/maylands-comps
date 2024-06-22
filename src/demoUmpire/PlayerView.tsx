import { useRef } from "react";
import { useFullscreen2dCanvas } from "../canvasHelpers/useFullscreen2dCanvas";
import { TeamScore } from "../umpire";
import { LeftRightMatchWinState } from "./MatchView";

interface PlayerViewProps {
  leftScore: TeamScore;
  rightScore: TeamScore;
  leftPlayer1Name: string;
  leftPlayer2Name: string | undefined;
  rightPlayer1Name: string;
  rightPlayer2Name: string | undefined;
  matchWinState: LeftRightMatchWinState;
  serverName: string;
  receiverName: string;
  remainingServes: number;
}
// pass in the font details
// have a button for full screen
// prohibit if not landscape
// hide the full screen button when go full screen
// given screen tap or mouse move show the full screen button
//

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getMaxFontSize(weight: number, family: string): number {
  return 100;
}

export default function PlayerView({ leftScore, rightScore }: PlayerViewProps) {
  const maxFontSizeRef = useRef<number>(0);
  const canvas = useFullscreen2dCanvas((canvas, context) => {
    if (maxFontSizeRef.current === 0) {
      const maxFontSize = getMaxFontSize(700, "Roboto Mono");
      maxFontSizeRef.current = maxFontSize;
      context.font = `${maxFontSize}px Roboto Mono`;
    }
    context.reset();
    context.fillStyle = "red";
    context.fillText(leftScore.games.toString(), 0, 100);
    context.fillStyle = "orange";
    context.fillText(rightScore.games.toString(), 200, 100);
  });
  return canvas;
}
