import { MatchState } from "../../../../../../umpire";
import { hasScored } from "../../../../../../umpire/matchStateHelpers";
import { TeamSelectionModel } from "./getMatchTeamsSelectionModel";
import { getSimpleTeamDisplay } from "../ui/getPlayerCell";
import { TeamsConcededOrForfeited } from "../../../../../../firebase/rtb/match/helpers/getTeamsConcededOrForfeited";
import {
  TeamMatchWinState,
  TeamsMatchWinState,
} from "../../helpers/getTeamsMatchWinState";

export enum TeamGamesWonState {
  Normal,
  GamePoint,
  MatchPoint,
  MatchWon,
  Conceeded,
}
export interface TeamGamesWonModel {
  games: number;
  state: TeamGamesWonState;
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

const convertTeamMatchWinState = (teamMatchWinState: TeamMatchWinState) => {
  switch (teamMatchWinState) {
    case TeamMatchWinState.GamePoint:
      return TeamGamesWonState.GamePoint;
    case TeamMatchWinState.MatchPoint:
      return TeamGamesWonState.MatchPoint;
    case TeamMatchWinState.MatchWon:
      return TeamGamesWonState.MatchWon;
    case TeamMatchWinState.Normal:
      return TeamGamesWonState.Normal;
  }
};

export const getResultsModel = (
  home: TeamSelectionModel,
  away: TeamSelectionModel,
  matchState: MatchState,
  teamsMatchScoreState: TeamsMatchWinState,
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
        state: TeamGamesWonState.Conceeded,
      },
      away: {
        games: 0,
        state: TeamGamesWonState.Conceeded,
      },
    };
  }
  if (homeConceded || awayConceded) {
    const conceededKey = homeConceded ? "home" : "away";
    const notConceededKey = homeConceded ? "away" : "home";
    return {
      [conceededKey]: {
        games: 0,
        state: TeamGamesWonState.Conceeded,
      },
      [notConceededKey]: {
        games: 3,
        state: TeamGamesWonState.MatchWon,
      },
      winner: getWinnerDisplay(isDoubles, !homeConceded, home, away),
    } as unknown as ResultsModel;
  }

  const team1Won = teamsMatchScoreState.home === TeamMatchWinState.MatchWon;
  if (team1Won || teamsMatchScoreState.away === TeamMatchWinState.MatchWon) {
    return {
      home: {
        games: matchState.team1Score.games,
        state: convertTeamMatchWinState(teamsMatchScoreState.home),
      },
      away: {
        games: matchState.team2Score.games,
        state: convertTeamMatchWinState(teamsMatchScoreState.away),
      },
      winner: getWinnerDisplay(isDoubles, team1Won, home, away),
    };
  }

  if (hasScored(matchState) || umpired !== undefined) {
    return {
      home: {
        games: matchState.team1Score.games,
        state: convertTeamMatchWinState(teamsMatchScoreState.home),
      },
      away: {
        games: matchState.team2Score.games,
        state: convertTeamMatchWinState(teamsMatchScoreState.away),
      },
    };
  }

  return undefined;
};
