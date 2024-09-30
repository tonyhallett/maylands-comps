import { MatchWinState } from "../../../../../../umpire/matchWinState";
import { getTeamsConcededOrForfeited } from "../../../../../../firebase/rtb/match/helpers/getTeamsConcededOrForfeited";
import { UmpireMatchAndKey } from "../../../league-match-selection/renderScoresheet-type";

export enum LeadType {
  Losing,
  Winning,
  Draw,
}
export enum LeagueMatchResultState {
  InProgress,
  Unassailable,
  Completed,
}
interface TeamLeagueMatchResult {
  score: number;
  leadType: LeadType;
}
export interface LeagueMatchResult {
  state: LeagueMatchResultState;
  home: TeamLeagueMatchResult;
  away: TeamLeagueMatchResult;
}

export const getLeagueMatchResultModel = (
  umpireMatchAndKeys: UmpireMatchAndKey[],
): LeagueMatchResult => {
  const leagueMatchResult: LeagueMatchResult = {
    state: LeagueMatchResultState.InProgress,
    home: {
      score: 0,
      leadType: LeadType.Draw,
    },
    away: {
      score: 0,
      leadType: LeadType.Draw,
    },
  };
  let numGamesConcluded = 0;
  umpireMatchAndKeys.forEach((umpireMatchKey) => {
    const teamsConcededOrForefeited = getTeamsConcededOrForfeited(
      umpireMatchKey.match,
    );
    const homeConcededOrDefaulted =
      teamsConcededOrForefeited.team1.conceded ||
      teamsConcededOrForefeited.team1.forfeited;
    const awayConcededOrDefaulted =
      teamsConcededOrForefeited.team2.conceded ||
      teamsConcededOrForefeited.team2.forfeited;
    if (homeConcededOrDefaulted && awayConcededOrDefaulted) {
      numGamesConcluded++;
    } else if (homeConcededOrDefaulted) {
      numGamesConcluded++;
      leagueMatchResult.away.score++;
    } else if (awayConcededOrDefaulted) {
      leagueMatchResult.home.score++;
      numGamesConcluded++;
    } else {
      const matchWinState = umpireMatchKey.matchState.matchWinState;
      if (matchWinState === MatchWinState.Team1Won) {
        numGamesConcluded++;
        leagueMatchResult.home.score++;
      }
      if (matchWinState === MatchWinState.Team2Won) {
        numGamesConcluded++;
        leagueMatchResult.away.score++;
      }
    }
  });
  if (leagueMatchResult.home.score > leagueMatchResult.away.score) {
    leagueMatchResult.home.leadType = LeadType.Winning;
    leagueMatchResult.away.leadType = LeadType.Losing;
  }
  if (leagueMatchResult.home.score < leagueMatchResult.away.score) {
    leagueMatchResult.home.leadType = LeadType.Losing;
    leagueMatchResult.away.leadType = LeadType.Winning;
  }
  if (numGamesConcluded === 10) {
    leagueMatchResult.state = LeagueMatchResultState.Completed;
  } else {
    if (leagueMatchResult.home.score > 5 || leagueMatchResult.away.score > 5) {
      leagueMatchResult.state = LeagueMatchResultState.Unassailable;
    }
  }
  return leagueMatchResult;
};
