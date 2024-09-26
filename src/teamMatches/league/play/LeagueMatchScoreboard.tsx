import { DbMatch } from "../../../firebase/rtb/match/dbMatch";
import { fontFaces } from "../../../fontDemos/manualFontInfo";
import { Score, Scoreboard } from "../../../scoreboard/Scoreboard";

export interface LeagueMatchScoreboardProps {
  matches: DbMatch[];
}

const manualFont = fontFaces[1];
export function LeagueMatchScoreboard({ matches }: LeagueMatchScoreboardProps) {
  const umpiredMatch = matches.find((match) => match.umpired);
  let score: Score = {
    left: {
      games: 0,
      points: 0,
    },
    right: {
      games: 0,
      points: 0,
    },
  };
  if (umpiredMatch !== undefined) {
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
  }

  return (
    <Scoreboard
      score={score}
      fontInfo={{
        weight: manualFont["font-weight"],
        fontInfo: manualFont,
      }}
    />
  );
}
