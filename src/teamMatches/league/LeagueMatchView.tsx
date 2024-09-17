import { ref, update } from "firebase/database";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  DbMatch,
  getTeamDoublesPlayerKeys,
} from "../../firebase/rtb/match/dbMatch";
import {
  awayPlayerMatchDetails,
  homePlayerMatchDetails,
} from "./singlesLeagueMatchPlayers";
import { Root } from "../../firebase/rtb/root";
import { createTypedValuesUpdater } from "../../firebase/rtb/typeHelpers";
import { TeamsMatchPlayersSelect } from "../teamMatchPlayerSelect";
import { useRTB } from "../../firebase/rtb/rtbProvider";
import { AvailableDoubles, DoublesSelect } from "./DoublesSelect";
import { useLeagueMatchAndMatches } from "./useLeagueMatchAndMatches";
import { useLeagueTeamsOnValue } from "./useLeagueTeamsOnValue";
import { useAvailablePlayers } from "./useAvailablePlayers";
import { isNotNull } from "../../helpers/isNotTypeGuards";

export interface MatchAndKey {
  match: DbMatch;
  key: string;
}

export interface AvailablePlayer {
  name: string;
  playerId: string;
  registeredPlayerId: string;
  rank: number;
}

export interface AvailablePlayers {
  home: AvailablePlayer[];
  away: AvailablePlayer[];
}
type AvailablePlayerOrNull = AvailablePlayer | null;

interface AvailablePlayersForSelection {
  selectedHomeTeamPlayers: AvailablePlayerOrNull[];
  selectedAwayTeamPlayers: AvailablePlayerOrNull[];
  homeTeamAvailablePlayers: AvailablePlayer[][];
  awayTeamAvailablePlayers: AvailablePlayer[][];
  homeAvailableDoubles: AvailableDoubles[];
  selectedHomeDoubles: AvailableDoubles | null;
  awayAvailableDoubles: AvailableDoubles[];
  selectedAwayDoubles: AvailableDoubles | null;
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

export function LeagueMatchView() {
  const params = useParams();
  const db = useRTB();
  const [leagueMatch, matchAndKeys] = useLeagueMatchAndMatches(
    params.leagueMatchId!,
  );
  const [homeTeam, awayTeam] = useLeagueTeamsOnValue(leagueMatch);
  const [availablePlayersForSelection, setAvailablePlayersForSelection] =
    useState<AvailablePlayersForSelection>({
      awayTeamAvailablePlayers: [],
      homeTeamAvailablePlayers: [],
      selectedAwayTeamPlayers: [null, null, null],
      selectedHomeTeamPlayers: [null, null, null],
      homeAvailableDoubles: [],
      awayAvailableDoubles: [],
      selectedHomeDoubles: null,
      selectedAwayDoubles: null,
    });
  const [awayTeamAvailablePlayers, retrievedAvailableAwayPlayers] =
    useAvailablePlayers(awayTeam, leagueMatch?.isFriendly);

  const sameClubAndFriendly: boolean | undefined =
    leagueMatch?.isFriendly === undefined
      ? undefined
      : leagueMatch?.isFriendly === false
        ? false
        : homeTeam === undefined || awayTeam == undefined
          ? undefined
          : homeTeam.clubId === awayTeam.clubId;
  const [homeTeamAvailablePlayers, retrievedAvailableHomePlayers] =
    useAvailablePlayers(homeTeam, leagueMatch?.isFriendly, () => {
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

  // populate selected from the matches
  useEffect(() => {
    if (retrievedAvailablePlayers && matchAndKeys !== undefined) {
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
          ? actualHomeTeamAvailablePlayers
          : awayTeamAvailablePlayers;
        return getSelectedTeamPlayerIdsFromMatches(isHome).map((playerId) => {
          const selectedPlayer = teamAvailablePlayers.find(
            (player) => player.playerId === playerId,
          );
          return selectedPlayer ?? null;
        });
      };

      const selectedHomeTeamPlayers = getSelectedPlayers(true);
      const actualSelectedHomeTeamPlayers =
        selectedHomeTeamPlayers.filter(isNotNull);
      const selectedAwayTeamPlayers = getSelectedPlayers(false);
      const actualSelectedAwayTeamPlayers =
        selectedAwayTeamPlayers.filter(isNotNull);
      const allActualSelectedPlayers = actualSelectedHomeTeamPlayers.concat(
        actualSelectedAwayTeamPlayers,
      );

      const getAvailablePlayers = (isHome: boolean): AvailablePlayer[][] => {
        const teamAvailablePlayers = isHome
          ? actualHomeTeamAvailablePlayers
          : awayTeamAvailablePlayers;

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
          if (selectedPlayer !== null) {
            availablePlayersForSelection = [
              // Each AvailablePlayer[] should include the selected
              selectedPlayer,
              ...notSelectedTeamAvailablePlayers,
            ];
          }

          return availablePlayersForSelection.sort((first, second) => {
            if (first.rank !== second.rank) {
              return second.rank - first.rank;
            }
            return first.name.localeCompare(second.name);
          });
        });
      };

      const getDoubles = (
        player1Id: string | undefined,
        player2Id: string | undefined,
        actualSelectedPlayers: AvailablePlayer[],
      ): {
        available: AvailableDoubles[];
        selected: AvailableDoubles | null;
      } => {
        if (actualSelectedPlayers.length < 2) {
          return {
            available: [],
            selected: null,
          };
        }
        if (actualSelectedPlayers.length === 2) {
          const available: AvailableDoubles[] = [
            {
              player1Id: actualSelectedPlayers[0].playerId,
              player1Name: actualSelectedPlayers[0].name,
              player2Id: actualSelectedPlayers[1].playerId,
              player2Name: actualSelectedPlayers[1].name,
            },
          ];
          const selected = player1Id === undefined ? null : available[0];
          return {
            available,
            selected,
          };
        }
        // could create a permute
        const pairs: [number, number][] = [
          [0, 1],
          [0, 2],
          [1, 2],
        ];
        const available = pairs.map(([p1Index, p2Index]) => {
          const availableDoubles: AvailableDoubles = {
            player1Id: actualSelectedPlayers[p1Index].playerId,
            player1Name: actualSelectedPlayers[p1Index].name,
            player2Id: actualSelectedPlayers[p2Index].playerId,
            player2Name: actualSelectedPlayers[p2Index].name,
          };
          return availableDoubles;
        });

        return {
          available,
          selected:
            player1Id === undefined
              ? null
              : available.find((pair) => {
                  //should be able to reduce this to just the one condition
                  return (
                    (pair.player1Id === player1Id &&
                      pair.player2Id === player2Id) ||
                    (pair.player1Id === player2Id &&
                      pair.player2Id === player1Id)
                  );
                }) ?? null,
        };
      };
      const doublesMatchAndKey = matchAndKeys[matchAndKeys.length - 1];
      const doublesMatch = doublesMatchAndKey.match;

      const homeDoubles = getDoubles(
        doublesMatch.team1Player1Id,
        doublesMatch.team1Player2Id,
        actualSelectedHomeTeamPlayers,
      );
      const awayDoubles = getDoubles(
        doublesMatch.team2Player1Id,
        doublesMatch.team2Player2Id,
        actualSelectedAwayTeamPlayers,
      );

      const availablePlayersForSelection: AvailablePlayersForSelection = {
        homeTeamAvailablePlayers: getAvailablePlayers(true),
        awayTeamAvailablePlayers: getAvailablePlayers(false),
        selectedHomeTeamPlayers,
        selectedAwayTeamPlayers,
        homeAvailableDoubles: homeDoubles.available,
        selectedHomeDoubles: homeDoubles.selected,
        awayAvailableDoubles: awayDoubles.available,
        selectedAwayDoubles: awayDoubles.selected,
      };
      setAvailablePlayersForSelection(availablePlayersForSelection);
    }
  }, [
    actualHomeTeamAvailablePlayers,
    awayTeamAvailablePlayers,
    retrievedAvailablePlayers,
    matchAndKeys,
    sameClubAndFriendly,
  ]);

