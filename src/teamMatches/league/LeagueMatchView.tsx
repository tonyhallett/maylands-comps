import { equalTo, ref, update } from "firebase/database";
import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DbMatch } from "../../firebase/rtb/match/dbMatch";
import { DbPlayer } from "../../firebase/rtb/players";
import { DbLeagueTeam, DbLeagueMatch } from "../../firebase/rtb/team";
import { singlesLeagueMatchPlayers } from "./singlesLeagueMatchPlayers";
import {
  Root,
  useLeagueMatchesRef,
  useMatchesRef,
  usePlayersRef,
  useRegisteredPlayersRef,
  useTeamsRef,
} from "../../firebase/rtb/root";
import {
  createTypedValuesUpdater,
  onChildAddedTyped,
  onChildChangedTyped,
  onListItemValueTyped,
  orderByChildQuery,
} from "../../firebase/rtb/typeHelpers";
import { TeamsMatchPlayersSelect } from "../teamMatchPlayerSelect";
import { useRTB } from "../../firebase/rtb/rtbProvider";

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
type AvailablePlayerOrUndefined = AvailablePlayer | undefined;
type TeamSelectedPlayers = [
  AvailablePlayerOrUndefined,
  AvailablePlayerOrUndefined,
  AvailablePlayerOrUndefined,
];
interface AvailablePlayersForSelection {
  selectedHomeTeamPlayers: TeamSelectedPlayers;
  selectedAwayTeamPlayers: TeamSelectedPlayers;
  homeTeamAvailablePlayers: AvailablePlayer[];
  awayTeamAvailablePlayers: AvailablePlayer[];
}

const homePlayerMatchIndices = [
  [0, 4, 8],
  [1, 3, 6],
  [2, 5, 7],
];

const awayPlayerMatchIndices = [
  [0, 3, 7],
  [1, 5, 8],
  [2, 4, 6],
];

