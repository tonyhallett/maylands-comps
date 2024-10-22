import { ConcedeOrForfeit } from "../../../../firebase/rtb/match/dbMatch";
import { MatchWinState, isMatchWon } from "../../../../umpire/matchWinState";
import { UmpireMatchAndKey } from "./renderScoresheet-type";

export interface MatchNotCompleted {
  key: string;
  tableId: string | undefined;
  number: number;
}
export interface TablesAndMatchesNotCompleted {
  tables: string[];
  matches: MatchNotCompleted[];
}

export function getNotCompleted(
  matchWinState: MatchWinState,
  team1ConcedeOrForfeit: ConcedeOrForfeit | undefined,
  team2ConcedeOrForfeit: ConcedeOrForfeit | undefined,
) {
  return (
    !isMatchWon(matchWinState) &&
    team1ConcedeOrForfeit === undefined &&
    team2ConcedeOrForfeit === undefined
  );
}

export const mainTable = "Main";
export function getTablesAndMatchesNotCompleted(
  umpireMatchAndKeys: UmpireMatchAndKey[],
): TablesAndMatchesNotCompleted {
  return umpireMatchAndKeys.reduce<TablesAndMatchesNotCompleted>(
    (acc, umpireMatchAndKey, i) => {
      const { matchState, match } = umpireMatchAndKey;
      if (
        getNotCompleted(
          matchState.matchWinState,
          match.team1ConcedeOrForfeit,
          match.team2ConcedeOrForfeit,
        )
      ) {
        acc.matches.push({
          key: umpireMatchAndKey.key,
          tableId: match.tableId,
          number: i,
        });
      }
      if (match.tableId !== undefined && !acc.tables.includes(match.tableId)) {
        acc.tables.push(match.tableId);
      }
      return acc;
    },
    {
      tables: [mainTable],
      matches: [],
    },
  );
}
