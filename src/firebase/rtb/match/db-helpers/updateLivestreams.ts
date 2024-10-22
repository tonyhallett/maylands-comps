import { Database, ref, update } from "firebase/database";
import { Livestream } from "../../team";

export function updateLivestreams(
  db: Database,
  leagueMatchId: string,
  updates: Record<string, Livestream | null>,
): Promise<void> {
  return update(ref(db, `leagueMatches/${leagueMatchId}/livestreams`), updates);
}
