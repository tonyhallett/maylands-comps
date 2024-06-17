import { TeamScore } from "../umpire";
import { LeftRightMatchWinState } from "./UmpireView";

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
export default function PlayerView({ leftScore, rightScore }: PlayerViewProps) {
  // todo vertical alignment of the flexbox
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <ScoreboardScore score={leftScore} isLeft={true} />
        <ScoreboardScore score={rightScore} isLeft={false} />
      </div>
    </div>
  );
}

function ScoreboardScore({
  score,
  isLeft,
}: {
  score: TeamScore;
  isLeft: boolean;
}) {
  const vw = 50;
  const games = (
    <span style={{ fontSize: `${vw / 2}vw`, verticalAlign: "top" }}>
      {score.games}
    </span>
  );
  const points = (
    <span style={{ fontSize: `${vw}vw`, verticalAlign: "top" }}>
      {score.points}
    </span>
  );
  return (
    <div
      style={{
        //lineHeight: "0.7",
        alignSelf: isLeft ? "flex-end" : "flex-start",
      }}
    >
      {isLeft ? (
        <>
          {points}
          {games}
        </>
      ) : (
        <>
          {games}
          {points}
        </>
      )}
    </div>
  );
}
