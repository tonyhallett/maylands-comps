import { ExtractKey } from "../../typeHelpers";
import { DbMatch } from "../dbMatch";

type PlayerKey = ExtractKey<
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
