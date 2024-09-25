import { useState } from "react";
import { ConcedeOrForfeit, DbMatch } from "../../firebase/rtb/match/dbMatch";
import { refTyped } from "../../firebase/rtb/root";
import {
  PartialWithNullsWithoutUndefined,
  setTyped,
} from "../../firebase/rtb/typeHelpers";
import {
  Box,
  /* Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton, */
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { MatchInfo, PlayerNames, UmpireView } from "../../umpireView";
import {
  UmpireUpdate,
  createRootUpdater,
  getDbMatchSaveStateFromUmpire,
  updateUmpired,
} from "../../firebase/rtb/match/helpers";
import { getGameScoresDisplay } from "./getGameScoresDisplay";
import { getResultsCell } from "./getResultsCell";
import { getFullGameScores } from "./getFullGameScores";
import { getTeamsMatchScoreState } from "./getTeamsMatchScoreState";
import { getResultsDisplay } from "./getResultsDisplay";
import { getPlayerCell } from "./getPlayerCell";
import { LeagueMatchSelection } from "./LeagueMatchSelection";
import { MatchState, Umpire } from "../../umpire";
import { getMatchTeamSelectionDisplays } from "./getMatchTeamSelectionDisplays";
import { getGameScoreCell } from "./getGameScoreCell";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SportsIcon from "@mui/icons-material/Sports";
const UmpireIcon = SportsIcon;
import PersonOffIcon from "@mui/icons-material/PersonOff";
import { MatchWinState, isMatchWon } from "../../umpire/matchWinState";
const ConcedeIcon = PersonOffIcon;
import PersonIcon from "@mui/icons-material/Person";
import { ref, update } from "firebase/database";
import {
  TeamsConcededOrForfeited,
  getTeamsConcededOrForfeited,
} from "./getTeamsConcededOrForfeited";
const UndoConcedeIcon = PersonIcon;
interface UmpireViewInfo {
  umpire: Umpire;
  rules: MatchInfo;
  playerNames: PlayerNames;
  matchState: MatchState;
}

export const getScoresheetGameAriaLabel = (index: number) =>
  `Scoresheet Game ${index}`;

export const getAllPlayersSelected = (match: DbMatch) => {
  const player1sSelected =
    match.team1Player1Id !== undefined && match.team2Player1Id !== undefined;
  if (!player1sSelected) {
    return false;
  }
  if (match.isDoubles) {
    const player2sSelected =
      match.team1Player2Id !== undefined && match.team2Player2Id !== undefined;
    return player2sSelected;
  }
  return true;
};

export function LeagueMatchView({ leagueMatchId }: { leagueMatchId: string }) {
  const [umpireMatchIndex, setUmpireMatchIndex] = useState<number | undefined>(
    undefined,
  );
  const [gameMenuState, setGameMenuState] = useState<{
    anchorElement: HTMLElement;
    index: number;
  } | null>(null);
  const showGameMenu = Boolean(gameMenuState);
  return (
    <LeagueMatchSelection
      leagueMatchId={leagueMatchId}
      renderScoresheet={(
        umpireMatchAndKeys,
        db,
        keyedSinglesMatchNamePositionDisplays,
        keyedDoublesMatchNamesPositionDisplay,
      ) => {
        let umpireViewInfo: UmpireViewInfo | undefined;
        if (umpireMatchIndex !== undefined) {
          const umpireMatchAndKey = umpireMatchAndKeys[umpireMatchIndex];
          const umpire = umpireMatchAndKey.umpire;
          const rules = {
            bestOf: umpire.bestOf,
            upTo: umpire.upTo,
            clearBy2: umpire.clearBy2,
            numServes: umpire.numServes,
            team1EndsAt: umpire.team1MidwayPoints,
            team2EndsAt: umpire.team2MidwayPoints,
          };
          const matchState = umpireMatchAndKey.matchState;
          const getDoublesPlayerNames = (): PlayerNames => {
            return {
              team1Player1Name:
                keyedDoublesMatchNamesPositionDisplay.homePlayer1!.name,
              team2Player1Name:
                keyedDoublesMatchNamesPositionDisplay.awayPlayer1!.name,
              team1Player2Name:
                keyedDoublesMatchNamesPositionDisplay.homePlayer2!.name,
              team2Player2Name:
                keyedDoublesMatchNamesPositionDisplay.awayPlayer2!.name,
            };
          };

          const getSinglesPlayerNames = (): PlayerNames => {
            const singles =
              keyedSinglesMatchNamePositionDisplays[umpireMatchIndex!];
            return {
              team1Player1Name: singles.homePlayer1.name!,
              team2Player1Name: singles.awayPlayer1.name!,
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
          const umpireMatchAndKey = umpireMatchAndKeys[umpireMatchIndex!];
          const dbMatch = umpireMatchAndKey.match;
          const dbMatchSaveState = getDbMatchSaveStateFromUmpire(
            umpireMatchAndKey.umpire,
          );
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
          const matchDatabaseRef = refTyped(
            db,
            `matches/${umpireMatchAndKey.key}`,
          );
          // todo error handling
          setTyped(matchDatabaseRef, updatedMatch);
        };
        const rows = umpireMatchAndKeys.map((umpireMatchAndKey, index) => {
          const match = umpireMatchAndKey.match;
          const teamsConcededOrDefaulted = getTeamsConcededOrForfeited(match);
          const { home, away } = getMatchTeamSelectionDisplays(
            index,
            umpireMatchAndKeys,
            keyedSinglesMatchNamePositionDisplays,
            keyedDoublesMatchNamesPositionDisplay,
          );
          const matchState = umpireMatchAndKey.matchState;
          const teamsMatchScoreState = getTeamsMatchScoreState(
            matchState.matchWinState,
          );

          const gameScores = getFullGameScores(matchState);
          const resultsDisplay = getResultsDisplay(
            home,
            away,
            matchState,
            teamsMatchScoreState,
            match.umpired,
            index === 9,
            teamsConcededOrDefaulted,
          );

          return (
            <TableRow
              aria-label={getScoresheetGameAriaLabel(index)}
              key={index}
            >
              <TableCell padding="none">
                <div
                  onClick={(event) => {
                    setGameMenuState({
                      anchorElement: event.currentTarget,
                      index,
                    });
                  }}
                >
                  <MoreVertIcon />
                </div>
              </TableCell>
              <TableCell padding="none">{index}</TableCell>
              {getPlayerCell(
                home,
                teamsConcededOrDefaulted.home.conceded,
                true,
                matchState.server,
                matchState.receiver,
              )}
              {getPlayerCell(
                away,
                teamsConcededOrDefaulted.away.conceded,
                false,
                matchState.server,
                matchState.receiver,
              )}
              {getGameScoresDisplay(
                gameScores,
                teamsMatchScoreState,
                match.umpired,
              ).map(getGameScoreCell)}
              {getResultsCell(resultsDisplay)}
            </TableRow>
          );
        });
        //#region match result display - todo and move
        enum LeadType {
          Losing,
          Winning,
          Draw,
        }
        enum LeagueMatchResultState {
          InProgress,
          Unassailable,
          Completed,
        }
        interface TeamLeagueMatchResult {
          score: number;
          leadType: LeadType;
        }
        interface LeagueMatchResult {
          state: LeagueMatchResultState;
          home: TeamLeagueMatchResult;
          away: TeamLeagueMatchResult;
        }

        const getLeagueMatchResult = (): LeagueMatchResult => {
          const leagueMatchResult: LeagueMatchResult = {
            state: LeagueMatchResultState.InProgress,
            home: {
              score: 0,
              leadType: LeadType.Draw,
            },
            away: {
              score: 0,
              leadType: LeadType.Draw,
            },
          };
          let numGamesConcluded = 0;
          umpireMatchAndKeys.forEach((umpireMatchKey) => {
            const teamsConcededOrForefeited = getTeamsConcededOrForfeited(
              umpireMatchKey.match,
            );
            const homeConcededOrDefaulted =
              teamsConcededOrForefeited.home.conceded ||
              teamsConcededOrForefeited.home.forefeited;
            const awayConcededOrDefaulted =
              teamsConcededOrForefeited.away.conceded ||
              teamsConcededOrForefeited.away.forefeited;
            if (homeConcededOrDefaulted && awayConcededOrDefaulted) {
              numGamesConcluded++;
            } else if (homeConcededOrDefaulted) {
              numGamesConcluded++;
              leagueMatchResult.away.score++;
            } else if (awayConcededOrDefaulted) {
              leagueMatchResult.home.score++;
              numGamesConcluded++;
            } else {
              const matchWinState = umpireMatchKey.matchState.matchWinState;
              if (matchWinState === MatchWinState.Team1Won) {
                numGamesConcluded++;
                leagueMatchResult.home.score++;
              }
              if (matchWinState === MatchWinState.Team2Won) {
                numGamesConcluded++;
                leagueMatchResult.away.score++;
              }
            }
          });
          if (leagueMatchResult.home.score > leagueMatchResult.away.score) {
            leagueMatchResult.home.leadType = LeadType.Winning;
            leagueMatchResult.away.leadType = LeadType.Losing;
          }
          if (leagueMatchResult.home.score < leagueMatchResult.away.score) {
            leagueMatchResult.home.leadType = LeadType.Losing;
            leagueMatchResult.away.leadType = LeadType.Winning;
          }
          if (numGamesConcluded === 10) {
            leagueMatchResult.state = LeagueMatchResultState.Completed;
          } else {
            if (
              leagueMatchResult.home.score > 5 ||
              leagueMatchResult.away.score > 5
            ) {
              leagueMatchResult.state = LeagueMatchResultState.Unassailable;
            }
          }
          return leagueMatchResult;
        };
        const matchResult = getLeagueMatchResult();
        // todo - add the leading team initials with the score - only when completed ?
        const getMatchResultDisplay = (
          leagueMatchResult: LeagueMatchResult,
        ) => {
          const winningColor = "green";
          const unassailableOrWonColor = "yellow";
          const getLeadingColor = () => {
            const state = leagueMatchResult.state;
            if (state === LeagueMatchResultState.InProgress) {
              return winningColor;
            }
            return unassailableOrWonColor;
          };
          const getTeamResult = (isHome: boolean) => {
            const teamLeagueMatchResult = isHome
              ? leagueMatchResult.home
              : leagueMatchResult.away;
            const teamColor =
              teamLeagueMatchResult.leadType === LeadType.Winning
                ? getLeadingColor()
                : "inherit";
            return (
              <span style={{ color: teamColor, whiteSpace: "nowrap" }}>
                {teamLeagueMatchResult.score}
              </span>
            );
          };

          return (
            <>
              {getTeamResult(true)}
              <span style={{ whiteSpace: "nowrap" }}> - </span>
              {getTeamResult(false)}
            </>
          );
        };
        const matchResultDisplay = getMatchResultDisplay(matchResult);
        //#endregion
        const closeMenu = () => setGameMenuState(null);
        const umpireGame = () => {
          const selectedMatchIndex = gameMenuState!.index;
          const umpireUpdates: UmpireUpdate[] = [
            {
              key: umpireMatchAndKeys[selectedMatchIndex!].key,
              umpired: true,
            },
          ];
          if (umpireMatchIndex !== undefined) {
            umpireUpdates.push({
              key: umpireMatchAndKeys[umpireMatchIndex].key,
            });
          }
          updateUmpired(umpireUpdates, db);
          setUmpireMatchIndex(selectedMatchIndex);
        };

        const getConcedeMenuItems = (
          teamsConcededOrDefaulted: TeamsConcededOrForfeited,
          key: string,
          matchWon: boolean,
          allPlayersSelected: boolean,
        ) => {
          const forfeited =
            teamsConcededOrDefaulted.home.forefeited ||
            teamsConcededOrDefaulted.away.forefeited;

          const concedeDisabled = matchWon || !allPlayersSelected || forfeited;

          const getConcedeText = (isHome: boolean, conceded: boolean) => {
            const homeOrAway = isHome ? "Home" : "Away";
            const prefix = conceded ? "Undo " : "";
            return `${prefix}${homeOrAway} Concede`;
          };
          const getConcedeMenuItem = (isHome: boolean) => {
            const conceded = isHome
              ? teamsConcededOrDefaulted.home.conceded
              : teamsConcededOrDefaulted.away.conceded;
            const concedeIcon = conceded ? (
              <UndoConcedeIcon />
            ) : (
              <ConcedeIcon />
            );
            return (
              <MenuItem
                onClick={() => {
                  closeMenu();
                  const concededUpdate: ConcedeOrForfeit | null = !conceded
                    ? {
                        isConcede: true,
                      }
                    : null;
                  const updater = createRootUpdater();
                  const updatedMatch: PartialWithNullsWithoutUndefined<DbMatch> =
                    isHome
                      ? { team1ConcedeOrForfeit: concededUpdate }
                      : { team2ConcedeOrForfeit: concededUpdate };

                  updater.updateListItem("matches", key, updatedMatch);
                  if (umpireMatchIndex === gameMenuState!.index) {
                    updatedMatch.umpired = null;
                  }
                  // todo - error handling
                  update(ref(db), updater.values);
                  setUmpireMatchIndex(undefined);
                }}
                key={isHome ? "homeConcedeMenuItem" : "awayConcedeMenuItem"}
                disabled={concedeDisabled}
              >
                <ListItemIcon>{concedeIcon}</ListItemIcon>
                <ListItemText>{getConcedeText(isHome, conceded)}</ListItemText>
              </MenuItem>
            );
          };
          return [getConcedeMenuItem(true), getConcedeMenuItem(false)];
        };

        const getUmpireMenuItem = (
          allPlayersSelected: boolean,
          concededOrForfeited: boolean,
        ) => {
          /*
            todo - use this to remove umpiring of a game
            const isUmpiringGame = umpireMatchIndex === gameMenuState!.index;
          */
          return (
            <MenuItem
              key="umpireMenuItem"
              disabled={!allPlayersSelected || concededOrForfeited}
              onClick={() => {
                umpireGame();
                closeMenu();
              }}
            >
              <ListItemIcon>
                <UmpireIcon />
              </ListItemIcon>
              <ListItemText>Umpire</ListItemText>
            </MenuItem>
          );
        };

        const getGameMenuItems = () => {
          const umpireMatchAndKey = umpireMatchAndKeys[gameMenuState!.index];
          const allPlayersSelected = getAllPlayersSelected(
            umpireMatchAndKey.match,
          );
          const matchWon = isMatchWon(
            umpireMatchAndKey.matchState.matchWinState,
          );
          const teamsConcededOrDefaulted = getTeamsConcededOrForfeited(
            umpireMatchAndKey.match,
          );
          const concededOrForfeited =
            teamsConcededOrDefaulted.home.conceded ||
            teamsConcededOrDefaulted.away.conceded ||
            teamsConcededOrDefaulted.home.forefeited ||
            teamsConcededOrDefaulted.away.forefeited;
          return [
            getUmpireMenuItem(allPlayersSelected, concededOrForfeited),
            ...getConcedeMenuItems(
              teamsConcededOrDefaulted,
              umpireMatchAndKey.key,
              matchWon,
              allPlayersSelected,
            ),
          ];
        };
        const menuItems = gameMenuState === null ? [] : getGameMenuItems();
        return (
          <>
            <Menu
              disableScrollLock
              open={showGameMenu}
              onClose={closeMenu}
              anchorEl={gameMenuState?.anchorElement}
            >
              <MenuList dense>{menuItems}</MenuList>
            </Menu>
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
            <Box sx={{ width: "100%" }}>
              <Paper sx={{ width: "100%", mb: 2 }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell padding="none"></TableCell>
                        <TableCell padding="none">O</TableCell>
                        <TableCell>H</TableCell>
                        <TableCell>A</TableCell>
                        <TableCell padding="none" colSpan={5}>
                          Scores
                        </TableCell>
                        <TableCell>Res</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows}
                      <TableRow>
                        <TableCell padding="none"></TableCell>
                        <TableCell padding="none"></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell padding="none"></TableCell>
                        <TableCell padding="none"></TableCell>
                        <TableCell padding="none"></TableCell>
                        <TableCell padding="none"></TableCell>
                        <TableCell padding="none"></TableCell>
                        <TableCell>{matchResultDisplay}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          </>
        );
      }}
    />
  );
}
