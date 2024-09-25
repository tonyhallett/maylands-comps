import { Database, ref, update } from "firebase/database";
import { Umpire } from "../../../umpire";
import { Root } from "../root";
import {
  PartialWithNullsWithoutUndefined,
  createTypedValuesUpdater,
} from "../typeHelpers";
import { saveStateToDbMatchSaveState } from "./conversion";
import { ConcedeOrForfeit, DbMatch } from "./dbMatch";

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
  umpireUpdates.forEach(({ key, umpired }) => {
    updater.updateListItem("matches", key, {
      umpired: umpired === undefined ? null : umpired,
    });
  });

  update(ref(db), updater.values);
};

export const updateConceded = (
  isHome: boolean,
  conceded: boolean,
  key: string,
  db: Database,
) => {
  const concededUpdate: ConcedeOrForfeit | null = conceded
    ? {
        isConcede: true,
      }
    : null;
  const updater = createRootUpdater();
  const updatedMatch: PartialWithNullsWithoutUndefined<DbMatch> = isHome
    ? { team1ConcedeOrForfeit: concededUpdate }
    : { team2ConcedeOrForfeit: concededUpdate };

  updater.updateListItem("matches", key, updatedMatch);
  // todo - error handling
  update(ref(db), updater.values);
};
