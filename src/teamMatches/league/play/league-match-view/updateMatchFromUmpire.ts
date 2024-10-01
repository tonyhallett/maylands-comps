import { Database } from "firebase/database";
import { DbMatch } from "../../../../firebase/rtb/match/dbMatch";
import { Umpire } from "../../../../umpire";
import { refTyped } from "../../../../firebase/rtb/root";
import { setTyped } from "../../../../firebase/rtb/typeHelpers";
import { getUpdatedMatchFromUmpire } from "./getUpdatedMatchFromUmpire";

export const updateMatchFromUmpire = (
  dbMatch: DbMatch,
  key: string,
  umpire: Umpire,
  db: Database,
) => {
  const matchDatabaseRef = refTyped(db, `matches/${key}`);
  return setTyped(matchDatabaseRef, getUpdatedMatchFromUmpire(dbMatch, umpire));
};
