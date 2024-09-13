import { DBMatchSaveState } from "./conversion";
import { Root } from "../root";
import { nameof } from "../typeHelpers";

export interface DbMatch extends DBMatchSaveState {
  team1Player1Id?: string;
  team1Player2Id?: string;
  team2Player1Id?: string;
  team2Player2Id?: string;
  scoreboardWithUmpire: boolean;
  containerId?: string;
}

export const matchesKey = nameof<Root>("matches");
