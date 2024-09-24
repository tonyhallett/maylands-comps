import { AvailableDoubles } from "./DoublesSelect";
import { AvailablePlayer } from "./useAvailablePlayers";

type AvailablePlayerOrNull = AvailablePlayer | null;
export interface AvailablePlayersForSelection {
  selectedHomeTeamPlayers: AvailablePlayerOrNull[];
  selectedAwayTeamPlayers: AvailablePlayerOrNull[];
  homeTeamAvailablePlayers: AvailablePlayer[][];
  awayTeamAvailablePlayers: AvailablePlayer[][];
  homeAvailableDoubles: AvailableDoubles[];
  selectedHomeDoubles: AvailableDoubles | null;
  awayAvailableDoubles: AvailableDoubles[];
  selectedAwayDoubles: AvailableDoubles | null;
}
