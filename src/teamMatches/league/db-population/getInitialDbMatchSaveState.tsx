import { createUmpire, getDbMatchSaveStateFromUmpire } from "../helpers";

export const getInitialDbMatchSaveState = (isDoubles: boolean) => {
  return getDbMatchSaveStateFromUmpire(createUmpire(isDoubles));
};
