import { Unsubscribe, equalTo } from "firebase/database";
import { useRef, useState, useEffect } from "react";
import { DbPlayer } from "../../firebase/rtb/players";
import {
  usePlayersRef,
  useRegisteredPlayersRef,
} from "../../firebase/rtb/root";
import { DbLeagueTeam } from "../../firebase/rtb/team";
import {
  orderByChildQuery,
  onChildAddedTyped,
  onListItemValueTyped,
} from "../../firebase/rtb/typeHelpers";
import { AvailablePlayer } from "./LeagueMatchView";

export const useTeamAvailablePlayers = (
  team: DbLeagueTeam | undefined,
  isFriendly: boolean | undefined,
  predicate = () => true,
) => {
  const numAvailablePlayers = useRef<number>(0);
  const playersRef = usePlayersRef();
  const registeredPlayersRef = useRegisteredPlayersRef();
  const teamRegisteredPlayersUnsubscribes = useRef<Unsubscribe[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<AvailablePlayer[]>(
    [],
  );
  useEffect(() => {
    if (
      team !== undefined &&
      isFriendly !== undefined &&
      teamRegisteredPlayersUnsubscribes.current.length === 0 &&
      predicate()
    ) {
      const clubRegisteredPlayersQuery = orderByChildQuery(
        registeredPlayersRef,
        "clubId",
        equalTo(team.clubId),
      );
      const isInTeamOrLowerRankedTeam = (
        registeredPlayerRank: number,
        teamRank: number,
      ) => registeredPlayerRank >= teamRank;

      const unsubscribeClubRegisteredPlayers = onChildAddedTyped(
        clubRegisteredPlayersQuery,
        (snapshot) => {
          const registeredPlayer = snapshot.val();
          const isApplicablePlayer =
            isFriendly ||
            isInTeamOrLowerRankedTeam(registeredPlayer.rank, team.rank);
          if (isApplicablePlayer) {
            numAvailablePlayers.current++;
            const playerId = registeredPlayer.playerId;
            const unsubscribePlayer = onListItemValueTyped(
              playerId,
              playersRef,
              (snapshot) => {
                const player = snapshot.val() as DbPlayer;
                setAvailablePlayers((prev) => {
                  // when player changes will need to check if already added
                  const availablePlayer: AvailablePlayer = {
                    name: player.name,
                    playerId,
                    registeredPlayerId: snapshot.key!,
                    rank: registeredPlayer.rank,
                  };
                  return [...prev, availablePlayer];
                });
              },
            );
            teamRegisteredPlayersUnsubscribes.current.push(unsubscribePlayer);
          }
        },
      );
      teamRegisteredPlayersUnsubscribes.current.push(
        unsubscribeClubRegisteredPlayers,
      );
    }
  }, [
    team,
    isFriendly,
    availablePlayers,
    playersRef,
    registeredPlayersRef,
    predicate,
  ]);
  useEffect(() => {
    const unsubscribes = teamRegisteredPlayersUnsubscribes.current;
    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, []);
  return [
    availablePlayers,
    numAvailablePlayers.current > 0 &&
      numAvailablePlayers.current === availablePlayers.length,
  ] as const;
};

export const useAvailablePlayers = (
  homeTeam: DbLeagueTeam | undefined,
  awayTeam: DbLeagueTeam | undefined,
  isFriendly: boolean | undefined,
) => {
  const [awayTeamAvailablePlayers, retrievedAvailableAwayPlayers] =
    useTeamAvailablePlayers(awayTeam, isFriendly);

  const sameClubAndFriendly: boolean | undefined =
    isFriendly === undefined
      ? undefined
      : isFriendly === false
        ? false
        : homeTeam === undefined || awayTeam == undefined
          ? undefined
          : homeTeam.clubId === awayTeam.clubId;
  const [homeTeamAvailablePlayers, retrievedAvailableHomePlayers] =
    useTeamAvailablePlayers(homeTeam, isFriendly, () => {
      return sameClubAndFriendly === false;
    });

  const retrievedAvailablePlayers =
    sameClubAndFriendly === undefined
      ? false
      : sameClubAndFriendly
        ? retrievedAvailableAwayPlayers
        : retrievedAvailableHomePlayers && retrievedAvailableAwayPlayers;

  const actualHomeTeamAvailablePlayers = sameClubAndFriendly
    ? awayTeamAvailablePlayers
    : homeTeamAvailablePlayers;

  return {
    retrievedAvailablePlayers,
    homeTeamAvailablePlayers: actualHomeTeamAvailablePlayers,
    awayTeamAvailablePlayers,
  };
};
