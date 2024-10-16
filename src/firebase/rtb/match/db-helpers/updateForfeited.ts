import { Database } from "firebase/database";
import { getConcedeOrForfeitUpdate } from "./getConcedeOrForfeitUpdate";
import { createRootUpdater } from "./createRootUpdater";

export const updateForfeited = (
  keys: string[],
  forfeited: boolean,
  isHome: boolean,
  db: Database,
) => {
  const { updateListItem, update } = createRootUpdater(db);
  keys.forEach((key) => {
    const updatedMatch = getConcedeOrForfeitUpdate(forfeited, false, isHome);
    updateListItem("matches", key, updatedMatch);
  });
  return update();
};
