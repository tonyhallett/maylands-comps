import { MatchState } from "../../../../../../umpire";
import { hasScored } from "../../../../../../umpire/matchStateHelpers";
import { TeamSelectionModel } from "./getMatchTeamsSelectionModel";
import { getSimpleTeamDisplay } from "../ui/getPlayerCell";
import { TeamsConcededOrForfeited } from "../../../../../../firebase/rtb/match/helpers/getTeamsConcededOrForfeited";
import {
  TeamMatchScoreState,
  TeamsMatchScoreState,
} from "../../helpers/getTeamsMatchScoreState";

export interface TeamGamesWonModel {
  games: number;
  state: TeamMatchScoreState;
}

export interface ResultsModel {
  home: TeamGamesWonModel;
  away: TeamGamesWonModel;
  winner?: string;
}

const getWinnerDisplay = (
  isDoubles: boolean,
  team1Won: boolean,
  home: TeamSelectionModel,
  away: TeamSelectionModel,
) => {
  return isDoubles
    ? team1Won
      ? "H"
      : "A"
    : getSimpleTeamDisplay(team1Won ? home : away);
};

export const getResultsModel = (
  home: TeamSelectionModel,
  away: TeamSelectionModel,
  matchState: MatchState,
  teamsMatchScoreState: TeamsMatchScoreState,
  umpired: boolean | undefined,
  isDoubles: boolean,
  teamsConcededOrForfeited: TeamsConcededOrForfeited,
): ResultsModel | undefined => {
  const homeConceded = teamsConcededOrForfeited.team1.conceded;
  const awayConceded = teamsConcededOrForfeited.team2.conceded;
  if (homeConceded && awayConceded) {
    return {
      home: {
        games: 0,
        state: TeamMatchScoreState.Conceeded,
      },
      away: {
        games: 0,
        state: TeamMatchScoreState.Conceeded,
      },
    };
  }
  if (homeConceded || awayConceded) {
    const conceededKey = homeConceded ? "home" : "away";
    const notConceededKey = homeConceded ? "away" : "home";
    return {
      [conceededKey]: {
        games: 0,
        state: TeamMatchScoreState.Conceeded,
      },
      [notConceededKey]: {
        games: 3,
        state: TeamMatchScoreState.MatchWon,
      },
      winner: getWinnerDisplay(isDoubles, !homeConceded, home, away),
    } as unknown as ResultsModel;
  }

  const team1Won = teamsMatchScoreState.home === TeamMatchScoreState.MatchWon;
  if (team1Won || teamsMatchScoreState.away === TeamMatchScoreState.MatchWon) {
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
