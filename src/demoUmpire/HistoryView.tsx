import { GameScore } from "../umpire";

export function HistoryView({
  gameScores,
  team1Left,
}: {
  team1Left: boolean;
  gameScores: ReadonlyArray<GameScore>;
}) {
  return gameScores.map((gameScore, i) => (
    <div key={i}>
      {`${team1Left ? gameScore.team1Points : gameScore.team2Points} - ${!team1Left ? gameScore.team1Points : gameScore.team2Points}`}
    </div>
  ));
}
