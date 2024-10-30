import { Database } from "firebase/database";
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
  ) => void = () => {
    // do nothing
  },
) => {
  const updatedMatch = getConcedeOrForfeitUpdate(concede, true, isHome);
  const { updateListItem, update } = createRootUpdater(db);
  addAdditionalUpdates(updatedMatch);
  updateListItem("matches", key, updatedMatch);

  return update();
};
