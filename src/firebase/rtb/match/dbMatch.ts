import { DBMatchSaveState } from "./conversion";
import { Root } from "../root";
import { ExtractKey, nameof } from "../typeHelpers";

export interface ConcedeOrForfeit {
  isConcede: boolean;
  reason?: string;
}

type LiveStreams = Record<string, string>;
export interface DbLiveStream {
  allTables?: LiveStreams;
  tables?: Record<string, LiveStreams>;
  games?: Record<string, LiveStreams>;
}

export interface DbMatch extends DBMatchSaveState {
  team1Player1Id?: string;
  team1Player2Id?: string;
  team2Player1Id?: string;
  team2Player2Id?: string;
  team1ConcedeOrForfeit?: ConcedeOrForfeit;
  team2ConcedeOrForfeit?: ConcedeOrForfeit;
  scoreboardWithUmpire: boolean;
  containerId?: string;
  umpired?: boolean;
  tableId?: string;
  liveStreams?: LiveStreams;
}

type TeamConcedeOrForfeitKeys = ExtractKey<
  DbMatch,
  "team1ConcedeOrForfeit" | "team2ConcedeOrForfeit"
>;
export const getTeamConcedeOrForfeitKey = (isHome): TeamConcedeOrForfeitKeys =>
  isHome ? "team1ConcedeOrForfeit" : "team2ConcedeOrForfeit";

export const matchesKey = nameof<Root>("matches");
