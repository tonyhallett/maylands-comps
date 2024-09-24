import { getInitials } from "../../umpireView/helpers";
import { isSingles } from "./helpers";
import {
  KeyedDoublesMatchNamesPositionDisplay,
  KeyedSinglesMatchNamePositionDisplay,
  UmpireMatchAndKey,
} from "./renderScoreboard";

export interface TeamSelectionDisplay {
  display: string;
  selected: boolean;
}

export const getMatchTeamSelectionDisplays = (
  index: number,
  umpireMatchAndKeys: UmpireMatchAndKey[],
  keyedSinglesMatchNamePositionDisplays: KeyedSinglesMatchNamePositionDisplay[],
  keyedDoublesMatchNamesPositionDisplay: KeyedDoublesMatchNamesPositionDisplay,
): { home: TeamSelectionDisplay; away: TeamSelectionDisplay } => {
  if (isSingles(index, umpireMatchAndKeys)) {
    const keyedSinglesMatchNamePositionDisplay =
      keyedSinglesMatchNamePositionDisplays[index];

    const getPlayerDisplay = (isHome: boolean): TeamSelectionDisplay => {
      const nameOrPositionIdentifier = isHome
        ? keyedSinglesMatchNamePositionDisplay.homePlayer1
        : keyedSinglesMatchNamePositionDisplay.awayPlayer1;
      if (nameOrPositionIdentifier.name !== undefined) {
        return {
          //todo - being distinct
          display: getInitials(nameOrPositionIdentifier.name),
          selected: true,
        };
      }
      return {
        display: nameOrPositionIdentifier.positionDisplay,
        selected: false,
      };
    };

    return {
      home: getPlayerDisplay(true),
      away: getPlayerDisplay(false),
    };
  }

  const getDoublesDisplay = (isHome: boolean) => {
    const player1NameAndPositionIdentifier = isHome
      ? keyedDoublesMatchNamesPositionDisplay.homePlayer1
      : keyedDoublesMatchNamesPositionDisplay.awayPlayer1;
    if (player1NameAndPositionIdentifier === undefined) {
      return { display: "-", selected: false };
    }
    const player2NameAndPositionIdentifier = isHome
      ? keyedDoublesMatchNamesPositionDisplay.homePlayer2
      : keyedDoublesMatchNamesPositionDisplay.awayPlayer2;

    return {
      display: `${player1NameAndPositionIdentifier.positionDisplay} ${player2NameAndPositionIdentifier?.positionDisplay}`,
      selected: true,
    };
  };
  return {
    home: getDoublesDisplay(true),
    away: getDoublesDisplay(false),
  };
};
