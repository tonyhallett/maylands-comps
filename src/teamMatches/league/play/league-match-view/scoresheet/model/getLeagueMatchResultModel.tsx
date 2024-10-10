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
    const match = umpireMatchKey.match;
    const teamsConcededOrForfeited = getTeamsConcededOrForfeited(match);
    const homeConcededOrDefaulted =
      teamsConcededOrForfeited.team1.conceded ||
      teamsConcededOrForfeited.team1.forfeited;
    const awayConcededOrDefaulted =
      teamsConcededOrForfeited.team2.conceded ||
      teamsConcededOrForfeited.team2.forfeited;
    if (homeConcededOrDefaulted && awayConcededOrDefaulted) {
      numGamesConcluded++;
    } else if (homeConcededOrDefaulted) {
      if (match.team2Player1Id !== undefined) {
        numGamesConcluded++;
        leagueMatchResult.away.score++;
      }
    } else if (awayConcededOrDefaulted) {
      if (match.team1Player1Id !== undefined) {
        numGamesConcluded++;
        leagueMatchResult.home.score++;
      }
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
