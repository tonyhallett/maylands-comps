import { equalTo, ref, Unsubscribe, update } from "firebase/database";
import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DbMatch } from "../../firebase/rtb/match/dbMatch";
import { DbPlayer } from "../../firebase/rtb/players";
import { DbLeagueTeam, DbLeagueMatch } from "../../firebase/rtb/team";
import {
  awayPlayerMatchDetails,
  homePlayerMatchDetails,
} from "./singlesLeagueMatchPlayers";
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

interface AvailablePlayersForSelection {
  selectedHomeTeamPlayers: AvailablePlayerOrUndefined[];
  selectedAwayTeamPlayers: AvailablePlayerOrUndefined[];
  homeTeamAvailablePlayers: AvailablePlayer[][];
  awayTeamAvailablePlayers: AvailablePlayer[][];
}
const homeTeamLabels = homePlayerMatchDetails.map(
  (playerDetails) => playerDetails.positionDisplay,
);
const awayTeamLabels = awayPlayerMatchDetails.map(
  (playerDetails) => playerDetails.positionDisplay,
);

const findHomePlayersMatchIndices = homePlayerMatchDetails.map(
  (playerMatchDetails) => playerMatchDetails.matchIndices[0],
);
const findAwayPlayersMatchIndices = awayPlayerMatchDetails.map(
  (playerMatchDetails) => playerMatchDetails.matchIndices[0],
);

const useLeagueMatchAndMatches = (leagueMatchId: string) => {
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
        setMatchAndKeys((prev) => [...prev, { match, key: snapshot.key }]);
      },
    );
    const unsubscribeMatchChanged = onChildChangedTyped(
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
      unlistenThisLeagueMatch();
      unsubscribeMatchAdded();
      unsubscribeMatchChanged();
    };
  }, [leagueMatchId, matchesRef, leagueMatchesRef]);
  return [leagueMatch, matchAndKeys] as const;
};

const useTeamOnValue = (teamId: string) => {
  const teamsRef = useTeamsRef();
  const [team, setTeam] = useState<DbLeagueTeam | undefined>(undefined);
  const unlistenRef = useRef<Unsubscribe | undefined>(undefined);
  useEffect(() => {
    if (teamId !== undefined) {
      const unlisten = onListItemValueTyped(teamId, teamsRef, (snapshot) => {
        setTeam(snapshot.val());
      });
      unlistenRef.current = () => {
        unlisten();
      };
    }
  }, [teamId, teamsRef]);
  useEffect(() => {
    return () => {
      unlistenRef.current?.();
    };
  }, []);
  return team;
};

export const useLeagueTeamsOnValue = (
  leagueMatch: DbLeagueMatch | undefined,
) => {
  const homeTeam = useTeamOnValue(leagueMatch?.homeTeamId);
  const awayTeam = useTeamOnValue(leagueMatch?.awayTeamId);
  return [homeTeam, awayTeam] as const;
};

