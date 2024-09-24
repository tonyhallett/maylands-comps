import { useState } from "react";
import { DbMatch } from "../../firebase/rtb/match/dbMatch";
import { refTyped } from "../../firebase/rtb/root";
import { setTyped } from "../../firebase/rtb/typeHelpers";
import {
  Box,
  Button,
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
import { MatchInfo, PlayerNames, UmpireView } from "../../umpireView";
import {
  UmpireUpdate,
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

interface UmpireViewInfo {
  umpire: Umpire;
  rules: MatchInfo;
  playerNames: PlayerNames;
  matchState: MatchState;
}

export const getScoresheetGameAriaLabel = (index: number) =>
  `Scoresheet Game ${index}`;

export function LeagueMatchView({ leagueMatchId }: { leagueMatchId: string }) {
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
          setTyped(matchDatabaseRef, updatedMatch).catch((reason) =>
            alert(`error updating - ${reason}`),
          );
        };
        const rows = umpireMatchAndKeys.map((umpireMatchAndKey, index) => {
          const match = umpireMatchAndKey.match;
          const { home, away } = getMatchTeamSelectionDisplays(
            index,
            umpireMatchAndKeys,
            keyedSinglesMatchNamePositionDisplays,
            keyedDoublesMatchNamesPositionDisplay,
          );
          const bothSelected = home.selected && away.selected;
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
          );

          return (
            <TableRow
              aria-label={getScoresheetGameAriaLabel(index)}
              key={index}
              onClick={() => {
                if (bothSelected) {
                  setSelectedMatchIndex(index);
                }
              }}
            >
              <TableCell>{index}</TableCell>
              {getPlayerCell(
                home,
                true,
                matchState.server,
                matchState.receiver,
              )}
              {getPlayerCell(
                away,
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
        return (
          <>
            <Dialog
              open={selectedMatchIndex !== undefined}
              onClose={() => setSelectedMatchIndex(undefined)}
            >
              <DialogTitle>{`Options for game ${selectedMatchIndex! + 1}`}</DialogTitle>
              <DialogContent>
                <Button
                  onClick={() => {
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
                    setSelectedMatchIndex(undefined);
                  }}
                >
                  Umpire game
                </Button>
              </DialogContent>
            </Dialog>
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
                        <TableCell>O</TableCell>
                        <TableCell>H</TableCell>
                        <TableCell>A</TableCell>
                        <TableCell padding="none" colSpan={5}>
                          Scores
                        </TableCell>
                        <TableCell>Res</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>{rows}</TableBody>
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
