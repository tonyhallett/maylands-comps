import { PlayerMatchIndicesAndPositionDisplay } from ".";

export const getTeamsPlayersPositionDisplay = (
  homePlayersMatchIndicesAndPositionDisplay: PlayerMatchIndicesAndPositionDisplay[],
  awayPlayersMatchIndicesAndPositionDisplay: PlayerMatchIndicesAndPositionDisplay[],
) => {
  const homeTeamPlayersPositionDisplay =
    homePlayersMatchIndicesAndPositionDisplay.map((pd) => pd.positionDisplay);
  const awayTeamPlayersPositionDisplay =
    awayPlayersMatchIndicesAndPositionDisplay.map((pd) => pd.positionDisplay);
  return {
    homeTeamPlayersPositionDisplay,
    awayTeamPlayersPositionDisplay,
  };
};
