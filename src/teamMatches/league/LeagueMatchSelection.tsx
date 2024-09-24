import { ref, update } from "firebase/database";
import { useState } from "react";
import { getTeamDoublesPlayerKeys } from "../../firebase/rtb/match/dbMatch";
import {
  awayPlayerMatchDetails,
  homePlayerMatchDetails,
  singlesLeagueMatchPositionDisplays,
} from "./singlesLeagueMatchPlayers";
import { Root } from "../../firebase/rtb/root";
import { createTypedValuesUpdater } from "../../firebase/rtb/typeHelpers";
import { TeamsMatchPlayersSelect } from "../teamMatchPlayerSelect";
import { useRTB } from "../../firebase/rtb/rtbProvider";
import { AvailableDoubles, DoublesSelect } from "./DoublesSelect";
import {
  MatchAndKey,
  useLeagueMatchAndMatches,
} from "./useLeagueMatchAndMatches";
import { useLeagueTeamsOnValue } from "./useLeagueTeamsOnValue";
import { AvailablePlayer, useAvailablePlayers } from "./useAvailablePlayers";
import { isNotNull } from "../../helpers/isNotTypeGuards";
import { dbMatchSaveStateToSaveState } from "../../firebase/rtb/match/conversion";
import { Umpire } from "../../umpire";
import { LeagueMatchScoreboard } from "./LeagueMatchScoreboard";
import { AvailablePlayersForSelection } from "./AvailablePlayersForSelection";
import { getDoublesMatch, isSingles } from "./helpers";
import { PlayerMatchDetails } from "./getMatchPlayerPositions";
import {
  KeyedDoublesMatchNamesPositionDisplay,
  KeyedSinglesMatchNamePositionDisplay,
  RenderScoreboard,
  SelectedOrNotSinglePlayerNamePositionDisplay,
} from "./renderScoreboard";

export interface LeagueMatchSelectionProps {
  renderScoreboard: RenderScoreboard;
  leagueMatchId: string;
}

export const scoresheetAriaLabel = "Scoresheet";

const getTeamSelectLabels = (playerMatchDetails: PlayerMatchDetails[]) => {
  return playerMatchDetails.map(
    (playerDetails) =>
      `${playerDetails.positionDisplay} - ${playerDetails.matchIndices.map((i) => i + 1).join(", ")}`,
  );
};
export const homeTeamSelectLabels = getTeamSelectLabels(homePlayerMatchDetails);
export const awayTeamSelectLabels = getTeamSelectLabels(awayPlayerMatchDetails);
export const homeTeamPositionIdentifiers = homePlayerMatchDetails.map(
  (pd) => pd.positionDisplay,
);
export const awayTeamPositionIdentifiers = awayPlayerMatchDetails.map(
  (pd) => pd.positionDisplay,
);

const getFindPlayersMatchIndices = (playerMatchDetails: PlayerMatchDetails[]) =>
  playerMatchDetails.map(
    (playerMatchDetail) => playerMatchDetail.matchIndices[0],
  );
export const findHomePlayersMatchIndices = getFindPlayersMatchIndices(
  homePlayerMatchDetails,
);
export const findAwayPlayersMatchIndices = getFindPlayersMatchIndices(
  awayPlayerMatchDetails,
);

export const numMatches =
  homePlayerMatchDetails.flatMap((pmd) => pmd.matchIndices).length + 1;

