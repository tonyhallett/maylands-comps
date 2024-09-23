import { fillArrayWithIndices } from "../../helpers/fillArray";

export type MatchIndices = number[];

export interface PlayerMatchDetails {
  matchIndices: MatchIndices;
  positionDisplay: string;
}
export const getMatchPlayersPositionDisplay = (
  homePlayerMatchDetails: PlayerMatchDetails[],
  awayPlayerMatchDetails: PlayerMatchDetails[],
) => {
  const numMatches =
    homePlayerMatchDetails.length *
    homePlayerMatchDetails[0].matchIndices.length;

  return fillArrayWithIndices(numMatches).map((i) => {
    const getPlayerPositionDisplay = (isHome: boolean) => {
      const playersMatchDetails = isHome
        ? homePlayerMatchDetails
        : awayPlayerMatchDetails;
      const position = playersMatchDetails.findIndex((playerMatchDetails) =>
        playerMatchDetails.matchIndices.includes(i),
      );
      return {
        position,
        display: playersMatchDetails[position].positionDisplay,
      };
    };
    return {
      homePositionDisplay: getPlayerPositionDisplay(true),
      awayPositionDisplay: getPlayerPositionDisplay(false),
    };
  });
};
/*
const getPlayerPositionDisplay = (
                                isHome: boolean,
                              ) => {
                                const playerMatchDetails = isHome
                                  ? homePlayerMatchDetails
                                  : awayPlayerMatchDetails;
                                return playerMatchDetails.find((pmd) =>
                                  pmd.matchIndices.includes(index),
                                )!.positionDisplay;
                              };
*/
