import { ref, update } from "firebase/database";
import { useState } from "react";
import { getTeamDoublesPlayerKeys } from "../../../../firebase/rtb/match/helpers/getTeamDoublesPlayerKeys";
import {
  awayPlayersMatchIndicesAndDisplay,
  homePlayersMatchIndicesAndDisplay,
  leagueMatchNumberOfSingles,
  leagueMatchPlayersPositionDisplays,
} from "../format/singlesLeagueMatchPlayers";
import { useRTB } from "../../../../firebase/rtb/rtbProvider";
import { AvailableDoubles } from "../player-selection/DoublesSelect";
import {
  MatchAndKey,
  useLeagueMatchAndMatches,
} from "../../db-hooks/useLeagueMatchAndMatches";
import { useLeagueTeamsOnValue } from "../../db-hooks/useLeagueTeamsOnValue";
import {
  AvailablePlayer,
  useAvailablePlayers,
} from "../../db-hooks/useAvailablePlayers";
import { dbMatchSaveStateToSaveState } from "../../../../firebase/rtb/match/conversion";
import { Umpire } from "../../../../umpire";
import { LeagueMatchScoreboard } from "../LeagueMatchScoreboard";
import { getDoublesMatch, isSingles } from "../../helpers";
import {
  KeyedDoublesMatchNamesPositionDisplay,
  KeyedSinglesMatchNamePositionDisplay,
  RenderScoresheet,
  SelectedOrNotSinglePlayerNamePositionDisplay,
} from "./renderScoresheet-type";
import { TeamsSelectPlayersAndDoubles } from "../player-selection/TeamsSelectPlayersAndDoubles";
import { Button, CircularProgress } from "@mui/material";
import { createRootUpdater } from "../../../../firebase/rtb/match/db-helpers";
import { useWakeLock } from "../../../../hooks/useWakeLock";
import {
  homeTeamSelectLabels,
  awayTeamSelectLabels,
} from "./team-select-labels";
import { getAvailablePlayersForSelection } from "./getAvailablePlayersForSelection";

export interface LeagueMatchSelectionProps {
  renderScoresheet: RenderScoresheet;
  leagueMatchId: string;
}

export const scoresheetAriaLabel = "Scoresheet";

export function LeagueMatchSelection({
  leagueMatchId,
  renderScoresheet,
}: LeagueMatchSelectionProps) {
  const db = useRTB();
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [leagueMatch, matchAndKeys] = useLeagueMatchAndMatches(leagueMatchId!);
  const [homeTeam, awayTeam] = useLeagueTeamsOnValue(leagueMatch);
  useWakeLock();

  const {
    retrievedAvailablePlayers,
    homeTeamAvailablePlayers,
    awayTeamAvailablePlayers,
  } = useAvailablePlayers(homeTeam, awayTeam, leagueMatch?.isFriendly);

  if (
    !(
      retrievedAvailablePlayers &&
      matchAndKeys.length === leagueMatchNumberOfSingles + 1
    )
  ) {
    return <CircularProgress />;
  }

  const availablePlayersForSelection = getAvailablePlayersForSelection(
    matchAndKeys,
    homeTeamAvailablePlayers,
    awayTeamAvailablePlayers,
  );

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
        ? homePlayersMatchIndicesAndDisplay
        : awayPlayersMatchIndicesAndDisplay;
      return playerMatchDetails[position].matchIndices.map(
        (index) => matchAndKeys[index],
      );
    };
    const updater = createRootUpdater();
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
    const updater = createRootUpdater();
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
        const matchPositionDisplays = leagueMatchPlayersPositionDisplays[i];
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
              .player1PositionDisplay,
        };

        doublesMatchWithNamesAndKey.homePlayer2 = {
          name: availablePlayersForSelection.selectedHomeDoubles.player2Name,
          positionDisplay:
            availablePlayersForSelection.selectedHomeDoubles
              .player2PositionDisplay,
        };
      }
      if (availablePlayersForSelection.selectedAwayDoubles !== null) {
        doublesMatchWithNamesAndKey.awayPlayer1 = {
          name: availablePlayersForSelection.selectedAwayDoubles.player1Name,
          positionDisplay:
            availablePlayersForSelection.selectedAwayDoubles
              .player1PositionDisplay,
        };
        doublesMatchWithNamesAndKey.awayPlayer2 = {
          name: availablePlayersForSelection.selectedAwayDoubles.player2Name,
          positionDisplay:
            availablePlayersForSelection.selectedAwayDoubles
              .player2PositionDisplay,
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

  const getTeamNameDisplay = (isHome: boolean) => {
    const teamName = isHome ? homeTeam!.name : awayTeam!.name;
    // would use mui media queries - which can mock
    // todo
    return teamName;
  };
  return (
    <>
      <div style={{ margin: 10 }}>
        <TeamsSelectPlayersAndDoubles<AvailablePlayer>
          autoCompleteProps={{
            autoComplete: true, // !!! does not appear to be working
            /*
                If true, the portion of the selected suggestion that the user hasn't typed, known as the completion string,
                appears inline after the input cursor in the textbox.
                The inline completion string is visually highlighted and has a selected state.
            */
            autoHighlight: true,
            clearOnEscape: true, //	If true, the first option is automatically highlighted.
          }}
          home={{
            teamName: getTeamNameDisplay(true),
            singles: {
              labels: homeTeamSelectLabels,
              availablePlayers:
                availablePlayersForSelection.homeTeamAvailablePlayers,
              selectedPlayers:
                availablePlayersForSelection.selectedHomeTeamPlayers,
              playerSelected: (player, position) =>
                playerSelected(true, player, position),
            },
            doubles: {
              availableDoubles:
                availablePlayersForSelection.homeAvailableDoubles,
              selectedDoubles: availablePlayersForSelection.selectedHomeDoubles,
              onChange(availableDoubles) {
                doublesSelected(true, availableDoubles);
              },
            },
            isHome: true,
          }}
          away={{
            teamName: getTeamNameDisplay(false),
            singles: {
              labels: awayTeamSelectLabels,
              availablePlayers:
                availablePlayersForSelection.awayTeamAvailablePlayers,
              selectedPlayers:
                availablePlayersForSelection.selectedAwayTeamPlayers,
              playerSelected: (player, position) =>
                playerSelected(false, player, position),
            },
            doubles: {
              availableDoubles:
                availablePlayersForSelection.awayAvailableDoubles,
              selectedDoubles: availablePlayersForSelection.selectedAwayDoubles,
              onChange(availableDoubles) {
                doublesSelected(false, availableDoubles);
              },
            },
            isHome: false,
          }}
        />

        <Button onClick={() => setShowScoreboard(true)}>Scoreboard</Button>
        <section aria-label={scoresheetAriaLabel}>
          {renderScoresheet(
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
