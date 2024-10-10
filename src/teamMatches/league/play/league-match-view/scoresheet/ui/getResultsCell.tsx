import { TableCell } from "@mui/material";
import {
  ResultsModel,
  TeamGamesWonModel,
  TeamGamesWonState,
} from "../model/getResultsModel";
import {
  concededOrForfeitedColor,
  gamePointColor,
  matchPointColor,
  normalColor,
  winColor,
} from "./colors";

const getMatchScoreStateColor = (state: TeamGamesWonState) => {
  switch (state) {
    case TeamGamesWonState.MatchWon:
      return winColor;
    case TeamGamesWonState.GamePoint:
      return gamePointColor;
    case TeamGamesWonState.MatchPoint:
      return matchPointColor;
    case TeamGamesWonState.Normal:
      return normalColor;
    case TeamGamesWonState.Conceded:
    case TeamGamesWonState.Forfeited:
      return concededOrForfeitedColor;
  }
};
export const getTeamGamesWonAriaLabel = (isHome: boolean) =>
  `${isHome ? "Home" : "Away"} games won`;
const getGamesWonDisplay = (
  teamGamesWonDisplay: TeamGamesWonModel,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isHome: boolean,
) => {
  return (
    <span
      aria-label={getTeamGamesWonAriaLabel(isHome)}
      style={{
        whiteSpace: "nowrap",
        color: getMatchScoreStateColor(teamGamesWonDisplay.state),
      }}
    >
      {teamGamesWonDisplay.games}
    </span>
  );
};
export const gameWinnerAriaLabel = "Winner";
export const gamesWonAriaLabel = "Games won";
export const winnerAndGamesWonCellAriaLabel = "Winner and games won cell";
export const getResultsCell = (resultsDisplay: ResultsModel | undefined) => {
  let resultsNode: React.ReactNode = null;

  if (resultsDisplay !== undefined) {
    resultsNode = (
      <>
        {resultsDisplay.winner !== undefined && (
          <div aria-label={gameWinnerAriaLabel}>{resultsDisplay.winner}</div>
        )}
        <div aria-label={gamesWonAriaLabel}>
          {getGamesWonDisplay(resultsDisplay.home, true)}
          <span style={{ whiteSpace: "nowrap" }}> - </span>
          {getGamesWonDisplay(resultsDisplay.away, false)}
        </div>
      </>
    );
  }
  return (
    <TableCell aria-label={winnerAndGamesWonCellAriaLabel}>
      {resultsNode}
    </TableCell>
  );
};
