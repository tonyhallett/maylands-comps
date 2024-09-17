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

type PlayerKey = keyof Pick<
  DbMatch,
  "team1Player1Id" | "team1Player2Id" | "team2Player1Id" | "team2Player2Id"
>;
export interface DoublesPlayerKeys {
  player1: PlayerKey;
  player2: PlayerKey;
}
export function getTeamDoublesPlayerKeys(team1: boolean): DoublesPlayerKeys {
  return team1
    ? {
        player1: "team1Player1Id",
        player2: "team1Player2Id",
      }
    : {
        player1: "team2Player1Id",
        player2: "team2Player2Id",
      };
}
