import { Player } from "../../../umpire";
import { PlayerNames } from "../../UmpireController";
import { PlayerAndName } from "./PlayerAndName";

export function mapNames(
  players: readonly Player[],
  playersNames: PlayerNames,
): PlayerAndName[] {
  return players.map((player) => {
    const playerAndName = { player, name: "" };
    switch (player) {
      case "Team1Player1":
        playerAndName.name = playersNames.team1Player1Name;
        break;
      case "Team2Player1":
        playerAndName.name = playersNames.team2Player1Name;
        break;
      case "Team1Player2":
        playerAndName.name = playersNames.team1Player2Name as string;
        break;
      default:
        playerAndName.name = playersNames.team2Player2Name as string;
    }
    return playerAndName;
  });
}
