import { orderByChild } from "firebase/database";
import { DBMatchSaveState } from "./conversion";

export interface DbMatch extends DBMatchSaveState {
  team1Player1Id?: string;
  team1Player2Id?: string;
  team2Player1Id?: string;
  team2Player2Id?: string;
  scoreboardWithUmpire: boolean;
  containerId?: string;
}

export const matchesKey = "matches";

export const orderByContainerId = orderByChild("containerId");
