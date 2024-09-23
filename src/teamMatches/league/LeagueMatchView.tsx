import { Database, ref, update } from "firebase/database";
import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  DbMatch,
  getTeamDoublesPlayerKeys,
} from "../../firebase/rtb/match/dbMatch";
import {
  PlayerMatchDetails,
  awayPlayerMatchDetails,
  homePlayerMatchDetails,
} from "./singlesLeagueMatchPlayers";
import { Root, refTyped } from "../../firebase/rtb/root";
import {
  createTypedValuesUpdater,
  setTyped,
} from "../../firebase/rtb/typeHelpers";
import { TeamsMatchPlayersSelect } from "../teamMatchPlayerSelect";
import { useRTB } from "../../firebase/rtb/rtbProvider";
import { AvailableDoubles, DoublesSelect } from "./DoublesSelect";
import { useLeagueMatchAndMatches } from "./useLeagueMatchAndMatches";
import { useLeagueTeamsOnValue } from "./useLeagueTeamsOnValue";
import { useAvailablePlayers } from "./useAvailablePlayers";
import { isNotNull } from "../../helpers/isNotTypeGuards";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { getInitials } from "../../umpireView/helpers";
import {
  dbMatchSaveStateToSaveState,
  saveStateToDbMatchSaveState,
} from "../../firebase/rtb/match/conversion";
import { MatchState, TeamScore, Umpire } from "../../umpire";
import { MatchWinState, isMatchWon } from "../../umpire/getMatchWinState";
import { fillArray } from "../../helpers/fillArray";
import { MatchInfo, PlayerNames, UmpireView } from "../../umpireView";
import { LeagueMatchScoreboard } from "./LeagueMatchScoreboard";

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

export const scoresheetAriaLabel = "Scoresheet";
export const getScoresheetGameAriaLabel = (index: number) =>
  `Scoresheet Game ${index}`;
export const scoresheetGameHomePlayerAriaLabel = "Home Player";
export const scoresheetGameAwayPlayerAriaLabel = "Away Player";
const getTeamSelectLabels = (playerMatchDetails: PlayerMatchDetails[]) => {
  return playerMatchDetails.map(
    (playerDetails) =>
      `${playerDetails.positionDisplay} - ${playerDetails.matchIndices.map((i) => i + 1).join(", ")}`,
  );
};
export const homeTeamSelectLabels = getTeamSelectLabels(homePlayerMatchDetails);
export const awayTeamSelectLabels = getTeamSelectLabels(awayPlayerMatchDetails);
const homeTeamPositionIdentifiers = homePlayerMatchDetails.map(
  (pd) => pd.positionDisplay,
);
const awayTeamPositionIdentifiers = awayPlayerMatchDetails.map(
  (pd) => pd.positionDisplay,
);

const getFindPlayersMatchIndices = (playerMatchDetails: PlayerMatchDetails[]) =>
  playerMatchDetails.map(
    (playerMatchDetail) => playerMatchDetail.matchIndices[0],
  );
const findHomePlayersMatchIndices = getFindPlayersMatchIndices(
  homePlayerMatchDetails,
);
const findAwayPlayersMatchIndices = getFindPlayersMatchIndices(
  awayPlayerMatchDetails,
);

const numMatches =
  homePlayerMatchDetails.flatMap((pmd) => pmd.matchIndices).length + 1;

interface UmpireViewInfo {
  umpire: Umpire;
  rules: MatchInfo;
  playerNames: PlayerNames;
  matchState: MatchState;
}

function getMatchState(match: DbMatch) {
  const saveState = dbMatchSaveStateToSaveState(match);
  return new Umpire(saveState).getMatchState();
}

function getFullGameScores(matchState: MatchState) {
  const gameScores = [...matchState.gameScores];

  const matchWon = isMatchWon(matchState.matchWinState);
  if (!matchWon) {
    gameScores.push({
      team1Points: matchState.team1Score.points,
      team2Points: matchState.team2Score.points,
    });
  }
}

