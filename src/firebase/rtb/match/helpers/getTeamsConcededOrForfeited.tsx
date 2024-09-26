import { ConcedeOrForfeit, DbMatch } from "../dbMatch";

export interface TeamConcededOrForfeited {
  conceded: boolean;
  forefeited: boolean;
}

export interface TeamsConcededOrForfeited {
  team1: TeamConcededOrForfeited;
  team2: TeamConcededOrForfeited;
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
    team1: getTeamConcededOrForfeited(match.team1ConcedeOrForfeit),
    team2: getTeamConcededOrForfeited(match.team2ConcedeOrForfeit),
  };
};
