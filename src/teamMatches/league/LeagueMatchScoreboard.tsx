import { DbMatch } from "../../firebase/rtb/match/dbMatch";
import { fontFaces } from "../../fontDemos/fontInfo";
import { Score, Scoreboard } from "../../scoreboard/Scoreboard";

export interface LeagueMatchScoreboardProps {
  matches: DbMatch[];
}

export function LeagueMatchScoreboard({ matches }: LeagueMatchScoreboardProps) {
  const umpiredMatch = matches.find((match) => match.umpired);
  if (umpiredMatch === undefined) {
    return <div>Awaiting umpire</div>;
  }
  let score: Score;
  const scoreboardWithUmpire = umpiredMatch.scoreboardWithUmpire;
  const scoreboardTeam1Left = scoreboardWithUmpire
    ? !umpiredMatch.team1Left
    : umpiredMatch.team1Left;
  if (scoreboardTeam1Left) {
    score = {
      left: umpiredMatch.team1Score,
      right: umpiredMatch.team2Score,
    };
  } else {
    score = {
      left: umpiredMatch.team2Score,
      right: umpiredMatch.team1Score,
    };
  }
  return (
    <Scoreboard
      score={score}
      fontInfo={{
        weight: "400",
        fontInfo: fontFaces[3],
      }}
    />
  );
}