export function LeagueMatchViewRoute() {
  const params = useParams();
  return <LeagueMatchView leagueMatchId={params.leagueMatchId!} />;
}
interface LeagueMatchIdProp {
  leagueMatchId: string;
}
export function LeagueMatchView({ leagueMatchId }: LeagueMatchIdProp) {
  const [selectedMatchIndex, setSelectedMatchIndex] = useState<
    number | undefined
  >(undefined);
  const [umpireMatchIndex, setUmpireMatchIndex] = useState<number | undefined>(
    undefined,
  );

  return (
    <LeagueMatchSelection
      leagueMatchId={leagueMatchId}
      renderScoreboard={(
        matchAndKeys,
        db,
        availablePlayersForSelection,
        homeTeamAvailablePlayers,
        awayTeamAvailablePlayers,
      ) => {
        let umpireViewInfo: UmpireViewInfo | undefined;
        if (umpireMatchIndex !== undefined) {
          const dbMatch = matchAndKeys[umpireMatchIndex].match;
          const {
            /* eslint-disable @typescript-eslint/no-unused-vars */
            team1Player1Id,
            team1Player2Id,
            team2Player1Id,
            team2Player2Id,
            /* eslint-enable @typescript-eslint/no-unused-vars */
            ...dbSaveState
          } = dbMatch;
          //This was already done in matchAndKeys.map
          const saveState = dbMatchSaveStateToSaveState(dbSaveState);
          const umpire = new Umpire(saveState);
          const rules = {
            bestOf: umpire.bestOf,
            upTo: umpire.upTo,
            clearBy2: umpire.clearBy2,
            numServes: umpire.numServes,
            team1EndsAt: umpire.team1MidwayPoints,
            team2EndsAt: umpire.team2MidwayPoints,
          };
          const matchState = umpire.getMatchState();

          const getPlayerName = (playerId: string, isHome: boolean) => {
            //todo use selected instead ?
            const teamAvailablePlayers = isHome
              ? homeTeamAvailablePlayers
              : awayTeamAvailablePlayers;
            return teamAvailablePlayers.find(
              (player) => player?.playerId === playerId,
            )!.name;
          };

          const getDoublesPlayerNames = (): PlayerNames => {
            return {
              team1Player1Name: getPlayerName(dbMatch.team1Player1Id!, true),
              team2Player1Name: getPlayerName(dbMatch.team2Player1Id!, false),
              team1Player2Name: getPlayerName(dbMatch.team1Player2Id!, true),
              team2Player2Name: getPlayerName(dbMatch.team2Player2Id!, false),
            };
          };
          const getSinglesPlayerNames = (): PlayerNames => {
            return {
              team1Player1Name: getPlayerName(dbMatch.team1Player1Id!, true),
              team2Player1Name: getPlayerName(dbMatch.team2Player1Id!, false),
              team1Player2Name: undefined,
              team2Player2Name: undefined,
            };
          };
          const playerNames =
            umpireMatchIndex! === 9
              ? getDoublesPlayerNames()
              : getSinglesPlayerNames();

          umpireViewInfo = {
            umpire,
            rules,
            playerNames,
            matchState,
          };
        }
        const matchStateChanged = () => {
          const dbMatchAndKey = matchAndKeys[umpireMatchIndex!];
          const dbMatch = dbMatchAndKey.match;
          const saveState = umpireViewInfo!.umpire.getSaveState();
          const dbMatchSaveState = saveStateToDbMatchSaveState(saveState);
          const updatedMatch: DbMatch = {
            ...dbMatch,
            ...dbMatchSaveState,
          };
          if (dbMatch.team1Player2Id !== undefined) {
            updatedMatch.team1Player2Id = dbMatch.team1Player2Id;
          }
          if (dbMatch.team2Player2Id !== undefined) {
            updatedMatch.team2Player2Id = dbMatch.team2Player2Id;
          }
          const matchDatabaseRef = refTyped(db, `matches/${dbMatchAndKey.key}`);
          setTyped(matchDatabaseRef, updatedMatch).catch((reason) =>
            alert(`error updating - ${reason}`),
          );
        };
        return (
          <>
            <Dialog
              open={selectedMatchIndex !== undefined}
              onClose={() => setSelectedMatchIndex(undefined)}
            >
              <DialogTitle>{`Options for game ${selectedMatchIndex! + 1}`}</DialogTitle>
              <DialogContent>
                <button
                  onClick={() => {
                    setUmpireMatchIndex(selectedMatchIndex);
                    setSelectedMatchIndex(undefined);
                    const updater = createTypedValuesUpdater<Root>();
                    updater.updateListItem(
                      "matches",
                      matchAndKeys[selectedMatchIndex!].key,
                      { umpired: true },
                    );
                    update(ref(db), updater.values);
                  }}
                >
                  Umpire game
                </button>
              </DialogContent>
            </Dialog>
            <div style={{ margin: 10 }}>
              <Box sx={{ width: "100%" }}>
                <Paper sx={{ width: "100%", mb: 2 }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Order</TableCell>
                          <TableCell>H</TableCell>
                          <TableCell>A</TableCell>
                          <TableCell>1st</TableCell>
                          <TableCell>2nd</TableCell>
                          <TableCell>3rd</TableCell>
                          <TableCell>4th</TableCell>
                          <TableCell>5th</TableCell>
                          <TableCell>Res</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {matchAndKeys.map((matchAndKey, index) => {
                          interface TeamSelectionDisplay {
                            display: string;
                            selected: boolean;
                          }
                          const getMatchTeamsDisplay = (
                            match: DbMatch,
                            index: number,
                          ): {
                            home: TeamSelectionDisplay;
                            away: TeamSelectionDisplay;
                          } => {
                            if (index < matchAndKeys.length - 1) {
                              const getPlayerPositionDisplay = (
                                isHome: boolean,
                              ) => {
                                const playerMatchDetails = isHome
                                  ? homePlayerMatchDetails
                                  : awayPlayerMatchDetails;
                                return playerMatchDetails.find((pmd) =>
                                  pmd.matchIndices.includes(index),
                                )!.positionDisplay;
                              };
                              const getPlayerDisplay = (
                                isHome: boolean,
                              ): TeamSelectionDisplay => {
                                const matchPlayerId = isHome
                                  ? match.team1Player1Id
                                  : match.team2Player1Id;
                                if (matchPlayerId !== undefined) {
                                  const teamAvailablePlayers = isHome
                                    ? homeTeamAvailablePlayers
                                    : awayTeamAvailablePlayers;

                                  const playerName = teamAvailablePlayers.find(
                                    (player) =>
                                      player?.playerId === matchPlayerId,
                                  )!.name;
                                  return {
                                    display: getInitials(playerName),
                                    selected: true,
                                  };
                                  // would go distinct - need a memo of player names
                                }
                                return {
                                  display: getPlayerPositionDisplay(isHome),
                                  selected: false,
                                };
                              };

                              return {
                                home: getPlayerDisplay(true),
                                away: getPlayerDisplay(false),
                              };
                            }
                            const doublesMatch =
                              matchAndKeys[matchAndKeys.length - 1].match;

                            const getDoublesTeamDisplay = (
                              player1Id: string | undefined,
                              isHome: boolean,
                            ): TeamSelectionDisplay => {
                              if (player1Id === undefined) {
                                return { display: "TBD", selected: false };
                              }
                              const selectedDoubles = isHome
                                ? availablePlayersForSelection.selectedHomeDoubles
                                : availablePlayersForSelection.selectedAwayDoubles;
                              return {
                                display: `${selectedDoubles?.player1PositionIdentifier} ${selectedDoubles?.player2PositionIdentifier}`,
                                selected: true,
                              };
                            };
                            const homeTeamDisplay = getDoublesTeamDisplay(
                              doublesMatch.team1Player1Id,
                              true,
                            );
                            const awayTeamDisplay = getDoublesTeamDisplay(
                              doublesMatch.team2Player1Id,
                              false,
                            );
                            return {
                              home: homeTeamDisplay,
                              away: awayTeamDisplay,
                            };
                          };

                          /* todo 
                    prevent the table jumping with min widths
                      placeholders same size
                    does not fit into mobile view - alternative
                      Replace 1st, 2nd etc with a scoreboard
                      res could go go on the end 
  
                    do not want to be doing unnecessary calculations
  
                  */
                          const match = matchAndKey.match;

                          // could return more info - player not selected so can display differently
                          const playersDisplay = getMatchTeamsDisplay(
                            match,
                            index,
                          );

                          const matchState = getMatchState(match);
                          const gameScores = getFullGameScores(matchState);
                          const scoresDisplay = `${matchState.team1Score.games} - ${matchState.team2Score.games}`;
                          let winnerOrScoreDisplay = "";
                          if (isMatchWon(matchState.matchWinState)) {
                            const team1Won =
                              matchState.matchWinState ===
                              MatchWinState.Team1Won;
                            const teamDisplay = team1Won
                              ? playersDisplay.home.display
                              : playersDisplay.away.display;
                            winnerOrScoreDisplay = `${teamDisplay} ( ${scoresDisplay} )`;
                          } else {
                            // need check if this has already been implemented
                            const teamScored = (teamScore: TeamScore) => {
                              return (
                                teamScore.games > 0 || teamScore.points > 0
                              );
                            };

                            const hasScored =
                              teamScored(matchState.team1Score) ||
                              teamScored(matchState.team2Score);
                            if (hasScored || match.umpired !== undefined) {
                              winnerOrScoreDisplay = scoresDisplay;
                            }
                          }

                          const gameClicked = () => {
                            if (
                              playersDisplay.home.selected &&
                              playersDisplay.away.selected
                            ) {
                              setSelectedMatchIndex(index);
                            }
                          };
                          // will need to style differently when players have not been selected
                          return (
                            <TableRow
                              aria-label={getScoresheetGameAriaLabel(index)}
                              key={index}
                              onClick={gameClicked}
                            >
                              <TableCell>{index}</TableCell>
                              <TableCell
                                aria-label={scoresheetGameHomePlayerAriaLabel}
                              >
                                {playersDisplay.home.display}
                              </TableCell>
                              <TableCell
                                aria-label={scoresheetGameAwayPlayerAriaLabel}
                              >
                                {playersDisplay.away.display}
                              </TableCell>
                              {fillArray(5, (i) => {
                                let gameScoreDisplay = " / ";
                                const gameScore = gameScores[i];
                                if (
                                  gameScore !== undefined &&
                                  (gameScore.team1Points !== 0 ||
                                    gameScore.team2Points !== 0)
                                ) {
                                  gameScoreDisplay = `${gameScore.team1Points} / ${gameScore.team2Points}`;
                                }
                                return (
                                  <TableCell key={i}>
                                    {gameScoreDisplay}
                                  </TableCell>
                                );
                              })}
                              <TableCell>{winnerOrScoreDisplay}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Box>
            </div>
            {umpireMatchIndex !== undefined && (
              <UmpireView
                autoShowServerReceiverChooser={false}
                matchState={umpireViewInfo!.matchState}
                rules={umpireViewInfo!.rules}
                umpire={{
                  // todo - add a scoreboardWithUmpire method changed on the umpire and an optional button/radio to change it
                  pointScored(isTeam1) {
                    umpireViewInfo!.umpire.pointScored(isTeam1);
                    matchStateChanged();
                  },
                  resetServerReceiver() {
                    umpireViewInfo!.umpire.resetServerReceiver();
                    matchStateChanged();
                  },
                  setFirstGameDoublesReceiver(player) {
                    umpireViewInfo!.umpire.setFirstGameDoublesReceiver(player);
                    matchStateChanged();
                  },
                  setServer(player) {
                    umpireViewInfo!.umpire.setServer(player);
                    matchStateChanged();
                  },
                  switchEnds() {
                    umpireViewInfo!.umpire.switchEnds();
                    matchStateChanged();
                  },
                  undoPoint() {
                    umpireViewInfo!.umpire.undoPoint();
                    matchStateChanged();
                  },
                }}
                {...umpireViewInfo!.playerNames}
              />
            )}
          </>
        );
      }}
    />
  );
}
export interface LeagueMatchSelectionProps extends LeagueMatchIdProp {
  renderScoreboard: (
    matchAndKeys: MatchAndKey[],
    db: Database,
    availablePlayersForSelection: AvailablePlayersForSelection,
    homeTeamAvailablePlayers: AvailablePlayer[],
    awayTeamAvailablePlayers: AvailablePlayer[],
  ) => React.ReactNode;
}

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
            matchAndKeys,
            db,
            availablePlayersForSelection,
            homeTeamAvailablePlayers,
            awayTeamAvailablePlayers,
          )}
        </section>
      </div>
    </>
  );
}
