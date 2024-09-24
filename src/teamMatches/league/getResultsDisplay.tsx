import { MatchState } from "../../umpire";
import { hasScored } from "../../umpire/matchStateHelpers";
import { TeamSelectionDisplay } from "./getMatchTeamSelectionDisplays";
import { getSimpleTeamDisplay } from "./getPlayerCell";
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
      winner: isDoubles
        ? team1Won
          ? "H"
          : "A"
        : getSimpleTeamDisplay(team1Won ? home : away),
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
