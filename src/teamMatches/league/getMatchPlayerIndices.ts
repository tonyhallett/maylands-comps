import { fillArrayWithIndices } from "../../helpers/fillArray";

export type MatchIndices = number[];

export const getMatchPlayerIndices = (
  homePlayersMatchIndices: MatchIndices[],
  awayPlayersMatchIndices: MatchIndices[],
) => {
  const numMatches =
    homePlayersMatchIndices.length * homePlayersMatchIndices[0].length;
  return fillArrayWithIndices(numMatches).map((i) => {
    const getPlayerIndex = (isHome: boolean) => {
      const playersMatchIndices = isHome
        ? homePlayersMatchIndices
        : awayPlayersMatchIndices;
      return playersMatchIndices.findIndex((playerMatchIndices) =>
        playerMatchIndices.includes(i),
      );
    };
    return {
      home: getPlayerIndex(true),
      away: getPlayerIndex(false),
    };
  });
};
