import {
  onValue,
  child,
  ref,
  query,
  equalTo,
  onChildAdded,
  onChildChanged,
  orderByChild,
} from "firebase/database";
import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  matchesKey,
  orderByContainerId,
  DbMatch,
} from "../../firebase/rtb/match/dbMatch";
import { playersKey, DbPlayer } from "../../firebase/rtb/players";
import { useRTB } from "../../firebase/rtb/rtbProvider";
import {
  DbLeagueTeam,
  leagueMatchesKey,
  DbLeagueMatch,
  teamsKey,
  registeredPlayersKey,
  DbRegisteredPlayer,
} from "../../firebase/rtb/team";
import { singlesLeagueMatchPlayers } from "./singlesLeagueMatchPlayers";

export interface MatchAndKey {
  match: DbMatch;
  key: string;
}

export interface AvailablePlayer {
  name: string;
  playerId: string;
  registeredPlayerId: string;
}

export interface AvailablePlayers {
  home: AvailablePlayer[];
  away: AvailablePlayer[];
}

export function LeagueMatchView() {
  const params = useParams();
  const db = useRTB();
  const [leagueDescription, setleagueDescription] = useState<
    string | undefined
  >(undefined);
  const [matchAndKeys, setMatchAndKeys] = useState<MatchAndKey[]>([]);
  const [homeTeamId, setHomeTeamId] = useState<string | undefined>(undefined);
  const [awayTeamId, setAwayTeamId] = useState<string | undefined>(undefined);
  const [homeTeam, setHomeTeam] = useState<DbLeagueTeam | undefined>(undefined);
  const [awayTeam, setAwayTeam] = useState<DbLeagueTeam | undefined>(undefined);
  const [isFriendly, setIsFriendly] = useState<boolean | undefined>(undefined);
  const [availablePlayers, setAvailablePlayers] = useState<
    AvailablePlayers | undefined
  >(undefined);
  const numAvailablePlayers = useRef<
    { home: number; away: number } | undefined
  >(undefined);

  useEffect(() => {
    //const leagueMatchesRef = child(ref(db), leagueMatchesKey);
    const unlistenLeagueMatch = onValue(
      child(ref(db), `${leagueMatchesKey}/${params.leagueMatchId}`),
      (snapshot) => {
        const leagueMatch = snapshot.val() as DbLeagueMatch;
        setIsFriendly(leagueMatch.isFriendly);
        setleagueDescription(leagueMatch.description);
        setHomeTeamId(leagueMatch.homeTeamId);
        setAwayTeamId(leagueMatch.awayTeamId);
      },
    );
    const matchesRef = child(ref(db), matchesKey); //useMatchesRef todo
    const thisLeagueMatchMatchesQuery = query(
      matchesRef,
      orderByContainerId,
      equalTo(params.leagueMatchId),
    );
    const unsubscribeAdded = onChildAdded(
      thisLeagueMatchMatchesQuery,
      (snapshot) => {
        const match = snapshot.val() as DbMatch;
        setMatchAndKeys((prev) => [...prev, { match, key: snapshot.key }]);
      },
    );
    const unsubscribeChanged = onChildChanged(
      thisLeagueMatchMatchesQuery,
      (snapshot) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const match = snapshot.val() as DbMatch;
        // use the key...
      },
    );
    return () => {
      unlistenLeagueMatch();
      unsubscribeAdded();
      unsubscribeChanged();
    };
  }, [db, params.leagueMatchId]);

  useEffect(() => {
    if (homeTeamId !== undefined) {
      const homeTeamRef = child(ref(db), `${teamsKey}/${homeTeamId}`);
      const unlisten = onValue(homeTeamRef, (snapshot) => {
        const homeTeam = snapshot.val() as DbLeagueTeam;
        setHomeTeam(homeTeam);
        // set the home team name
      });
      return unlisten;
    }
  }, [db, homeTeamId]);

  useEffect(() => {
    if (awayTeamId !== undefined) {
      const awayTeamRef = child(ref(db), `${teamsKey}/${awayTeamId}`);
      const unlisten = onValue(awayTeamRef, (snapshot) => {
        const awayTeam = snapshot.val() as DbLeagueTeam;
        setAwayTeam(awayTeam);
      });
      return unlisten;
    }
  }, [db, awayTeamId]);

  const retrievedAvailablePlayers =
    availablePlayers !== undefined &&
    availablePlayers.home.length === numAvailablePlayers.current!.home &&
    availablePlayers.away.length === numAvailablePlayers.current!.away;

  // populate selected from the matches
  useEffect(() => {
    if (retrievedAvailablePlayers && matchAndKeys !== undefined) {
      const firstMatch = matchAndKeys[0].match;
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const playerA = firstMatch.team1Player1Id;
      const playerX = firstMatch.team2Player1Id;
      const secondMatch = matchAndKeys[1].match;
      const playerB = secondMatch.team1Player1Id;
      const playerY = secondMatch.team2Player1Id;
      const thirdMatch = matchAndKeys[2].match;
      const playerC = thirdMatch.team1Player1Id;
      const playerZ = thirdMatch.team2Player1Id;

      const doubles = matchAndKeys[9].match;
      /* eslint-enable @typescript-eslint/no-unused-vars */
    }
  }, [availablePlayers, matchAndKeys, retrievedAvailablePlayers]);
  const sameClubAndFriendly: boolean | undefined =
    isFriendly === undefined
      ? undefined
      : isFriendly === false
        ? false
        : homeTeam === undefined || awayTeam == undefined
          ? undefined
          : homeTeam.clubId === awayTeam.clubId;

  //#region get available players
  // there is potential issue here that awayTeam name changes - new AwayTeam and fetch already in process
  useEffect(() => {
    if (
      awayTeam !== undefined &&
      sameClubAndFriendly !== undefined &&
      availablePlayers?.away === undefined
    ) {
      const clubRegisteredPlayersQuery = query(
        child(ref(db), registeredPlayersKey),
        equalTo(awayTeam.clubId),
        orderByChild("clubId"),
      );
      const unsubscribe = onChildAdded(
        clubRegisteredPlayersQuery,
        (snapshot) => {
          const registeredPlayer = snapshot.val() as DbRegisteredPlayer;
          const isApplicablePlayer = isFriendly || false; // todo if(registeredPlayer.rank <= awayTeam.rank)
          if (isApplicablePlayer) {
            if (numAvailablePlayers.current) {
              numAvailablePlayers.current.away++;
            } else {
              numAvailablePlayers.current = { home: 0, away: 1 };
            }
            if (sameClubAndFriendly) {
              numAvailablePlayers.current.home =
                numAvailablePlayers.current.away;
            }
            const playerId = registeredPlayer.playerId;
            return onValue(
              child(ref(db), `${playersKey}/${playerId}`),
              (snapshot) => {
                const player = snapshot.val() as DbPlayer;
                setAvailablePlayers((prev) => {
                  // when player changes will need to check if already added
                  const availablePlayer: AvailablePlayer = {
                    name: player.name,
                    playerId,
                    registeredPlayerId: snapshot.key,
                  };
                  let next: AvailablePlayers;
                  if (prev === undefined) {
                    next = {
                      home: [],
                      away: [availablePlayer],
                    };
                  } else {
                    next = {
                      ...prev,
                      away: [...prev.away, availablePlayer],
                    };
                  }
                  if (sameClubAndFriendly) {
                    next.home = next.away;
                  }
                  return next;
                });
              },
            );
          }
        },
        (error) => {
          alert(error.message);
        },
      );
      return unsubscribe;
    }
  }, [db, awayTeam, isFriendly, sameClubAndFriendly, availablePlayers]);

  // todo - common code with above
  useEffect(() => {
    if (
      homeTeam !== undefined &&
      sameClubAndFriendly !== undefined &&
      availablePlayers?.home === undefined
    ) {
      if (!sameClubAndFriendly) {
        /* const clubRegisteredPlayersQuery = query(
          child(ref(db), registeredPlayersKey),
          equalTo(homeTeam.clubId),
          orderByChild("clubId"),
        ); */
        // use common code for away team
      }
    }
  }, [db, homeTeam, isFriendly, sameClubAndFriendly, availablePlayers]);
  //#endregion
  const getIndividualMatchTitle = (match: DbMatch, index: number) => {
    if (index < singlesLeagueMatchPlayers.length) {
      const matchPlayers = singlesLeagueMatchPlayers[index];
      let homePlayerName: string = matchPlayers.home.id;
      let awayPlayerName: string = matchPlayers.home.id;
      if (match.team1Player1Id !== undefined) {
        homePlayerName = availablePlayers.home.find(
          (player) => player.playerId === match.team1Player1Id,
        )!.name;
      }
      if (match.team2Player1Id !== undefined) {
        awayPlayerName = availablePlayers.away.find(
          (player) => player.playerId === match.team2Player1Id,
        )!.name;
      }
      return `${homePlayerName} vs ${awayPlayerName}`;
    }
    return "Doubles"; //todo
  };
  if (!retrievedAvailablePlayers) {
    return <div>loading</div>;
  }

  // do I put the scoreboard and the umpiring here
  //MATCHSCORE
  return (
    <>
      <div>{leagueDescription}</div>
      <div>
        {homeTeam.name} vs {awayTeam.name}
      </div>
      {matchAndKeys.map((matchAndKey, index) => {
        const match = matchAndKey.match;
        return (
          <>
            <div key={matchAndKey.key}>
              {getIndividualMatchTitle(match, index)}
            </div>
          </>
        );
      })}
    </>
  );
}
