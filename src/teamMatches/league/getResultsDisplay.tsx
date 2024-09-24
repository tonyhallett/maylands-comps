import { MatchState } from "../../umpire";
import { hasScored } from "../../umpire/matchStateHelpers";
import { TeamSelectionDisplay } from "./getMatchTeamSelectionDisplays";
import {
  MatchScoreState,
  TeamsMatchScoreState,
} from "./getTeamsMatchScoreState";

export interface TeamGamesWonDisplay {
  games: number;
  state: MatchScoreState;
}

export interface ResultsDisplay {
  home: TeamGamesWonDisplay;
  away: TeamGamesWonDisplay;
  winner?: string;
}

export const getWinnerDisplay = (
  winner: string,
  isDoubles: boolean,
  isHome: boolean,
) => {
  const doublesWinner = isHome ? "H" : "A";
  return isDoubles ? doublesWinner : winner;
};

export const getResultsDisplay = (
  home: TeamSelectionDisplay,
  away: TeamSelectionDisplay,
  matchState: MatchState,
  teamsMatchScoreState: TeamsMatchScoreState,
  umpired: boolean | undefined,
  isDoubles: boolean,
): ResultsDisplay | undefined => {
  const team1Won = teamsMatchScoreState.home === MatchScoreState.MatchWon;
  if (team1Won || teamsMatchScoreState.away === MatchScoreState.MatchWon) {
    return {
      home: {
        games: matchState.team1Score.games,
        state: teamsMatchScoreState.home,
      },
      away: {
        games: matchState.team2Score.games,
        state: teamsMatchScoreState.away,
      },
      winner: getWinnerDisplay(
        team1Won ? home.display : away.display,
        isDoubles,
        team1Won,
      ),
    };
  }

  if (hasScored(matchState) || umpired !== undefined) {
    return {
      home: {
        games: matchState.team1Score.games,
        state: teamsMatchScoreState.home,
      },
      away: {
        games: matchState.team2Score.games,
        state: teamsMatchScoreState.away,
      },
    };
  }

  return undefined;
};
