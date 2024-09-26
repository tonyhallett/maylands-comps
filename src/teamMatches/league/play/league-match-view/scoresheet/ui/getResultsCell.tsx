import { TableCell } from "@mui/material";
import { getGameScorePointStateColor } from "./getGameScorePointStateColor";
import { TeamMatchScoreState } from "../../helpers/getTeamsMatchScoreState";
import { ResultsModel, TeamGamesWonModel } from "../model/getResultsModel";
import { GameScorePointState } from "../model/getGameScoresModel";

const getMatchScoreStateColor = (state: TeamMatchScoreState) => {
  switch (state) {
    case TeamMatchScoreState.MatchWon:
      return getGameScorePointStateColor(GameScorePointState.Won);
    case TeamMatchScoreState.GamePoint:
      return getGameScorePointStateColor(GameScorePointState.GamePoint);
    case TeamMatchScoreState.MatchPoint:
      return getGameScorePointStateColor(GameScorePointState.MatchPoint);
    case TeamMatchScoreState.Normal:
      return getGameScorePointStateColor(GameScorePointState.Normal);
    case TeamMatchScoreState.Conceeded:
      return "#FC5B5B";
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
