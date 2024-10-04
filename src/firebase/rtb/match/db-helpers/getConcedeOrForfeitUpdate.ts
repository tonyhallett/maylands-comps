import { PartialWithNullsWithoutUndefined } from "../../typeHelpers";
import { ConcedeOrForfeit, DbMatch } from "../dbMatch";

export const getConcedeOrForfeitUpdate = (
  concedeOrForfeit: boolean,
  isConcede: boolean,
  isHome: boolean,
) => {
  const concededOrForfeitUpdate: ConcedeOrForfeit | null = concedeOrForfeit
    ? {
        isConcede: isConcede,
      }
    : null;
  const updatedMatch: PartialWithNullsWithoutUndefined<DbMatch> = isHome
    ? { team1ConcedeOrForfeit: concededOrForfeitUpdate }
    : { team2ConcedeOrForfeit: concededOrForfeitUpdate };
  return updatedMatch;
};
