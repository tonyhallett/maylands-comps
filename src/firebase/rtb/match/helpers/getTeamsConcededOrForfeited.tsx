import { ConcedeOrForfeit, DbMatch } from "../dbMatch";

export interface TeamConcededOrForfeited {
  conceded: boolean;
  forfeited: boolean;
}

export interface TeamsConcededOrForfeited {
  team1: TeamConcededOrForfeited;
  team2: TeamConcededOrForfeited;
}

export const anyConcededOrForfeited = (
  teamsConcededOrForfeited: TeamsConcededOrForfeited,
) => {
  return (
    teamsConcededOrForfeited.team1.conceded ||
    teamsConcededOrForfeited.team2.conceded ||
    teamsConcededOrForfeited.team1.forfeited ||
    teamsConcededOrForfeited.team2.forfeited
  );
};

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
      forfeited: getForfeited(concedeOrForfeit),
    };
  };

  return {
    team1: getTeamConcededOrForfeited(match.team1ConcedeOrForfeit),
    team2: getTeamConcededOrForfeited(match.team2ConcedeOrForfeit),
  };
};
