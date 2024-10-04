import { Database, ref, update } from "firebase/database";
import { getConcedeOrForfeitUpdate } from "./getConcedeOrForfeitUpdate";
import { createRootUpdater } from "./createRootUpdater";

export interface ForfeitUpdate {
  key: string;
  forfeited: boolean;
}

export const updateForfeited = (
  updates: ForfeitUpdate[],
  isHome: boolean,
  db: Database,
) => {
  const updater = createRootUpdater();
  updates.forEach(({ key, forfeited }) => {
    const updatedMatch = getConcedeOrForfeitUpdate(forfeited, false, isHome);
    updater.updateListItem("matches", key, updatedMatch);
  });
  return update(ref(db), updater.values);
};
