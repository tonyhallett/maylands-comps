import { getInitials } from "../../../../../../umpireView/helpers";
import { isSingles } from "../../../../helpers";
import {
  KeyedDoublesMatchNamesPositionDisplay,
  KeyedSinglesMatchNamePositionDisplay,
  UmpireMatchAndKey,
} from "../../../league-match-selection/renderScoresheet-type";

export interface TeamSelectionModel {
  player1: string;
  player2?: string;
  selected: boolean;
}

export const getMatchTeamsSelectionModel = (
  index: number,
  umpireMatchAndKeys: UmpireMatchAndKey[],
  keyedSinglesMatchNamePositionDisplays: KeyedSinglesMatchNamePositionDisplay[],
  keyedDoublesMatchNamesPositionDisplay: KeyedDoublesMatchNamesPositionDisplay,
): { home: TeamSelectionModel; away: TeamSelectionModel } => {
  if (isSingles(index, umpireMatchAndKeys)) {
    const keyedSinglesMatchNamePositionDisplay =
      keyedSinglesMatchNamePositionDisplays[index];

    const getPlayerDisplay = (isHome: boolean): TeamSelectionModel => {
      const nameOrPositionIdentifier = isHome
        ? keyedSinglesMatchNamePositionDisplay.homePlayer1
        : keyedSinglesMatchNamePositionDisplay.awayPlayer1;
      if (nameOrPositionIdentifier.name !== undefined) {
        return {
          //todo - being distinct
          player1: getInitials(nameOrPositionIdentifier.name),
          selected: true,
        };
      }
      return {
        player1: nameOrPositionIdentifier.positionDisplay,
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
      return { player1: "-", player2: "-", selected: false };
    }
    const player2NameAndPositionIdentifier = isHome
      ? keyedDoublesMatchNamesPositionDisplay.homePlayer2
      : keyedDoublesMatchNamesPositionDisplay.awayPlayer2;

    return {
      player1: player1NameAndPositionIdentifier.positionDisplay,
      player2: player2NameAndPositionIdentifier!.positionDisplay,
      selected: true,
    };
  };
  return {
    home: getDoublesDisplay(true),
    away: getDoublesDisplay(false),
  };
};