  const getIndividualMatchTitle = (match: DbMatch, index: number) => {
    if (index < matchAndKeys.length - 1) {
      const getPlayerPositionDisplay = (isHome: boolean) => {
        const playerMatchDetails = isHome
          ? homePlayerMatchDetails
          : awayPlayerMatchDetails;
        return playerMatchDetails.find((pmd) =>
          pmd.matchIndices.includes(index),
        )!.positionDisplay;
      };
      const getPlayerDisplay = (isHome: boolean) => {
        const matchPlayerId = isHome
          ? match.team1Player1Id
          : match.team2Player1Id;
        if (matchPlayerId !== undefined) {
          const teamAvailablePlayers = isHome
            ? actualHomeTeamAvailablePlayers
            : awayTeamAvailablePlayers;

          return teamAvailablePlayers.find(
            (player) => player?.playerId === matchPlayerId,
          )!.name;
        }
        return getPlayerPositionDisplay(isHome);
      };

      const homePlayerName: string = getPlayerDisplay(true);
      const awayPlayerName: string = getPlayerDisplay(false);
      return `${homePlayerName} vs ${awayPlayerName}`;
    }
    const doublesMatch = matchAndKeys[matchAndKeys.length - 1].match;
    const getDoublesTeamDisplay = (
      player1Id: string | undefined,
      player2Id: string | undefined,
      isHome: boolean,
    ) => {
      if (player1Id === undefined) {
        return "TBD";
      }
      const teamSelectedPlayers = isHome
        ? actualHomeTeamAvailablePlayers
        : awayTeamAvailablePlayers;
      const firstPlayer = teamSelectedPlayers.find(
        (player) => player?.playerId === player1Id,
      )!;
      const secondPlayer = teamSelectedPlayers.find(
        (player) => player?.playerId === player2Id,
      )!;
      return `${firstPlayer.name} - ${secondPlayer.name}`;
    };
    const homeTeamDisplay = getDoublesTeamDisplay(
      doublesMatch.team1Player1Id,
      doublesMatch.team1Player2Id,
      true,
    );
    const awayTeamDisplay = getDoublesTeamDisplay(
      doublesMatch.team2Player1Id,
      doublesMatch.team2Player2Id,
      false,
    );
    return `${homeTeamDisplay} vs ${awayTeamDisplay}`;
  };

