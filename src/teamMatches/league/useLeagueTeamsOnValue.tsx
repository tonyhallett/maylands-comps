import { DbLeagueMatch } from "../../firebase/rtb/team";
import { useTeamOnValue } from "./useTeamOnValue";

export const useLeagueTeamsOnValue = (
  leagueMatch: DbLeagueMatch | undefined,
) => {
  const homeTeam = useTeamOnValue(leagueMatch?.homeTeamId);
  const awayTeam = useTeamOnValue(leagueMatch?.awayTeamId);
  return [homeTeam, awayTeam] as const;
};
