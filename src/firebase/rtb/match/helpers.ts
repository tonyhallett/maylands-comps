import { Database, ref, update } from "firebase/database";
import { Umpire } from "../../../umpire";
import { Root } from "../root";
import { createTypedValuesUpdater } from "../typeHelpers";
import { saveStateToDbMatchSaveState } from "./conversion";

export const createRootUpdater = createTypedValuesUpdater<Root>;
export const getDbMatchSaveStateFromUmpire = (umpire: Umpire) => {
  const saveState = umpire.getSaveState();
  return saveStateToDbMatchSaveState(saveState);
};

export interface UmpireUpdate {
  key: string;
  umpired?: true;
}

export const updateUmpired = (umpireUpdates: UmpireUpdate[], db: Database) => {
  const updater = createRootUpdater();
  updateUmpireValues(updater, umpireUpdates);
  update(ref(db), updater.values);
};

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
