import { Database, ref, update } from "firebase/database";
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
import { LeagueMatchScoreboard } from "../LeagueMatchScoreboard";
import { getDoublesMatch } from "../../helpers";
import {
  KeyedDoublesMatchNamesPositionDisplay,
  KeyedSinglesMatchNamePositionDisplay,
  RenderScoresheet,
  SelectedOrNotSinglePlayerNamePositionDisplay,
} from "./renderScoresheet-type";
import { TeamsSelectPlayersAndDoubles } from "../player-selection/TeamsSelectPlayersAndDoubles";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import {
  createRootUpdater,
  updateConcededOrForfeited,
} from "../../../../firebase/rtb/match/db-helpers";
import { useWakeLock } from "../../../../hooks/useWakeLock";
import {
  homeTeamSelectLabels,
  awayTeamSelectLabels,
} from "./team-select-labels";
import { getAvailablePlayersForSelection } from "./getAvailablePlayersForSelection";
import CenteredCircularProgress from "../../../../helper-components/CenteredCircularProgress";
import { addUmpireToMatchAndKeys } from "./addUmpireToMatchAndKeys";
import { DbMatch } from "../../../../firebase/rtb/match/dbMatch";
import PersonOffIcon from "@mui/icons-material/PersonOff";
const ForfeitIcon = PersonOffIcon;

export interface LeagueMatchSelectionProps {
  renderScoresheet: RenderScoresheet;
  leagueMatchId: string;
}

export const scoresheetSectionAriaLabel = "Scoresheet";

function getForfeitButtons(
  gameForfeitModels: GameForfeitModel[],
  isHome: boolean,
) {
  const buttons = gameForfeitModels.map((gameForfeitModel) => {
    return (
      <Button
        key={`${isHome ? "H" : "A"}${gameForfeitModel.identifier}`}
        onClick={gameForfeitModel.act}
      >
        {`${gameForfeitModel.identifier} ${gameForfeitModel.forfeitActionType === ForfeitActionType.forfeit ? "Forfeit" : "Undo"}`}
      </Button>
    );
  });
  if (buttons.length === 0) {
    return null;
  }
  return <div>{buttons}</div>;
}

export function LeagueMatchSelection({
  leagueMatchId,
  renderScoresheet,
}: LeagueMatchSelectionProps) {
  const db = useRTB();
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [leagueMatch, matchAndKeys] = useLeagueMatchAndMatches(leagueMatchId!);
  const [homeTeam, awayTeam] = useLeagueTeamsOnValue(leagueMatch);
  const { showForfeitDialogDisabled, getForfeitDialog, openForfeitDialog } =
    useForfeit(
      matchAndKeys,
      (forfeitModel) => {
        return (
          <>
            <DialogTitle>Forfeit</DialogTitle>
            <DialogContent>
              {getForfeitButtons(forfeitModel.home, true)}
              {getForfeitButtons(forfeitModel.away, false)}
            </DialogContent>
          </>
        );
      },
      db,
    );
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
    return <CenteredCircularProgress />;
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
      const singlesMatches = matchAndKeys.filter(
        (matchAndKey) => !matchAndKey.match.isDoubles,
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
        {getForfeitDialog()}
        <IconButton
          onClick={openForfeitDialog}
          disabled={showForfeitDialogDisabled}
        >
          <ForfeitIcon />
        </IconButton>
        <section aria-label={scoresheetSectionAriaLabel}>
          {renderScoresheet(
            addUmpireToMatchAndKeys(matchAndKeys),
            db,
            keyedSinglesMatchNamePositionDisplays,
            keyedDoublesMatchNamesPositionDisplay,
          )}
        </section>
      </div>
    </>
  );
}

