import { MatchState } from "../../umpire";
import { isMatchWon } from "../../umpire/matchWinState";

export function getFullGameScores(matchState: MatchState) {
  const gameScores = [...matchState.gameScores];

  const matchWon = isMatchWon(matchState.matchWinState);
  if (!matchWon) {
    gameScores.push({
      team1Points: matchState.team1Score.points,
      team2Points: matchState.team2Score.points,
    });
  }
  return gameScores;
}
