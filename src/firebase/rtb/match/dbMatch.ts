import { DBMatchSaveState } from "./conversion";
import { Root } from "../root";
import { ExtractKey, nameof } from "../typeHelpers";

export interface ConcedeOrForfeit {
  isConcede: boolean;
  reason?: string;
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
}

type TeamConcedeOrForfeitKeys = ExtractKey<
  DbMatch,
  "team1ConcedeOrForfeit" | "team2ConcedeOrForfeit"
>;
export const getTeamConcedeOrForfeitKey = (isHome): TeamConcedeOrForfeitKeys =>
  isHome ? "team1ConcedeOrForfeit" : "team2ConcedeOrForfeit";

export const matchesKey = nameof<Root>("matches");
