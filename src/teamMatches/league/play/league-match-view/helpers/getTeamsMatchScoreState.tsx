import {
  MatchWinState,
  isGamePointTeam1,
  isGamePointTeam2,
  isMatchPointTeam1,
  isMatchPointTeam2,
} from "../../../../../umpire/matchWinState";

export enum TeamMatchScoreState {
  Normal,
  GamePoint,
  MatchPoint,
  MatchWon,
  Conceeded,
}
export interface TeamsMatchScoreState {
  home: TeamMatchScoreState;
  away: TeamMatchScoreState;
}

export const getTeamsMatchScoreState = (
  matchWinState: MatchWinState,
): TeamsMatchScoreState => {
  let homeScoreState = TeamMatchScoreState.Normal;
  let awayScoreState = TeamMatchScoreState.Normal;
  if (matchWinState === MatchWinState.NotWon) {
    return { home: homeScoreState, away: awayScoreState };
  }
  if (matchWinState === MatchWinState.Team1Won) {
    return { home: TeamMatchScoreState.MatchWon, away: awayScoreState };
  }
  if (matchWinState === MatchWinState.Team2Won) {
    return { home: homeScoreState, away: TeamMatchScoreState.MatchWon };
  }
  if (isGamePointTeam1(matchWinState)) {
    homeScoreState = TeamMatchScoreState.GamePoint;
  }
  if (isGamePointTeam2(matchWinState)) {
    awayScoreState = TeamMatchScoreState.GamePoint;
  }
  if (isMatchPointTeam1(matchWinState)) {
    homeScoreState = TeamMatchScoreState.MatchPoint;
  }
  if (isMatchPointTeam2(matchWinState)) {
    awayScoreState = TeamMatchScoreState.MatchPoint;
  }
  return { home: homeScoreState, away: awayScoreState };
};
