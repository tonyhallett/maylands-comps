import { Database } from "firebase/database";
import { createRootUpdater } from "./createRootUpdater";

export interface UmpireUpdate {
  key: string;
  umpired?: true;
}

export const updateUmpired = (umpireUpdates: UmpireUpdate[], db: Database) => {
  const { updateListItem, update } = createRootUpdater(db);
  umpireUpdates.forEach(({ key, umpired }) => {
    updateListItem("matches", key, {
      umpired: umpired === undefined ? null : umpired,
    });
  });
  update();
};
