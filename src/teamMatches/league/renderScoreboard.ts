import { Database } from "firebase/database";
import { DbMatch } from "../../firebase/rtb/match/dbMatch";
import { MatchState, Umpire } from "../../umpire";
import { MatchAndKey } from "./useLeagueMatchAndMatches";

export interface UmpireMatchAndKey extends MatchAndKey {
  umpire: Umpire;
  matchState: MatchState;
}
export interface SelectedOrNotSinglePlayerNamePositionDisplay {
  name?: string;
  positionDisplay: string;
}
type SelectedDoublesPlayerNamePositionDisplay =
  Required<SelectedOrNotSinglePlayerNamePositionDisplay>;

export interface KeyedSinglesMatchNamePositionDisplay {
  match: DbMatch;
  key: string;
  homePlayer1: SelectedOrNotSinglePlayerNamePositionDisplay;
  awayPlayer1: SelectedOrNotSinglePlayerNamePositionDisplay;
}

export interface KeyedDoublesMatchNamesPositionDisplay {
  match: DbMatch;
  key: string;
  homePlayer1?: SelectedDoublesPlayerNamePositionDisplay;
  homePlayer2?: SelectedDoublesPlayerNamePositionDisplay;
  awayPlayer1?: SelectedDoublesPlayerNamePositionDisplay;
  awayPlayer2?: SelectedDoublesPlayerNamePositionDisplay;
}

export type RenderScoreboard = (
  umpireMatchAndKeys: UmpireMatchAndKey[],
  db: Database,
  keyedSinglesMatchNamePositionDisplays: KeyedSinglesMatchNamePositionDisplay[],
  keyedDoublesMatchNamesPositionDisplay: KeyedDoublesMatchNamesPositionDisplay,
) => React.ReactNode;
