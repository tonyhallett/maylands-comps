import { MatchAndKey } from "../../db-hooks/useLeagueMatchAndMatches";
import { dbMatchSaveStateToSaveState } from "../../../../firebase/rtb/match/conversion";
import { Umpire } from "../../../../umpire";
import { DbMatch } from "../../../../firebase/rtb/match/dbMatch";
import { UmpireMatchAndKey } from "./renderScoresheet-type";

const recreateUmpireFromDbMatch = (match: DbMatch) =>
  new Umpire(dbMatchSaveStateToSaveState(match));

export const addUmpireToMatchAndKeys = (matchAndKeys: MatchAndKey[]) => {
  return matchAndKeys.map((matchAndKey) => {
    const umpire = recreateUmpireFromDbMatch(matchAndKey.match);
    const matchState = umpire.getMatchState();
    return {
      ...matchAndKey,
      umpire,
      matchState,
    } as UmpireMatchAndKey;
  });
};
