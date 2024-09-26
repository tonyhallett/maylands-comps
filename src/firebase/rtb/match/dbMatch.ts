import { DBMatchSaveState } from "./conversion";
import { Root } from "../root";
import { nameof } from "../typeHelpers";

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

export const matchesKey = nameof<Root>("matches");
