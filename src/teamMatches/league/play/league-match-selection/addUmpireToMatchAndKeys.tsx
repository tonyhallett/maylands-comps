import { MatchAndKey } from "../../db-hooks/useLeagueMatchAndMatches";
import { dbMatchSaveStateToSaveState } from "../../../../firebase/rtb/match/conversion";
import { Umpire } from "../../../../umpire";

export const addUmpireToMatchAndKeys = (matchAndKeys: MatchAndKey[]) => {
  return matchAndKeys.map((matchAndKey) => {
    const umpire = new Umpire(dbMatchSaveStateToSaveState(matchAndKey.match));
    const matchState = umpire.getMatchState();
    return {
      ...matchAndKey,
      umpire,
      matchState,
    };
  });
};
