import { useParams } from "react-router-dom";
import { LeagueMatchView } from "./league-match-view/LeagueMatchView";

export function LeagueMatchViewRoute() {
  const params = useParams();
  return <LeagueMatchView leagueMatchId={params.leagueMatchId!} />;
}