export function LeagueMatchView() {
  const params = useParams();
  const db = useRTB();
  const leagueMatchesRef = useLeagueMatchesRef();
  const matchesRef = useMatchesRef();
  const teamsRef = useTeamsRef();
  const playersRef = usePlayersRef();
  const registeredPlayersRef = useRegisteredPlayersRef();
  const [leagueMatch, setLeagueMatch] = useState<DbLeagueMatch | undefined>(
    undefined,
  );
  const [matchAndKeys, setMatchAndKeys] = useState<MatchAndKey[]>([]);
  const [homeTeam, setHomeTeam] = useState<DbLeagueTeam | undefined>(undefined);
  const [awayTeam, setAwayTeam] = useState<DbLeagueTeam | undefined>(undefined);
  const [availablePlayers, setAvailablePlayers] = useState<
    AvailablePlayers | undefined
  >(undefined);
  const numAvailablePlayers = useRef<
    { home: number; away: number } | undefined
  >(undefined);
  const [availablePlayersForSelection, setAvailablePlayersForSelection] =
    useState<AvailablePlayersForSelection>({
      awayTeamAvailablePlayers: [],
      homeTeamAvailablePlayers: [],
      selectedAwayTeamPlayers: [undefined, undefined, undefined],
      selectedHomeTeamPlayers: [undefined, undefined, undefined],
    });

  useEffect(() => {
    const unlistenLeagueMatch = onListItemValueTyped(
      params.leagueMatchId,
      leagueMatchesRef,
      (snapshot) => {
        const leagueMatch = snapshot.val();
        setLeagueMatch(leagueMatch);
      },
    );
    const thisLeagueMatchMatchesQuery = orderByChildQuery(
      matchesRef,
      "containerId",
      equalTo(params.leagueMatchId),
    );

    const unsubscribeAdded = onChildAddedTyped(
      thisLeagueMatchMatchesQuery,
      (snapshot) => {
        const match = snapshot.val();
        setMatchAndKeys((prev) => [...prev, { match, key: snapshot.key }]);
      },
    );
    const unsubscribeChanged = onChildChangedTyped(
      thisLeagueMatchMatchesQuery,
      (snapshot) => {
        const match = snapshot.val();
        setMatchAndKeys((prev) => {
          const index = prev.findIndex((mk) => mk.key === snapshot.key);
          const next = [...prev];
          next[index] = { match, key: snapshot.key };
          return next;
        });
      },
    );
    return () => {
      unlistenLeagueMatch();
      unsubscribeAdded();
      unsubscribeChanged();
    };
  }, [params.leagueMatchId, matchesRef, leagueMatchesRef]);

  useEffect(() => {
    if (leagueMatch?.homeTeamId !== undefined) {
      const unlisten = onListItemValueTyped(
        leagueMatch.homeTeamId,
        teamsRef,
        (snapshot) => {
          setHomeTeam(snapshot.val());
        },
      );
      return unlisten;
    }
  }, [leagueMatch?.homeTeamId, teamsRef]);

  useEffect(() => {
    if (leagueMatch?.awayTeamId !== undefined) {
      const unlisten = onListItemValueTyped(
        leagueMatch.awayTeamId,
        teamsRef,
        (snapshot) => {
          setAwayTeam(snapshot.val());
        },
      );
      return unlisten;
    }
  }, [leagueMatch?.awayTeamId, teamsRef]);

  const retrievedAvailablePlayers =
    availablePlayers !== undefined &&
    availablePlayers.home.length === numAvailablePlayers.current!.home &&
    availablePlayers.away.length === numAvailablePlayers.current!.away;

  // populate selected from the matches
  useEffect(() => {
    if (retrievedAvailablePlayers && matchAndKeys !== undefined) {
      const firstMatch = matchAndKeys[0].match;
      const playerA = firstMatch.team1Player1Id;
      const playerX = firstMatch.team2Player1Id;
      const secondMatch = matchAndKeys[1].match;
      const playerB = secondMatch.team1Player1Id;
      const playerY = secondMatch.team2Player1Id;
      const thirdMatch = matchAndKeys[2].match;
      const playerC = thirdMatch.team1Player1Id;
      const playerZ = thirdMatch.team2Player1Id;

      const selectedHomeTeamPlayers: TeamSelectedPlayers = [
        availablePlayers.home.find((player) => player.playerId === playerA),
        availablePlayers.home.find((player) => player.playerId === playerB),
        availablePlayers.home.find((player) => player.playerId === playerC),
      ];
      const selectedAwayTeamPlayers: TeamSelectedPlayers = [
        availablePlayers.away.find((player) => player.playerId === playerX),
        availablePlayers.away.find((player) => player.playerId === playerY),
        availablePlayers.away.find((player) => player.playerId === playerZ),
      ];

      const filterPlayers = (players: AvailablePlayer[]) => {
        const availablePlayers = players.filter(
          (player) =>
            !selectedHomeTeamPlayers
              .concat(selectedAwayTeamPlayers)
              .find((shtp) => shtp.playerId === player.playerId),
        );
        return availablePlayers;
      };

      const availablePlayersForSelection: AvailablePlayersForSelection = {
        homeTeamAvailablePlayers: filterPlayers(availablePlayers.home),
        awayTeamAvailablePlayers: filterPlayers(availablePlayers.away),
        selectedHomeTeamPlayers,
        selectedAwayTeamPlayers,
      };
      setAvailablePlayersForSelection(availablePlayersForSelection);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const doubles = matchAndKeys[9].match;
    }
  }, [availablePlayers, matchAndKeys, retrievedAvailablePlayers]);
  const isFriendly = leagueMatch?.isFriendly;
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
      const clubRegisteredPlayersQuery = orderByChildQuery(
        registeredPlayersRef,
        "clubId",
        equalTo(awayTeam.clubId),
      );
      const unsubscribe = onChildAddedTyped(
        clubRegisteredPlayersQuery,
        (snapshot) => {
          const registeredPlayer = snapshot.val();
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
            return onListItemValueTyped(playerId, playersRef, (snapshot) => {
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
                  next.home = next.away.map((player) => ({ ...player }));
                }
                return next;
              });
            });
          }
        },
      );
      return unsubscribe;
    }
  }, [
    awayTeam,
    isFriendly,
    sameClubAndFriendly,
    availablePlayers,
    playersRef,
    registeredPlayersRef,
  ]);

  // todo - common code with above
  useEffect(() => {
    if (
      homeTeam !== undefined &&
      sameClubAndFriendly !== undefined &&
      availablePlayers?.home === undefined
    ) {
      if (!sameClubAndFriendly) {
        // use common code for away team
      }
    }
  }, [homeTeam, isFriendly, sameClubAndFriendly, availablePlayers]);
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
  const getHomePlayerMatches = (position: number): MatchAndKey[] => {
    return homePlayerMatchIndices[position].map((index) => matchAndKeys[index]);
  };
  const getAwayPlayerMatches = (position: number): MatchAndKey[] => {
    return awayPlayerMatchIndices[position].map((index) => matchAndKeys[index]);
  };
  const homePlayerSelected = (
    player: AvailablePlayer | null,
    position: number,
  ) => {
    const updater = createTypedValuesUpdater<Root>();
    getHomePlayerMatches(position).forEach((matchAndKey) => {
      const playerId = player?.playerId ?? null;
      updater.updateListItem("matches", matchAndKey.key, {
        team1Player1Id: playerId,
      });
    });
    update(ref(db), updater.values);
  };
  const awayPlayerSelected = (
    player: AvailablePlayer | null,
    position: number,
  ) => {
    const updater = createTypedValuesUpdater<Root>();
    getAwayPlayerMatches(position).forEach((matchAndKey) => {
      const playerId = player?.playerId ?? null;
      updater.updateListItem("matches", matchAndKey.key, {
        team2Player1Id: playerId,
      });
    });
    update(ref(db), updater.values);
  };
  // do I put the scoreboard and the umpiring here
  //MATCHSCORE
  return (
    <>
      <div>{leagueMatch!.description}</div>
      <div>
        {homeTeam.name} vs {awayTeam.name}
      </div>
      <TeamsMatchPlayersSelect<AvailablePlayer>
        autoCompleteProps={{
          autoComplete: true, // !!! does not appear to be working
          /*
            If true, the portion of the selected suggestion that the user hasn't typed, known as the completion string, 
            appears inline after the input cursor in the textbox. 
            The inline completion string is visually highlighted and has a selected state.
        */

          autoHighlight: true, //	If true, the first option is automatically highlighted.
          clearOnEscape: true,
        }}
        numPlayers={3}
        homeTeam={{
          availablePlayers:
            availablePlayersForSelection.homeTeamAvailablePlayers,
          selectedPlayers: availablePlayersForSelection.selectedHomeTeamPlayers,
          playerSelected: homePlayerSelected,
        }}
        awayTeam={{
          availablePlayers:
            availablePlayersForSelection.awayTeamAvailablePlayers,
          selectedPlayers: availablePlayersForSelection.selectedAwayTeamPlayers,
          playerSelected: awayPlayerSelected,
        }}
      />
      {matchAndKeys.map((matchAndKey, index) => {
        const match = matchAndKey.match;
        return (
          <div key={matchAndKey.key}>
            {getIndividualMatchTitle(match, index)}
          </div>
        );
      })}
    </>
  );
}
