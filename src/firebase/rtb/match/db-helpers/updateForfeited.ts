import { Database, ref, update } from "firebase/database";
import { getConcedeOrForfeitUpdate } from "./getConcedeOrForfeitUpdate";
import { createRootUpdater } from "./createRootUpdater";

export const updateForfeited = (
  keys: string[],
  forfeited: boolean,
  isHome: boolean,
  db: Database,
) => {
  const updater = createRootUpdater();
  keys.forEach((key) => {
    const updatedMatch = getConcedeOrForfeitUpdate(forfeited, false, isHome);
    updater.updateListItem("matches", key, updatedMatch);
  });
  return update(ref(db), updater.values);
};
