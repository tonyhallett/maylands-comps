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
import {
  DbLeagueMatch,
  LivestreamService,
  leagueMatchesKey,
} from "../../firebase/rtb/team";
import { getDbToday } from "../../helpers/getDbDate";
import CenteredCircularProgress from "../../helper-components/CenteredCircularProgress";
import Link from "@mui/material/Link/Link";
import YoutubePlayer from "react-player/youtube";
import FacebookPlayer from "react-player/facebook";
import TwitchPlayer from "react-player/twitch";

export interface LeagueMatchAndKey {
  leagueMatch: DbLeagueMatch;
  key: string;
}
function getStreamsLeagueMatch(leagueMatch: DbLeagueMatch) {
  if (leagueMatch.livestreams) {
    return Object.values(leagueMatch.livestreams).map(
      (livestream) => livestream,
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

  const links = leagueMatches.map((leagueMatch) => {
    return (
      <Link
        key={`leaguematch-${leagueMatch.key}`}
        style={{ display: "block" }}
        href={`${leagueMatch.key}`}
      >
        {leagueMatch.leagueMatch.description}
      </Link>
    );
  });
  const allLivestreams = leagueMatches.flatMap((leagueMatch) =>
    getStreamsLeagueMatch(leagueMatch.leagueMatch),
  );
  return (
    <div>
      {links}
      {allLivestreams.map((livestream) => {
        switch (livestream.service) {
          case LivestreamService.youtube:
            return (
              <YoutubePlayer
                key={livestream.playerUrl}
                url={livestream.playerUrl!}
              />
            );
          case LivestreamService.facebook:
            // todo need to set up an app
            return (
              <FacebookPlayer
                key={livestream.playerUrl}
                url={livestream.playerUrl!}
              />
            );
          case LivestreamService.twitch:
            return (
              <TwitchPlayer
                key={livestream.playerUrl}
                url={livestream.playerUrl!}
              />
            );
          case LivestreamService.instagram:
            alert("Instagram live stream");
            return <a href={livestream.url}>Instagram live stream</a>;
        }
      })}
    </div>
  );
}