enum ForfeitActionType {
  forfeit,
  undoForfeit,
}
interface GameForfeitModel {
  identifier: string; // which will be doubles or player positions
  forfeitActionType: ForfeitActionType;
  act: () => void;
}
interface ForfeitModel {
  home: GameForfeitModel[];
  away: GameForfeitModel[];
}
function useForfeit(
  matchAndKeys: MatchAndKey[],

  getDialogContents: (forfeitModel: ForfeitModel) => React.ReactNode,
  db: Database,
) {
  const [showForfeitDialog, setShowForfeitDialog] = useState(false);
  const ready = matchAndKeys.length === 10;
  const getDisabled = () => {
    // should be disabled if all players are selected

    let allPlayersSelected = true;
    for (let i = 0; i < 3; i++) {
      const match = matchAndKeys[i].match;
      allPlayersSelected =
        match.team1Player1Id !== undefined &&
        match.team2Player1Id !== undefined;
      if (!allPlayersSelected) {
        break;
      }
    }
    if (allPlayersSelected) {
      const doublesMatch = matchAndKeys[9].match;
      allPlayersSelected =
        doublesMatch.team1Player1Id !== undefined &&
        doublesMatch.team1Player2Id !== undefined &&
        doublesMatch.team2Player1Id !== undefined &&
        doublesMatch.team2Player2Id !== undefined;
    }

    return allPlayersSelected;
  };
  const getFofeitModel = () => {
    const forfeitModel: ForfeitModel = {
      home: [],
      away: [],
    };
    const addIfPlayerUndefined = (
      match: DbMatch,
      isHome: boolean,
      matchIndex: number,
      getIdentifier: (isHome: boolean, matchIndex: number) => string,
    ) => {
      const playerKey = isHome ? "team1Player1Id" : "team2Player1Id"; //todo type these keys
      if (match[playerKey] === undefined) {
        const teamConcedeOrDefault = isHome
          ? match.team1ConcedeOrForfeit
          : match.team2ConcedeOrForfeit;
        const forfeitActionType =
          teamConcedeOrDefault !== undefined
            ? ForfeitActionType.undoForfeit
            : ForfeitActionType.forfeit;
        forfeitModel[isHome ? "home" : "away"].push({
          identifier: getIdentifier(isHome, matchIndex),
          forfeitActionType,
          act: () => {
            // todo - error handling
            updateConcededOrForfeited(
              forfeitActionType === ForfeitActionType.forfeit,
              true,
              isHome,
              matchAndKeys[matchIndex].key,
              db,
            );
            setShowForfeitDialog(false);
          },
        });
      }
    };
    const addIfSinglesPlayerUndefined = (
      match: DbMatch,
      isHome: boolean,
      matchIndex: number,
    ) => {
      addIfPlayerUndefined(match, isHome, matchIndex, (isHome, matchIndex) => {
        const playersMatchIndicesAndDisplay = isHome
          ? homePlayersMatchIndicesAndDisplay
          : awayPlayersMatchIndicesAndDisplay;
        return playersMatchIndicesAndDisplay[matchIndex].positionDisplay;
      });
    };
    for (let i = 0; i < 3; i++) {
      const match = matchAndKeys[i].match;
      addIfSinglesPlayerUndefined(match, true, i);
      addIfSinglesPlayerUndefined(match, false, i);
    }
    const doublesMatch = matchAndKeys[9].match;
    const addDoublesIfPlayerUndefined = (match: DbMatch, isHome: boolean) => {
      addIfPlayerUndefined(match, isHome, 9, () => "D");
    };
    addDoublesIfPlayerUndefined(doublesMatch, true);
    addDoublesIfPlayerUndefined(doublesMatch, false);

    return forfeitModel;
  };
  const showForfeitDialogDisabled = ready ? getDisabled() : true;
  const openForfeitDialog = () => {
    if (!showForfeitDialogDisabled) {
      setShowForfeitDialog(true);
    }
  };
  const forfeitModel = ready ? getFofeitModel() : undefined;
  const getForfeitDialog = () => {
    if (!forfeitModel) {
      return null;
    }
    return (
      <Dialog
        onClose={() => setShowForfeitDialog(false)}
        open={showForfeitDialog}
      >
        {getDialogContents(forfeitModel)}
      </Dialog>
    );
  };

  return {
    showForfeitDialogDisabled,
    openForfeitDialog,
    getForfeitDialog,
    forfeitModel,
  };
}
