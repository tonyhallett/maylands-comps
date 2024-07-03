import { GameScore, PointHistory } from "../../umpire";

export function HistoryView({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  team1StartScore,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  team2StartScore,
  gameScores,
  team1Left,
  gameWon,
  pointHistory,
  currentGameScore,
}: {
  gameWon: boolean;
  currentGameScore: GameScore;
  team1Left: boolean;
  gameScores: ReadonlyArray<GameScore>;
  pointHistory: ReadonlyArray<ReadonlyArray<PointHistory>>;
  team1StartScore: number;
  team2StartScore: number;
}) {
  gameScores = [...gameScores].reverse();
  if (!gameWon) {
    gameScores = [currentGameScore, ...gameScores];
  }
  [...pointHistory].reverse().map((gamePointHistory) => {
    // get stats
    for (let i = 0; i < gamePointHistory.length; i++) {
      //
    }
  });
  return gameScores.map((gameScore, i) => (
    <div key={i}>
      {`${team1Left ? gameScore.team1Points : gameScore.team2Points} - ${!team1Left ? gameScore.team1Points : gameScore.team2Points}`}
    </div>
  ));
}
