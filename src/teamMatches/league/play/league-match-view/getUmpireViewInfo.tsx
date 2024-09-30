import { MatchState, Umpire } from "../../../../umpire";
import { MatchInfo, PlayerNames } from "../../../../umpireView";
import {
  KeyedDoublesMatchNamesPositionDisplay,
  KeyedSinglesMatchNamePositionDisplay,
  UmpireMatchAndKey,
} from "../league-match-selection/renderScoresheet-type";

export interface UmpireViewInfo {
  umpire: Umpire;
  rules: MatchInfo;
  playerNames: PlayerNames;
  matchState: MatchState;
}

const getPlayerNames = (
  keyedSinglesMatchNamePositionDisplays: KeyedSinglesMatchNamePositionDisplay[],
  keyedDoublesMatchNamesPositionDisplay: KeyedDoublesMatchNamesPositionDisplay,
  umpireMatchIndex: number,
): PlayerNames => {
  return umpireMatchIndex! === 9
    ? getDoublesPlayerNames(keyedDoublesMatchNamesPositionDisplay)
    : getSinglesPlayerNames(
        keyedSinglesMatchNamePositionDisplays,
        umpireMatchIndex,
      );
};

const getDoublesPlayerNames = (
  keyedDoublesMatchNamesPositionDisplay: KeyedDoublesMatchNamesPositionDisplay,
): PlayerNames => {
  return {
    team1Player1Name: keyedDoublesMatchNamesPositionDisplay.homePlayer1!.name,
    team2Player1Name: keyedDoublesMatchNamesPositionDisplay.awayPlayer1!.name,
    team1Player2Name: keyedDoublesMatchNamesPositionDisplay.homePlayer2!.name,
    team2Player2Name: keyedDoublesMatchNamesPositionDisplay.awayPlayer2!.name,
  };
};

const getSinglesPlayerNames = (
  keyedSinglesMatchNamePositionDisplays: KeyedSinglesMatchNamePositionDisplay[],
  umpireMatchIndex: number,
): PlayerNames => {
  const singles = keyedSinglesMatchNamePositionDisplays[umpireMatchIndex!];
  return {
    team1Player1Name: singles.homePlayer1.name!,
    team2Player1Name: singles.awayPlayer1.name!,
    team1Player2Name: undefined,
    team2Player2Name: undefined,
  };
};

export const getUmpireViewInfo = (
  umpireMatchIndex: number | undefined,
  umpireMatchAndKeys: UmpireMatchAndKey[],
  keyedSinglesMatchNamePositionDisplays: KeyedSinglesMatchNamePositionDisplay[],
  keyedDoublesMatchNamesPositionDisplay: KeyedDoublesMatchNamesPositionDisplay,
): UmpireViewInfo | undefined => {
  if (umpireMatchIndex !== undefined) {
    const umpireMatchAndKey = umpireMatchAndKeys[umpireMatchIndex];
    const umpire = umpireMatchAndKey.umpire;
    const rules = {
      bestOf: umpire.bestOf,
      upTo: umpire.upTo,
      clearBy2: umpire.clearBy2,
      numServes: umpire.numServes,
      team1EndsAt: umpire.team1MidwayPoints,
      team2EndsAt: umpire.team2MidwayPoints,
    };
    const matchState = umpireMatchAndKey.matchState;

    const playerNames = getPlayerNames(
      keyedSinglesMatchNamePositionDisplays,
      keyedDoublesMatchNamesPositionDisplay,
      umpireMatchIndex,
    );

    const umpireViewInfo: UmpireViewInfo = {
      umpire,
      rules,
      playerNames,
      matchState,
    };
    return umpireViewInfo;
  }
};
