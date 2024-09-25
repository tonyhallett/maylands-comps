import { MatchState } from "../../umpire";
import { hasScored } from "../../umpire/matchStateHelpers";
import { TeamSelectionDisplay } from "./getMatchTeamSelectionDisplays";
import { getSimpleTeamDisplay } from "./getPlayerCell";
import { TeamsConcededOrForfeited } from "./getTeamsConcededOrForfeited";
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

const getWinnerDisplay = (
  isDoubles: boolean,
  team1Won: boolean,
  home: TeamSelectionDisplay,
  away: TeamSelectionDisplay,
) => {
  return isDoubles
    ? team1Won
      ? "H"
      : "A"
    : getSimpleTeamDisplay(team1Won ? home : away);
};

export const getResultsDisplay = (
  home: TeamSelectionDisplay,
  away: TeamSelectionDisplay,
  matchState: MatchState,
  teamsMatchScoreState: TeamsMatchScoreState,
  umpired: boolean | undefined,
  isDoubles: boolean,
  teamsConcededOrForfeited: TeamsConcededOrForfeited,
): ResultsDisplay | undefined => {
  const homeConceded = teamsConcededOrForfeited.home.conceded;
  const awayConceded = teamsConcededOrForfeited.away.conceded;
  if (homeConceded && awayConceded) {
    return {
      home: {
        games: 0,
        state: MatchScoreState.Conceeded,
      },
      away: {
        games: 0,
        state: MatchScoreState.Conceeded,
      },
    };
  }
  if (homeConceded || awayConceded) {
    const conceededKey = homeConceded ? "home" : "away";
    const notConceededKey = homeConceded ? "away" : "home";
    return {
      [conceededKey]: {
        games: 0,
        state: MatchScoreState.Conceeded,
      },
      [notConceededKey]: {
        games: 3,
        state: MatchScoreState.MatchWon,
      },
      winner: getWinnerDisplay(isDoubles, !homeConceded, home, away),
    } as unknown as ResultsDisplay;
  }

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
      winner: getWinnerDisplay(isDoubles, team1Won, home, away),
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
