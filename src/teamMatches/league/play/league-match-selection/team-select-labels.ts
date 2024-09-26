import { PlayerMatchIndicesAndPositionDisplay } from "../../player-match-indices-display";
import {
  homePlayersMatchIndicesAndDisplay,
  awayPlayersMatchIndicesAndDisplay,
} from "../format/singlesLeagueMatchPlayers";

const getTeamSelectLabels = (
  playerMatchDetails: PlayerMatchIndicesAndPositionDisplay[],
) => {
  return playerMatchDetails.map(
    (playerDetails) =>
      `${playerDetails.positionDisplay} - ${playerDetails.matchIndices.map((i) => i + 1).join(", ")}`,
  );
};
export const homeTeamSelectLabels = getTeamSelectLabels(
  homePlayersMatchIndicesAndDisplay,
);
export const awayTeamSelectLabels = getTeamSelectLabels(
  awayPlayersMatchIndicesAndDisplay,
);
