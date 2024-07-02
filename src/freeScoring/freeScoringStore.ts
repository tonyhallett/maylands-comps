import store, { StoreBase } from "store2";
import { FreeScoringPlayer, FreeScoringTeam } from "./types";
import { FreeScoringMatchState } from "./FreeScoringMatches";

const freeScoringPlayersStoreKey = "freeScoringPlayers";
const freeScoringTeamsStoreKey = "freeScoringTeams";
const freeScoringMatchStatesStoreKey = "freeScoringMatchStates";

const storeGetArray = <T>(key: string): T[] => {
  return store.get(key, []) as T[];
};

type StoreTransactCallback<T> = (value: T) => T | undefined | void;
export const storeTransact = <T>(
  key: string,
  callback: StoreTransactCallback<T>,
  alt: T,
): StoreBase => {
  return store.transact(key, callback, alt);
};

export const storeTransactMatchStates = (
  callback: StoreTransactCallback<FreeScoringMatchState[]>,
) =>
  storeTransact(
    freeScoringMatchStatesStoreKey,
    callback,
    [] as FreeScoringMatchState[],
  );

export const getFreeScoringMatchStates = () => {
  return storeGetArray<FreeScoringMatchState>(freeScoringMatchStatesStoreKey);
};

export const getFreeScoringPlayers = () => {
  return storeGetArray<FreeScoringPlayer>(freeScoringPlayersStoreKey);
};

export const storeTransactPlayers = (
  callback: StoreTransactCallback<FreeScoringPlayer[]>,
) =>
  storeTransact(
    freeScoringPlayersStoreKey,
    callback,
    [] as FreeScoringPlayer[],
  );

export const getFreeScoringTeams = () => {
  return storeGetArray<FreeScoringTeam>(freeScoringTeamsStoreKey);
};

export const storeTransactTeams = (
  callback: StoreTransactCallback<FreeScoringTeam[]>,
) => storeTransact(freeScoringTeamsStoreKey, callback, [] as FreeScoringTeam[]);
