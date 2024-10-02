import { Database, ref, update } from "firebase/database";
import { Root } from "../root";
import {
  PartialWithNullsWithoutUndefined,
  createTypedValuesUpdater,
} from "../typeHelpers";
import { ConcedeOrForfeit, DbMatch } from "./dbMatch";

export const createRootUpdater = createTypedValuesUpdater<Root>;

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

export const updateConcededOrForfeited = (
  concedeOrForfeit: boolean,
  isConcede: boolean,
  isHome: boolean,
  key: string,
  db: Database,
  addAdditionalUpdates: (
    updatedMatch: PartialWithNullsWithoutUndefined<DbMatch>,
  ) => void = () => {},
) => {
  const concededOrForfeitUpdate: ConcedeOrForfeit | null = concedeOrForfeit
    ? {
        isConcede: isConcede,
      }
    : null;
  const updater = createRootUpdater();
  const updatedMatch: PartialWithNullsWithoutUndefined<DbMatch> = isHome
    ? { team1ConcedeOrForfeit: concededOrForfeitUpdate }
    : { team2ConcedeOrForfeit: concededOrForfeitUpdate };
  addAdditionalUpdates(updatedMatch);
  updater.updateListItem("matches", key, updatedMatch);

  return update(ref(db), updater.values);
};
