import { fillArrayWithIndices } from "../../../helpers/fillArray";
import { PlayerMatchIndicesAndPositionDisplay } from ".";

export const getMatchPlayersPositionDisplay = (
  homePlayersMatchIndicesDisplay: PlayerMatchIndicesAndPositionDisplay[],
  awayPlayersMatchIndicesDisplay: PlayerMatchIndicesAndPositionDisplay[],
) => {
  const numMatches =
    homePlayersMatchIndicesDisplay.length *
    homePlayersMatchIndicesDisplay[0].matchIndices.length;

  return fillArrayWithIndices(numMatches).map((i) => {
    const getPlayerPositionDisplay = (isHome: boolean) => {
      const playersMatchDetails = isHome
        ? homePlayersMatchIndicesDisplay
        : awayPlayersMatchIndicesDisplay;
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
