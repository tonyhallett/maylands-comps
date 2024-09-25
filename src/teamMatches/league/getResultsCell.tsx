import { TableCell } from "@mui/material";
import { getGameScorePointStateColor } from "./getGameScorePointStateColor";
import { MatchScoreState } from "./getTeamsMatchScoreState";
import { ResultsDisplay, TeamGamesWonDisplay } from "./getResultsDisplay";
import { GameScorePointState } from "./getGameScoresDisplay";

const getMatchScoreStateColor = (state: MatchScoreState) => {
  switch (state) {
    case MatchScoreState.MatchWon:
      return getGameScorePointStateColor(GameScorePointState.Won);
    case MatchScoreState.GamePoint:
      return getGameScorePointStateColor(GameScorePointState.GamePoint);
    case MatchScoreState.MatchPoint:
      return getGameScorePointStateColor(GameScorePointState.MatchPoint);
    case MatchScoreState.Normal:
      return getGameScorePointStateColor(GameScorePointState.Normal);
    case MatchScoreState.Conceeded:
      return "#FC5B5B";
  }
};

const getGamesWonDisplay = (teamGamesWonDisplay: TeamGamesWonDisplay) => {
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
export const getResultsCell = (resultsDisplay: ResultsDisplay | undefined) => {
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
