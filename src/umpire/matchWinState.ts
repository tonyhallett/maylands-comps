export enum MatchWinState {
  NotWon = 0,
  Team1Won = 1,
  Team2Won = 2,
  GamePointTeam1 = 4,
  GamePointTeam2 = 8,
  MatchPointTeam1 = 16,
  MatchPointTeam2 = 32,
}

export const isMatchPointTeam1 = (matchWinState: MatchWinState) =>
  Boolean(matchWinState & MatchWinState.MatchPointTeam1);
export const isMatchPointTeam2 = (matchWinState: MatchWinState) =>
  Boolean(matchWinState & MatchWinState.MatchPointTeam2);
export const isGamePointTeam1 = (matchWinState: MatchWinState) =>
  Boolean(matchWinState & MatchWinState.GamePointTeam1);
export const isGamePointTeam2 = (matchWinState: MatchWinState) =>
  Boolean(matchWinState & MatchWinState.GamePointTeam2);
export const isMatchWon = (matchWinState: MatchWinState) =>
  matchWinState === MatchWinState.Team1Won ||
  matchWinState === MatchWinState.Team2Won;
