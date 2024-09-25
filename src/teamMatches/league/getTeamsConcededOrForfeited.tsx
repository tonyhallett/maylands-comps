import { ConcedeOrForfeit, DbMatch } from "../../firebase/rtb/match/dbMatch";

export interface TeamConcededOrForfeited {
  conceded: boolean;
  forefeited: boolean;
}

export interface TeamsConcededOrForfeited {
  home: TeamConcededOrForfeited;
  away: TeamConcededOrForfeited;
}

export const getTeamsConcededOrForfeited = (
  match: DbMatch,
): TeamsConcededOrForfeited => {
  const getForfeited = (concedeOrForfeit: ConcedeOrForfeit | undefined) =>
    concedeOrForfeit === undefined ? false : !concedeOrForfeit.isConcede;
  const getConceded = (concedeOrForfeit: ConcedeOrForfeit | undefined) =>
    !!concedeOrForfeit?.isConcede;

  const getTeamConcededOrForfeited = (
    concedeOrForfeit: ConcedeOrForfeit | undefined,
  ): TeamConcededOrForfeited => {
    return {
      conceded: getConceded(concedeOrForfeit),
      forefeited: getForfeited(concedeOrForfeit),
    };
  };

  return {
    home: getTeamConcededOrForfeited(match.team1ConcedeOrForfeit),
    away: getTeamConcededOrForfeited(match.team2ConcedeOrForfeit),
  };
};
