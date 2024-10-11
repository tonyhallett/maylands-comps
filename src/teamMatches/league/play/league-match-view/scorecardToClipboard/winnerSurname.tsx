import { isNotUndefined } from "../../../../../helpers/isNotTypeGuards";
import { PlayerNameOrUndefineds } from "../../../scorecardToClipboard/drawTeam";

export function getWinnerSurname(
  allSurnames: string[],
  winnerSurname: string,
  positionIdentifier: string,
): string {
  if (allSurnames.filter((surname) => surname === winnerSurname).length === 1) {
    return winnerSurname;
  }
  return `${winnerSurname} ( ${positionIdentifier} )`;
}

export function getSurname(name: string) {
  const parts = name.split(" ");
  return parts[parts.length - 1];
}

function getAllPlayerNames(
  homePlayerNames: PlayerNameOrUndefineds,
  awayPlayerNames: PlayerNameOrUndefineds,
) {
  return homePlayerNames
    .filter(isNotUndefined)
    .concat(awayPlayerNames.filter(isNotUndefined));
}

export function getAllSurnames(
  homePlayerNames: PlayerNameOrUndefineds,
  awayPlayerNames: PlayerNameOrUndefineds,
) {
  return getAllPlayerNames(homePlayerNames, awayPlayerNames).map((name) => {
    return getSurname(name);
  });
}
