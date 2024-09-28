import { TableCell } from "@mui/material";
import {
  ResultsModel,
  TeamGamesWonModel,
  TeamGamesWonState,
} from "../model/getResultsModel";
import {
  concededColor,
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
    case TeamGamesWonState.Conceeded:
      return concededColor;
  }
};

const getGamesWonDisplay = (teamGamesWonDisplay: TeamGamesWonModel) => {
  return (
    <span
      style={{
        whiteSpace: "nowrap",
        color: getMatchScoreStateColor(teamGamesWonDisplay.state),
      }}
    >
      {teamGamesWonDisplay.games}
    </span>
  );
};

export const getResultsCell = (resultsDisplay: ResultsModel | undefined) => {
  let resultsNode: React.ReactNode = null;

  if (resultsDisplay !== undefined) {
    resultsNode = (
      <>
        {resultsDisplay.winner !== undefined && (
          <div>{resultsDisplay.winner}</div>
        )}
        <div>
          {getGamesWonDisplay(resultsDisplay.home)}
          <span style={{ whiteSpace: "nowrap" }}> - </span>
          {getGamesWonDisplay(resultsDisplay.away)}
        </div>
      </>
    );
  }
  return <TableCell>{resultsNode}</TableCell>;
};
