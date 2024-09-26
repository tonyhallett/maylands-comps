import { equalTo } from "firebase/database";
import { useState, useEffect } from "react";
import { useMatchesRef, useLeagueMatchesRef } from "../../../firebase/rtb/root";
import { DbLeagueMatch } from "../../../firebase/rtb/team";
import {
  onListItemValueTyped,
  orderByChildQuery,
  onChildAddedTyped,
  onChildChangedTyped,
} from "../../../firebase/rtb/typeHelpers";
import { DbMatch } from "../../../firebase/rtb/match/dbMatch";
export interface MatchAndKey {
  match: DbMatch;
  key: string;
}

export const useLeagueMatchAndMatches = (leagueMatchId: string) => {
  const matchesRef = useMatchesRef();
  const leagueMatchesRef = useLeagueMatchesRef();
  const [leagueMatch, setLeagueMatch] = useState<DbLeagueMatch | undefined>(
    undefined,
  );
  const [matchAndKeys, setMatchAndKeys] = useState<MatchAndKey[]>([]);
  useEffect(() => {
    const unlistenThisLeagueMatch = onListItemValueTyped(
      leagueMatchId,
      leagueMatchesRef,
      (snapshot) => {
        const leagueMatch = snapshot.val();
        setLeagueMatch(leagueMatch);
      },
    );
    const thisLeagueMatchMatchesQuery = orderByChildQuery(
      matchesRef,
      "containerId",
      equalTo(leagueMatchId),
    );

    const unsubscribeMatchAdded = onChildAddedTyped(
      thisLeagueMatchMatchesQuery,
      (snapshot) => {
        const match = snapshot.val();
        setMatchAndKeys((prev) => [...prev, { match, key: snapshot.key! }]);
      },
    );
    const unsubscribeMatchChanged = onChildChangedTyped(
      thisLeagueMatchMatchesQuery,
      (snapshot) => {
        const match = snapshot.val();
        setMatchAndKeys((prev) => {
          const index = prev.findIndex((mk) => mk.key === snapshot.key);
          const next = [...prev];
          next[index] = { match, key: snapshot.key! };
          return next;
        });
      },
    );
    return () => {
      unlistenThisLeagueMatch();
      unsubscribeMatchAdded();
      unsubscribeMatchChanged();
    };
  }, [leagueMatchId, matchesRef, leagueMatchesRef]);
  return [leagueMatch, matchAndKeys] as const;
};
