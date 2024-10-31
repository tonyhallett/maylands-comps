import { useParams } from "react-router-dom";
import { WatchLeagueMatch } from "./WatchLeagueMatch";

export function WatchLeagueMatchRoute() {
  const params = useParams();
  return <WatchLeagueMatch leagueMatchId={params.leagueMatchId!} />;
}
