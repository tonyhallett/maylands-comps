import { PlayerMatchIndicesAndPositionDisplay } from ".";

export const getNumMatches = (
  playerMatchIndicesAndPositionDisplay: PlayerMatchIndicesAndPositionDisplay[],
) => {
  return playerMatchIndicesAndPositionDisplay.flatMap(
    (pmid) => pmid.matchIndices,
  ).length;
};
