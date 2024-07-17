import { PointState } from ".";

export const isMatchPointTeam1 = (pointState: PointState) =>
  Boolean(pointState & PointState.MatchPointTeam1);
export const isMatchPointTeam2 = (pointState: PointState) =>
  Boolean(pointState & PointState.MatchPointTeam2);
export const isGamePointTeam1 = (pointState: PointState) =>
  Boolean(pointState & PointState.GamePointTeam1);
export const isGamePointTeam2 = (pointState: PointState) =>
  Boolean(pointState & PointState.GamePointTeam2);

export const isMatchPoint = (pointState: PointState) => {
  return isMatchPointTeam1(pointState) || isMatchPointTeam2(pointState);
};

export const isGamePoint = (pointState: PointState) => {
  return isGamePointTeam1(pointState) || isGamePointTeam2(pointState);
};

export const isGameOrMatchPoint = (pointState: PointState) => {
  return isGamePoint(pointState) || isMatchPoint(pointState);
};

export const isGameWon = (pointState: PointState) => {
  return (
    pointState === PointState.GameWonTeam1 ||
    pointState === PointState.GameWonTeam2
  );
};
export const isMatchWon = (pointState: PointState) => {
  return (
    pointState === PointState.Team1Won || pointState === PointState.Team2Won
  );
};

export const isGameOrMatchWon = (pointState: PointState) => {
  return isMatchWon(pointState) || isGameWon(pointState);
};

export const team1WonGameOrMatch = (pointState: PointState) => {
  return (
    pointState === PointState.Team1Won || pointState === PointState.GameWonTeam1
  );
};

export const team2WonGameOrMatch = (pointState: PointState) => {
  return (
    pointState === PointState.Team2Won || pointState === PointState.GameWonTeam2
  );
};
