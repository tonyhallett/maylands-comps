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
import { Box, Card, CardContent, Container, Typography } from "@mui/material";

export interface LeagueMatchAndKey {
  leagueMatch: DbLeagueMatch;
  key: string;
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

  if (leagueMatches.length === 0) {
    return (
      <Container>
        <Typography sx={{ textAlign: "center" }} variant="h6">
          No league matches today
        </Typography>
      </Container>
    );
  }

  const links = leagueMatches.map((leagueMatch) => {
    return (
      <Card
        aria-label={leagueMatch.leagueMatch.description}
        key={leagueMatch.key}
        sx={{ mb: 1 }}
      >
        <CardContent>
          <Typography variant="h6">
            {leagueMatch.leagueMatch.description}
          </Typography>
          <Box component="span" marginRight={1}>
            <Link href={`${leagueMatch.key}`}>Play</Link>
          </Box>

          <Link href={`../watch/${leagueMatch.key}`}>Watch</Link>
        </CardContent>
      </Card>
    );
  });

  return <Box m={1}>{links}</Box>;
}
