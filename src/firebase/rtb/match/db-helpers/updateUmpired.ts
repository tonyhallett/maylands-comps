import { Database, ref, update } from "firebase/database";
import { createRootUpdater } from "./createRootUpdater";

export interface UmpireUpdate {
  key: string;
  umpired?: true;
}

export const updateUmpireValues = (
  updater: ReturnType<typeof createRootUpdater>,
  umpireUpdates: UmpireUpdate[],
) => {
  umpireUpdates.forEach(({ key, umpired }) => {
    updater.updateListItem("matches", key, {
      umpired: umpired === undefined ? null : umpired,
    });
  });
};

export const updateUmpired = (umpireUpdates: UmpireUpdate[], db: Database) => {
  const updater = createRootUpdater();
  updateUmpireValues(updater, umpireUpdates);
  update(ref(db), updater.values);
};