export function LeagueMatchView() {
  const params = useParams();
  const db = useRTB();
  const playersRef = usePlayersRef();
  const registeredPlayersRef = useRegisteredPlayersRef();
  const [leagueMatch, matchAndKeys] = useLeagueMatchAndMatches(
    params.leagueMatchId,
  );
  const [homeTeam, awayTeam] = useLeagueTeamsOnValue(leagueMatch);
  const [availablePlayers, setAvailablePlayers] = useState<
    AvailablePlayers | undefined
  >(undefined);
  const numAvailablePlayers = useRef<
    { home: number; away: number } | undefined
  >(undefined);
  const awayTeamRegisteredPlayersUnsubscribes = useRef<Unsubscribe[]>([]);
  const [availablePlayersForSelection, setAvailablePlayersForSelection] =
    useState<AvailablePlayersForSelection>({
      awayTeamAvailablePlayers: [],
      homeTeamAvailablePlayers: [],
      selectedAwayTeamPlayers: [undefined, undefined, undefined],
      selectedHomeTeamPlayers: [undefined, undefined, undefined],
    });

  const retrievedAvailablePlayers =
    availablePlayers !== undefined &&
    availablePlayers.home.length === numAvailablePlayers.current!.home &&
    availablePlayers.away.length === numAvailablePlayers.current!.away;

  // populate selected from the matches
  useEffect(() => {
    if (retrievedAvailablePlayers && matchAndKeys !== undefined) {
      console.log("setAvailablePlayersForSelection");
      const getSelectedTeamPlayerIdsFromMatches = (isHome: boolean) => {
        const findPlayersMatchIndices = isHome
          ? findHomePlayersMatchIndices
          : findAwayPlayersMatchIndices;
        return findPlayersMatchIndices.map((matchIndex) => {
          const match = matchAndKeys[matchIndex].match;
          return isHome ? match.team1Player1Id : match.team2Player1Id;
        });
      };

      const getSelectedPlayers = (isHome: boolean) => {
        const teamAvailablePlayers = isHome
          ? availablePlayers.home
          : availablePlayers.away;
        return getSelectedTeamPlayerIdsFromMatches(isHome).map((playerId) => {
          const selectedPlayer = teamAvailablePlayers.find(
            (player) => player.playerId === playerId,
          );
          return selectedPlayer;
        });
      };

      const selectedHomeTeamPlayers = getSelectedPlayers(true);
      const actualSelectedHomeTeamPlayers = selectedHomeTeamPlayers.filter(
        (p) => p !== undefined,
      );
      const selectedAwayTeamPlayers = getSelectedPlayers(false);
      const actualSelectedAwayTeamPlayers = selectedAwayTeamPlayers.filter(
        (p) => p !== undefined,
      );
      const allActualSelectedPlayers = actualSelectedHomeTeamPlayers.concat(
        actualSelectedAwayTeamPlayers,
      );

      const getAvailablePlayers = (isHome: boolean): AvailablePlayer[][] => {
        const teamAvailablePlayers = isHome
          ? availablePlayers.home
          : availablePlayers.away;

        const selectedTeamPlayers = isHome
          ? selectedHomeTeamPlayers
          : selectedAwayTeamPlayers;
        //should not include players that have already been selected.
        const notSelectedTeamAvailablePlayers = teamAvailablePlayers.filter(
          (player) => {
            const playerSelected = allActualSelectedPlayers.some(
              (shtp) => shtp.playerId === player.playerId,
            );
            return !playerSelected;
          },
        );

        return selectedTeamPlayers.map((selectedPlayer) => {
          let availablePlayersForSelection = notSelectedTeamAvailablePlayers;
          if (selectedPlayer !== undefined) {
            availablePlayersForSelection = [
              // Each AvailablePlayer[] should include the selected
              selectedPlayer,
              ...notSelectedTeamAvailablePlayers,
            ];
          }

          return availablePlayersForSelection;
        });
      };

      const availablePlayersForSelection: AvailablePlayersForSelection = {
        homeTeamAvailablePlayers: getAvailablePlayers(true),
        awayTeamAvailablePlayers: getAvailablePlayers(false),
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
      awayTeamRegisteredPlayersUnsubscribes.current.length === 0
    ) {
      const clubRegisteredPlayersQuery = orderByChildQuery(
        registeredPlayersRef,
        "clubId",
        equalTo(awayTeam.clubId),
      );

      const unsubscribeClubRegisteredPlayers = onChildAddedTyped(
        clubRegisteredPlayersQuery,
        (snapshot) => {
          const registeredPlayer = snapshot.val();
          const isApplicablePlayer = isFriendly || false; // todo if(registeredPlayer.rank <= awayTeam.rank)
          if (isApplicablePlayer) {
            console.log(
              "received registered - incrementing numAvailablePlayers",
            );
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
            const unsubscribePlayer = onListItemValueTyped(
              playerId,
              playersRef,
              (snapshot) => {
                console.log("received player");
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
              },
            );
            awayTeamRegisteredPlayersUnsubscribes.current.push(
              unsubscribePlayer,
            );
          }
        },
      );
      awayTeamRegisteredPlayersUnsubscribes.current.push(
        unsubscribeClubRegisteredPlayers,
      );
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

  useEffect(() => {
    const unsubscribes = awayTeamRegisteredPlayersUnsubscribes.current;
    return () => {
      alert("away registered players unsubscribing " + unsubscribes.length);
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  //#endregion
  const getIndividualMatchTitle = (match: DbMatch, index: number) => {
    if (index < matchAndKeys.length - 1) {
      const getPlayerPositionDisplay = (isHome: boolean) => {
        const playerMatchDetails = isHome
          ? homePlayerMatchDetails
          : awayPlayerMatchDetails;
        return playerMatchDetails.find((pmd) =>
          pmd.matchIndices.includes(index),
        ).positionDisplay;
      };
      const getPlayerDisplay = (isHome: boolean) => {
        const matchPlayerId = isHome
          ? match.team1Player1Id
          : match.team2Player1Id;
        if (matchPlayerId !== undefined) {
          const teamAvailablePlayers = isHome
            ? availablePlayers.home
            : availablePlayers.away;
          return teamAvailablePlayers.find(
            (player) => player.playerId === matchPlayerId,
          )!.name;
        }
        return getPlayerPositionDisplay(isHome);
      };

      const homePlayerName: string = getPlayerDisplay(true);
      const awayPlayerName: string = getPlayerDisplay(false);
      return `${homePlayerName} vs ${awayPlayerName}`;
    }
    return "Doubles"; //todo
  };
  if (!retrievedAvailablePlayers) {
    return <div>loading</div>;
  }

  const getPlayerMatches = (
    isHome: boolean,
    position: number,
  ): MatchAndKey[] => {
    const playerMatchDetails = isHome
      ? homePlayerMatchDetails
      : awayPlayerMatchDetails;
    return playerMatchDetails[position].matchIndices.map(
      (index) => matchAndKeys[index],
    );
  };
  const playerSelected = (
    isHome: boolean,
    player: AvailablePlayer | null,
    position: number,
  ) => {
    const updater = createTypedValuesUpdater<Root>();
    getPlayerMatches(isHome, position).forEach((matchAndKey) => {
      const playerId = player?.playerId ?? null;
      const playerUpdate: Partial<DbMatch> = isHome
        ? { team1Player1Id: playerId }
        : { team2Player1Id: playerId };
      updater.updateListItem("matches", matchAndKey.key, playerUpdate);
    });
    update(ref(db), updater.values);
  };

  // do I put the scoreboard and the umpiring here
  //MATCHSCORE
  return (
    <>
      <div>{leagueMatch!.description}</div>
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
        homeTeam={{
          teamName: homeTeam.name,
          labels: homeTeamLabels,
          availablePlayers:
            availablePlayersForSelection.homeTeamAvailablePlayers,
          selectedPlayers: availablePlayersForSelection.selectedHomeTeamPlayers,
          playerSelected: (player, position) =>
            playerSelected(true, player, position),
        }}
        awayTeam={{
          teamName: awayTeam.name,
          labels: awayTeamLabels,
          availablePlayers:
            availablePlayersForSelection.awayTeamAvailablePlayers,
          selectedPlayers: availablePlayersForSelection.selectedAwayTeamPlayers,
          playerSelected: (player, position) =>
            playerSelected(false, player, position),
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
