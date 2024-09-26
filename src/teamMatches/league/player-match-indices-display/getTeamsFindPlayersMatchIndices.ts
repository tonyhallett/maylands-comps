import { PlayerMatchIndicesAndPositionDisplay } from ".";

export const getTeamsFindPlayersMatchIndices = (
  homePlayerMatchIndicesAndPositionDisplay: PlayerMatchIndicesAndPositionDisplay[],
  awayPlayerMatchIndicesAndPositionDisplay: PlayerMatchIndicesAndPositionDisplay[],
) => {
  const getFindPlayersMatchIndices = (
    playerMatchDetails: PlayerMatchIndicesAndPositionDisplay[],
  ) =>
    playerMatchDetails.map(
      (playerMatchDetail) => playerMatchDetail.matchIndices[0],
    );
  const findHomePlayersMatchIndices = getFindPlayersMatchIndices(
    homePlayerMatchIndicesAndPositionDisplay,
  );
  const findAwayPlayersMatchIndices = getFindPlayersMatchIndices(
    awayPlayerMatchIndicesAndPositionDisplay,
  );
  return {
    findHomePlayersMatchIndices,
    findAwayPlayersMatchIndices,
  };
};
