import { useParams } from "react-router-dom";
import { PlayLeagueMatch } from "./league-match-view/PlayLeagueMatch";

export function PlayLeagueMatchRoute() {
  const params = useParams();
  return <PlayLeagueMatch leagueMatchId={params.leagueMatchId!} />;
}
