import { DbMatch } from "../../firebase/rtb/match/dbMatch";

export const isSingles = (index: number, matches: unknown[]) =>
  index < matches.length - 1;
interface WithMatch {
  match: DbMatch;
}
export const getDoublesMatch = (withMatches: WithMatch[]) =>
  withMatches[withMatches.length - 1].match;