  if (!retrievedAvailablePlayers) {
    return <div>loading</div>;
  }

  const getPlayerSinglesMatches = (
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

  const updateMatchesWhenPlayerSelected = (
    isHome: boolean,
    player: AvailablePlayer | null,
    position: number,
  ) => {
    const updater = createTypedValuesUpdater<Root>();
    const updatePlayerSinglesMatches = () => {
      getPlayerSinglesMatches(isHome, position).forEach((matchAndKey) => {
        const playerId = player?.playerId ?? null;
        updater.updateListItem(
          "matches",
          matchAndKey.key,
          isHome ? { team1Player1Id: playerId } : { team2Player1Id: playerId },
        );
      });
    };
    const getSelectedPlayerId = () => {
      const selectedPlayers = isHome
        ? availablePlayersForSelection.selectedHomeTeamPlayers
        : availablePlayersForSelection.selectedAwayTeamPlayers;
      return selectedPlayers[position]!.playerId;
    };
    const removePlayerDoublesTeam = () => {
      const doublesMatchAndKey = matchAndKeys[matchAndKeys.length - 1];
      const doublesMatch = doublesMatchAndKey.match;
      const playersKeys = getTeamDoublesPlayerKeys(isHome);
      const previouslySelectedPlayerId = getSelectedPlayerId();
      if (
        doublesMatch[playersKeys.player1] === previouslySelectedPlayerId ||
        doublesMatch[playersKeys.player2] === previouslySelectedPlayerId
      ) {
        updater.updateListItem("matches", doublesMatchAndKey.key, {
          [playersKeys.player1]: null,
          [playersKeys.player2]: null,
        });
      }
    };

    updatePlayerSinglesMatches();

    if (!player) {
      removePlayerDoublesTeam();
    }
    update(ref(db), updater.values);
  };

  const playerSelected = (
    isHome: boolean,
    player: AvailablePlayer | null,
    position: number,
  ) => {
    updateMatchesWhenPlayerSelected(isHome, player, position);
  };

  const doublesSelected = (
    isHome: boolean,
    availableDoubles: AvailableDoubles | null,
  ) => {
    const doublesMatchKey = matchAndKeys[matchAndKeys.length - 1].key;
    const updater = createTypedValuesUpdater<Root>();
    const player1Id = availableDoubles ? availableDoubles.player1Id : null;
    const player2Id = availableDoubles ? availableDoubles.player2Id : null;
    const playersKeys = getTeamDoublesPlayerKeys(isHome);
    updater.updateListItem("matches", doublesMatchKey, {
      [playersKeys.player1]: player1Id,
      [playersKeys.player2]: player2Id,
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
          teamName: homeTeam!.name,
          labels: homeTeamLabels,
          availablePlayers:
            availablePlayersForSelection.homeTeamAvailablePlayers,
          selectedPlayers: availablePlayersForSelection.selectedHomeTeamPlayers,
          playerSelected: (player, position) =>
            playerSelected(true, player, position),
        }}
        awayTeam={{
          teamName: awayTeam!.name,
          labels: awayTeamLabels,
          availablePlayers:
            availablePlayersForSelection.awayTeamAvailablePlayers,
          selectedPlayers: availablePlayersForSelection.selectedAwayTeamPlayers,
          playerSelected: (player, position) =>
            playerSelected(false, player, position),
        }}
      />
      <DoublesSelect
        autoCompleteProps={{
          autoComplete: true,
          autoHighlight: true,
          clearOnEscape: true,
        }}
        home={{
          availableDoubles: availablePlayersForSelection.homeAvailableDoubles,
          selectedDoubles: availablePlayersForSelection.selectedHomeDoubles,
          onChange(availableDoubles) {
            doublesSelected(true, availableDoubles);
          },
        }}
        away={{
          availableDoubles: availablePlayersForSelection.awayAvailableDoubles,
          selectedDoubles: availablePlayersForSelection.selectedAwayDoubles,
          onChange(availableDoubles) {
            doublesSelected(false, availableDoubles);
          },
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
