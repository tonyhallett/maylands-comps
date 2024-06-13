import { TeamScore } from ".";
import { requiredGamesToWin } from "./requiredGamesToWin";

export interface MatchWinStateOptions {
  bestOf: number;
  upTo: number;
  clearBy2: boolean;
}

export enum MatchWinState {
  NotWon = 0,
  Team1Won = 1,
  Team2Won = 2,
  GamePointTeam1 = 4,
  GamePointTeam2 = 8,
  MatchPointTeam1 = 16,
  MatchPointTeam2 = 32,
}

export const getMatchWinState = (
  options: MatchWinStateOptions,
  team1Score: TeamScore,
  team2Score: TeamScore,
): MatchWinState => {
  const reqGamesToWin = requiredGamesToWin(options.bestOf);
  if (team1Score.games == reqGamesToWin) {
    return MatchWinState.Team1Won;
  }
  if (team2Score.games === reqGamesToWin) {
    return MatchWinState.Team2Won;
  }

  const team1AtLeastOneBeforeUpTo = team1Score.points >= options.upTo - 1;
  const team2AtLeastOneBeforeUpTo = team2Score.points >= options.upTo - 1;
  if (team1AtLeastOneBeforeUpTo || team2AtLeastOneBeforeUpTo) {
    const samePoints = team1Score.points === team2Score.points;
    if (samePoints) {
      if (options.clearBy2) {
        return MatchWinState.NotWon;
      }
      const team1MatchWinState =
        team1Score.games === reqGamesToWin - 1
          ? MatchWinState.MatchPointTeam1
          : MatchWinState.GamePointTeam1;
      const team2MatchWinState =
        team2Score.games === reqGamesToWin - 1
          ? MatchWinState.MatchPointTeam2
          : MatchWinState.GamePointTeam2;
      return team1MatchWinState + team2MatchWinState;
    } else {
      // there is a difference so one is nearer to winning regardless of clearBy2
      const team1Winning = team1Score.points > team2Score.points;
      const winGames = team1Winning ? team1Score.games : team2Score.games;
      if (winGames === reqGamesToWin - 1) {
        return team1Winning
          ? MatchWinState.MatchPointTeam1
          : MatchWinState.MatchPointTeam2;
      }
      return team1Winning
        ? MatchWinState.GamePointTeam1
        : MatchWinState.GamePointTeam2;
    }
  } else {
    return MatchWinState.NotWon;
  }
};
