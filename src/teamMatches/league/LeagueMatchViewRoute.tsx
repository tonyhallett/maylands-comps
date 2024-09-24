import { useParams } from "react-router-dom";
import { LeagueMatchView } from "./LeagueMatchView";

export function LeagueMatchViewRoute() {
  const params = useParams();
  return <LeagueMatchView leagueMatchId={params.leagueMatchId!} />;
}
