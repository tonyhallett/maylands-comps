import { TeamScore } from ".";
import { requiredGamesToWin } from "./requiredGamesToWin";
import { MatchWinState } from "./matchWinState";

export interface MatchWinStateOptions {
  bestOf: number;
  upTo: number;
  clearBy2: boolean;
}
export interface MatchWinStatus {
  matchWinState: MatchWinState;
  gameOrMatchPoints?: number;
}

export const getMatchWinStatus = (
  options: MatchWinStateOptions,
  team1Score: TeamScore,
  team2Score: TeamScore,
): MatchWinStatus => {
  const reqGamesToWin = requiredGamesToWin(options.bestOf);
  if (team1Score.games == reqGamesToWin) {
    return { matchWinState: MatchWinState.Team1Won };
  }
  if (team2Score.games === reqGamesToWin) {
    return { matchWinState: MatchWinState.Team2Won };
  }

  const team1AtLeastOneBeforeUpTo = team1Score.points >= options.upTo - 1;
  const team2AtLeastOneBeforeUpTo = team2Score.points >= options.upTo - 1;
  if (team1AtLeastOneBeforeUpTo || team2AtLeastOneBeforeUpTo) {
    const samePoints = team1Score.points === team2Score.points;
    if (samePoints) {
      if (options.clearBy2) {
        return { matchWinState: MatchWinState.NotWon };
      }
      const team1MatchWinState =
        team1Score.games === reqGamesToWin - 1
          ? MatchWinState.MatchPointTeam1
          : MatchWinState.GamePointTeam1;
      const team2MatchWinState =
        team2Score.games === reqGamesToWin - 1
          ? MatchWinState.MatchPointTeam2
          : MatchWinState.GamePointTeam2;
      return {
        matchWinState: team1MatchWinState + team2MatchWinState,
        gameOrMatchPoints: 1,
      };
    } else {
      // there is a difference so one is nearer to winning regardless of clearBy2
      const team1Winning = team1Score.points > team2Score.points;
      const winGames = team1Winning ? team1Score.games : team2Score.games;
      let gameOrMatchPoints = Math.abs(team1Score.points - team2Score.points);
      if (!options.clearBy2) {
        gameOrMatchPoints++;
      }
      if (winGames === reqGamesToWin - 1) {
        return {
          matchWinState: team1Winning
            ? MatchWinState.MatchPointTeam1
            : MatchWinState.MatchPointTeam2,
          gameOrMatchPoints,
        };
      }
      return {
        matchWinState: team1Winning
          ? MatchWinState.GamePointTeam1
          : MatchWinState.GamePointTeam2,
        gameOrMatchPoints,
      };
    }
  } else {
    return { matchWinState: MatchWinState.NotWon };
  }
};
