import {
  MatchWinState,
  isGamePointTeam1,
  isGamePointTeam2,
  isMatchPointTeam1,
  isMatchPointTeam2,
} from "../../umpire/matchWinState";

export enum MatchScoreState {
  Normal,
  GamePoint,
  MatchPoint,
  MatchWon,
}
export interface TeamsMatchScoreState {
  home: MatchScoreState;
  away: MatchScoreState;
}

export const getTeamsMatchScoreState = (
  matchWinState: MatchWinState,
): TeamsMatchScoreState => {
  let homeScoreState = MatchScoreState.Normal;
  let awayScoreState = MatchScoreState.Normal;
  if (matchWinState === MatchWinState.NotWon) {
    return { home: homeScoreState, away: awayScoreState };
  }
  if (matchWinState === MatchWinState.Team1Won) {
    return { home: MatchScoreState.MatchWon, away: awayScoreState };
  }
  if (matchWinState === MatchWinState.Team2Won) {
    return { home: homeScoreState, away: MatchScoreState.MatchWon };
  }
  if (isGamePointTeam1(matchWinState)) {
    homeScoreState = MatchScoreState.GamePoint;
  }
  if (isGamePointTeam2(matchWinState)) {
    awayScoreState = MatchScoreState.GamePoint;
  }
  if (isMatchPointTeam1(matchWinState)) {
    homeScoreState = MatchScoreState.MatchPoint;
  }
  if (isMatchPointTeam2(matchWinState)) {
    awayScoreState = MatchScoreState.MatchPoint;
  }
  return { home: homeScoreState, away: awayScoreState };
};
