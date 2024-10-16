import { useEffect, useState } from "react";
import { useRTB } from "../../firebase/rtb/rtbProvider";
import {
  child,
  equalTo,
  get,
  orderByChild,
  query,
  ref,
} from "firebase/database";
import { DbLeagueMatch, leagueMatchesKey } from "../../firebase/rtb/team";
import { getDbToday } from "../../helpers/getDbDate";
import CenteredCircularProgress from "../../helper-components/CenteredCircularProgress";
import Link from "@mui/material/Link/Link";
import ReactPlayer from "react-player/youtube";

export interface LeagueMatchAndKey {
  leagueMatch: DbLeagueMatch;
  key: string;
}
function getStreamsLeagueMatch(leagueMatch: DbLeagueMatch) {
  if (leagueMatch.livestreams) {
    return Object.values(leagueMatch.livestreams).map(
      (livestream) => livestream.url,
    );
  }
  return [];
}
export function LeagueMatchLinks() {
  const db = useRTB();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [leagueMatches, setLeagueMatches] = useState<LeagueMatchAndKey[]>([]);

  useEffect(() => {
    const leagueMatchesRef = child(ref(db), leagueMatchesKey);
    const dateQuery = query(
      leagueMatchesRef,
      equalTo(getDbToday()),
      orderByChild("date"),
    );
    // should use get as should not need to get any others
    get(dateQuery)
      .then((snapshot) => {
        setLoading(false);
        const fetchedLeagueMatches: LeagueMatchAndKey[] = [];
        snapshot.forEach((childSnapshot) => {
          const leagueMatch = childSnapshot.val() as DbLeagueMatch;
          fetchedLeagueMatches.push({
            leagueMatch,
            key: childSnapshot.key,
          });
        });
        setLeagueMatches(fetchedLeagueMatches);
      })
      .catch((reason) => {
        setError(reason.message);
      });
  }, [db]);

  if (error !== undefined) {
    return <div>{error}</div>;
  }

  if (loading) {
    return <CenteredCircularProgress />;
  }

  const links = leagueMatches.map((leagueMatch) => (
    <Link
      key={leagueMatch.key}
      style={{ display: "block" }}
      href={`${leagueMatch.key}`}
    >
      {leagueMatch.leagueMatch.description}
    </Link>
  ));
  const allLivestreams = leagueMatches.flatMap((leagueMatch) =>
    getStreamsLeagueMatch(leagueMatch.leagueMatch),
  );
  return (
    <div>
      {links}
      {allLivestreams.map((url) => {
        // if instagram show a link
        /// for now demoing youtube
        return <ReactPlayer key={url} url={url} />;
      })}
    </div>
  );
}