export function LeagueMatchSelection({
  leagueMatchId,
  renderScoreboard,
}: LeagueMatchSelectionProps) {
  const db = useRTB();
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [leagueMatch, matchAndKeys] = useLeagueMatchAndMatches(leagueMatchId!);
  const [homeTeam, awayTeam] = useLeagueTeamsOnValue(leagueMatch);

  const {
    retrievedAvailablePlayers,
    homeTeamAvailablePlayers,
    awayTeamAvailablePlayers,
  } = useAvailablePlayers(homeTeam, awayTeam, leagueMatch?.isFriendly);

  if (!(retrievedAvailablePlayers && matchAndKeys.length === numMatches)) {
    return <div>loading</div>;
  }

  const getAvailablePlayersForSelection = (): AvailablePlayersForSelection => {
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
        ? homeTeamAvailablePlayers
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
        ? homeTeamAvailablePlayers
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
            return first.rank - second.rank;
          }
          return first.name.localeCompare(second.name);
        });
      });
    };

    const getDoubles = (
      player1Id: string | undefined,
      player2Id: string | undefined,
      actualSelectedPlayers: AvailablePlayer[],
      isHome: boolean,
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
      const positionIdentifiers = isHome
        ? homeTeamPositionIdentifiers
        : awayTeamPositionIdentifiers;
      if (actualSelectedPlayers.length === 2) {
        const available: AvailableDoubles[] = [
          {
            player1Id: actualSelectedPlayers[0].playerId,
            player1Name: actualSelectedPlayers[0].name,
            player1PositionIdentifier: positionIdentifiers[0],
            player2Id: actualSelectedPlayers[1].playerId,
            player2Name: actualSelectedPlayers[1].name,
            player2PositionIdentifier: positionIdentifiers[1],
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
          player1PositionIdentifier: positionIdentifiers[p1Index],
          player2Id: actualSelectedPlayers[p2Index].playerId,
          player2Name: actualSelectedPlayers[p2Index].name,
          player2PositionIdentifier: positionIdentifiers[p2Index],
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
                  (pair.player1Id === player2Id && pair.player2Id === player1Id)
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
      true,
    );
    const awayDoubles = getDoubles(
      doublesMatch.team2Player1Id,
      doublesMatch.team2Player2Id,
      actualSelectedAwayTeamPlayers,
      false,
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
    return availablePlayersForSelection;
  };
  const availablePlayersForSelection = getAvailablePlayersForSelection();

  const updateMatchesWhenPlayerSelected = (
    isHome: boolean,
    player: AvailablePlayer | null,
    position: number,
  ) => {
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

  if (showScoreboard) {
    return (
      <LeagueMatchScoreboard matches={matchAndKeys.map((mk) => mk.match)} />
    );
  }
  const getMatchNamePositionDisplays = () => {
    const getKeyedSinglesMatchNamePositionDisplays = () => {
      const singlesMatches = matchAndKeys.filter((_, i) =>
        isSingles(i, matchAndKeys),
      );

      return singlesMatches.map((matchAndKey, i) => {
        const match = matchAndKey.match;
        // always need the info on homePlayer1 and awayPlayer1
        const matchPositionDisplays = singlesLeagueMatchPositionDisplays[i];
        const getNameOrPositionIdentifier = (
          isHome: boolean,
        ): SelectedOrNotSinglePlayerNamePositionDisplay => {
          const playerId = isHome ? match.team1Player1Id : match.team2Player1Id;
          const positionDisplay = isHome
            ? matchPositionDisplays.homePositionDisplay
            : matchPositionDisplays.awayPositionDisplay;
          const selectedTeamPlayers = isHome
            ? availablePlayersForSelection.selectedHomeTeamPlayers
            : availablePlayersForSelection.selectedAwayTeamPlayers;
          const nameOrPositionIdentifier: SelectedOrNotSinglePlayerNamePositionDisplay =
            {
              positionDisplay: positionDisplay.display,
            };
          if (playerId !== undefined) {
            nameOrPositionIdentifier.name =
              selectedTeamPlayers[positionDisplay.position]!.name;
          }
          return nameOrPositionIdentifier;
        };

        const matchWithNamesAndKey: KeyedSinglesMatchNamePositionDisplay = {
          ...matchAndKey,
          homePlayer1: getNameOrPositionIdentifier(true),
          awayPlayer1: getNameOrPositionIdentifier(false),
        };
        return matchWithNamesAndKey;
      });
    };

    const getKeyedDoublesMatchNamesPositionDisplay = () => {
      const doublesMatch = getDoublesMatch(matchAndKeys);
      const doublesMatchWithNamesAndKey: KeyedDoublesMatchNamesPositionDisplay =
        {
          match: doublesMatch,
          key: matchAndKeys[matchAndKeys.length - 1].key,
        };
      if (availablePlayersForSelection.selectedHomeDoubles !== null) {
        doublesMatchWithNamesAndKey.homePlayer1 = {
          name: availablePlayersForSelection.selectedHomeDoubles.player1Name,
          positionDisplay:
            availablePlayersForSelection.selectedHomeDoubles
              .player1PositionIdentifier,
        };

        doublesMatchWithNamesAndKey.homePlayer2 = {
          name: availablePlayersForSelection.selectedHomeDoubles.player2Name,
          positionDisplay:
            availablePlayersForSelection.selectedHomeDoubles
              .player2PositionIdentifier,
        };
      }
      if (availablePlayersForSelection.selectedAwayDoubles !== null) {
        doublesMatchWithNamesAndKey.awayPlayer1 = {
          name: availablePlayersForSelection.selectedAwayDoubles.player1Name,
          positionDisplay:
            availablePlayersForSelection.selectedAwayDoubles
              .player1PositionIdentifier,
        };
        doublesMatchWithNamesAndKey.awayPlayer2 = {
          name: availablePlayersForSelection.selectedAwayDoubles.player2Name,
          positionDisplay:
            availablePlayersForSelection.selectedAwayDoubles
              .player2PositionIdentifier,
        };
      }
      return doublesMatchWithNamesAndKey;
    };
    return {
      keyedSinglesMatchNamePositionDisplays:
        getKeyedSinglesMatchNamePositionDisplays(),
      keyedDoublesMatchNamesPositionDisplay:
        getKeyedDoublesMatchNamesPositionDisplay(),
    };
  };

  const {
    keyedSinglesMatchNamePositionDisplays,
    keyedDoublesMatchNamesPositionDisplay,
  } = getMatchNamePositionDisplays();

  return (
    <>
      <div style={{ margin: 10 }}>
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
            labels: homeTeamSelectLabels,
            availablePlayers:
              availablePlayersForSelection.homeTeamAvailablePlayers,
            selectedPlayers:
              availablePlayersForSelection.selectedHomeTeamPlayers,
            playerSelected: (player, position) =>
              playerSelected(true, player, position),
          }}
          awayTeam={{
            teamName: awayTeam!.name,
            labels: awayTeamSelectLabels,
            availablePlayers:
              availablePlayersForSelection.awayTeamAvailablePlayers,
            selectedPlayers:
              availablePlayersForSelection.selectedAwayTeamPlayers,
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
        <br />
        <button onClick={() => setShowScoreboard(true)}>Scoreboard</button>
        <section aria-label={scoresheetAriaLabel}>
          {renderScoreboard(
            matchAndKeys.map((matchAndKey) => {
              const umpire = new Umpire(
                dbMatchSaveStateToSaveState(matchAndKey.match),
              );
              const matchState = umpire.getMatchState();
              return {
                ...matchAndKey,
                umpire,
                matchState,
              };
            }),
            db,
            keyedSinglesMatchNamePositionDisplays,
            keyedDoublesMatchNamesPositionDisplay,
          )}
        </section>
      </div>
    </>
  );
}
