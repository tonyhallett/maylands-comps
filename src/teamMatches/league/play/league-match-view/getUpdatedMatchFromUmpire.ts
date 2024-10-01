import { DbMatch } from "../../../../firebase/rtb/match/dbMatch";
import { Umpire } from "../../../../umpire";
import { getDbMatchSaveStateFromUmpire } from "../../helpers";

export const getUpdatedMatchFromUmpire = (dbMatch: DbMatch, umpire: Umpire) => {
  const dbMatchSaveState = getDbMatchSaveStateFromUmpire(umpire);
  const updatedMatch: DbMatch = {
    ...dbMatch,
    ...dbMatchSaveState,
  };
  return updatedMatch;
};
