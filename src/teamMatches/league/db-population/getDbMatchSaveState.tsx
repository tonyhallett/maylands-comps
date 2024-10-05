import { getDbMatchSaveStateFromUmpire } from "../helpers";
import { createLeagueMatchUmpire } from "./createLeagueMatchUmpire";

export const getDbMatchSaveState = (isDoubles: boolean) => {
  return getDbMatchSaveStateFromUmpire(createLeagueMatchUmpire(isDoubles));
};
