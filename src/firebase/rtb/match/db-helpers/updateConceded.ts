import { Database, ref, update } from "firebase/database";
import { PartialWithNullsWithoutUndefined } from "../../typeHelpers";
import { DbMatch } from "../dbMatch";
import { getConcedeOrForfeitUpdate } from "./getConcedeOrForfeitUpdate";
import { createRootUpdater } from "./createRootUpdater";

export const updateConceded = (
  concede: boolean,
  isHome: boolean,
  key: string,
  db: Database,
  addAdditionalUpdates: (
    updatedMatch: PartialWithNullsWithoutUndefined<DbMatch>,
  ) => void = () => {},
) => {
  const updatedMatch = getConcedeOrForfeitUpdate(concede, true, isHome);
  const updater = createRootUpdater();
  addAdditionalUpdates(updatedMatch);
  updater.updateListItem("matches", key, updatedMatch);

  return update(ref(db), updater.values);
};
