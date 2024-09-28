import {
  MatchWinState,
  isGamePointTeam1,
  isGamePointTeam2,
  isMatchPointTeam1,
  isMatchPointTeam2,
} from "../../../../../umpire/matchWinState";

export enum TeamMatchWinState {
  Normal,
  GamePoint,
  MatchPoint,
  MatchWon,
}
export interface TeamsMatchWinState {
  home: TeamMatchWinState;
  away: TeamMatchWinState;
}

export const getTeamsMatchWinState = (
  matchWinState: MatchWinState,
): TeamsMatchWinState => {
  let homeScoreState = TeamMatchWinState.Normal;
  let awayScoreState = TeamMatchWinState.Normal;
  if (matchWinState === MatchWinState.NotWon) {
    return { home: homeScoreState, away: awayScoreState };
  }
  if (matchWinState === MatchWinState.Team1Won) {
    return { home: TeamMatchWinState.MatchWon, away: awayScoreState };
  }
  if (matchWinState === MatchWinState.Team2Won) {
    return { home: homeScoreState, away: TeamMatchWinState.MatchWon };
  }
  if (isGamePointTeam1(matchWinState)) {
    homeScoreState = TeamMatchWinState.GamePoint;
  }
  if (isGamePointTeam2(matchWinState)) {
    awayScoreState = TeamMatchWinState.GamePoint;
  }
  if (isMatchPointTeam1(matchWinState)) {
    homeScoreState = TeamMatchWinState.MatchPoint;
  }
  if (isMatchPointTeam2(matchWinState)) {
    awayScoreState = TeamMatchWinState.MatchPoint;
  }
  return { home: homeScoreState, away: awayScoreState };
};
