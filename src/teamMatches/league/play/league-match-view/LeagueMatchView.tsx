import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  UmpireUpdate,
  updateUmpired,
} from "../../../../firebase/rtb/match/db-helpers/updateUmpired";
import { updateConceded } from "../../../../firebase/rtb/match/db-helpers/updateConceded";
import { getGameScoresModel } from "./scoresheet/model/getGameScoresModel";
import { getResultsCell } from "./scoresheet/ui/getResultsCell";
import { getTeamsMatchWinState } from "./helpers/getTeamsMatchWinState";
import { getResultsModel } from "./scoresheet/model/getResultsModel";
import { getPlayerCell } from "./scoresheet/ui/getPlayerCell";
import { LeagueMatchSelection } from "../league-match-selection/LeagueMatchSelection";
import { getMatchTeamsSelectionModel } from "./scoresheet/model/getMatchTeamsSelectionModel";
import { getGameScoreCell } from "./scoresheet/ui/getGameScoreCell";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { getTeamsConcededOrForfeited } from "../../../../firebase/rtb/match/helpers/getTeamsConcededOrForfeited";
import { getFullGameScores } from "../../helpers";
import { getLeagueMatchResultModel } from "./scoresheet/model/getLeagueMatchResultModel";
import { getMatchResultDisplay } from "./scoresheet/ui/getMatchResultDisplay";
import { getUmpireViewInfo } from "./getUmpireViewInfo";
import { DbUmpireView } from "./DbUmpireView";
import { ScoresheetGameMenu } from "./ScoresheetGameMenu";
import { UmpireMatchAndKey } from "../league-match-selection/renderScoresheet-type";
import {
  GameScoreInput,
  ManualScoresInput,
} from "../../../../ManualScoresInput";
import { scoreGameScores } from "../../../../umpire/umpireHelpers";
import { refTyped } from "../../../../firebase/rtb/root";
import { setTyped } from "../../../../firebase/rtb/typeHelpers";
import { getUpdatedMatchFromUmpire } from "./getUpdatedMatchFromUmpire";
import { createLeagueMatchUmpire } from "../../db-population/createLeagueMatchUmpire";
import { getIsManualInput } from "./getIsManualInput";
import { Umpire } from "../../../../umpire";

// #region aria labels
export const scoresheetTableAriaLabel = "Scoresheet Table";
export const getScoresheetGameRowAriaLabel = (index: number) => `Game ${index}`;
export const scoresheetLeagueMatchResultRowAriaLabel =
  "League Match Result Row";
export const scoresheetLeagueMatchResultCellAriaLabel =
  "League Match Result Cell";
export const getLeagueMatchResultTeamElementAriaLabel = (isHome: boolean) =>
  `League Match Result ${isHome ? "Home" : "Away"}`;
export const getMatchOrderCellAriaLabel = (index: number) =>
  `Match order cell ${index}`;
export const gameMenuButtonAriaLabel = "Game Menu Button";
//#endregion

export function LeagueMatchView({ leagueMatchId }: { leagueMatchId: string }) {
  const [umpireMatchIndex, setUmpireMatchIndex] = useState<number | undefined>(
    undefined,
  );
  const [manualInput, setManualInput] = useState<UmpireMatchAndKey | undefined>(
    undefined,
  );
  const [gameMenuState, setGameMenuState] = useState<{
    anchorElement: HTMLElement;
    index: number;
  } | null>(null);
  return (
    <LeagueMatchSelection
      leagueMatchId={leagueMatchId}
      renderScoresheet={(
        umpireMatchAndKeys,
        db,
        keyedSinglesMatchNamePositionDisplays,
        keyedDoublesMatchNamesPositionDisplay,
      ) => {
        const umpireViewInfo = getUmpireViewInfo(
          umpireMatchIndex,
          umpireMatchAndKeys,
          keyedSinglesMatchNamePositionDisplays,
          keyedDoublesMatchNamesPositionDisplay,
        );

        const rows = umpireMatchAndKeys.map((umpireMatchAndKey, index) => {
          const match = umpireMatchAndKey.match;
          const teamsConcededOrDefaulted = getTeamsConcededOrForfeited(match);
          const { home, away } = getMatchTeamsSelectionModel(
            index,
            !match.isDoubles,
            keyedSinglesMatchNamePositionDisplays,
            keyedDoublesMatchNamesPositionDisplay,
          );
          const matchState = umpireMatchAndKey.matchState;
          const teamsMatchWinState = getTeamsMatchWinState(
            matchState.matchWinState,
          );

          const gameScores = getFullGameScores(matchState);
          const resultsModel = getResultsModel(
            home,
            away,
            matchState,
            teamsMatchWinState,
            match.umpired,
            index === 9,
            teamsConcededOrDefaulted,
          );

          return (
            <TableRow
              aria-label={getScoresheetGameRowAriaLabel(index + 1)}
              key={index}
            >
              <TableCell padding="none">
                <div
                  role="button"
                  aria-label={gameMenuButtonAriaLabel}
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
              <TableCell
                aria-label={getMatchOrderCellAriaLabel(index)}
                padding="none"
              >
                {index + 1}
              </TableCell>
              {getPlayerCell(
                home,
                teamsConcededOrDefaulted.team1,
                true,
                matchState.server,
                matchState.receiver,
              )}
              {getPlayerCell(
                away,
                teamsConcededOrDefaulted.team2,
                false,
                matchState.server,
                matchState.receiver,
              )}
              {getGameScoresModel(
                gameScores,
                teamsMatchWinState,
                match.umpired,
              ).map(getGameScoreCell)}
              {getResultsCell(resultsModel)}
            </TableRow>
          );
        });

        const removeExistingUmpiredGame = (umpireUpdates: UmpireUpdate[]) => {
          if (umpireMatchIndex !== undefined) {
            umpireUpdates.push({
              key: umpireMatchAndKeys[umpireMatchIndex].key,
            });
          }
        };
        const umpireGame = (key: string) => {
          const selectedMatchIndex = gameMenuState!.index;
          const umpireUpdates: UmpireUpdate[] = [
            {
              key,
              umpired: true,
            },
          ];
          removeExistingUmpiredGame(umpireUpdates);
          updateUmpired(umpireUpdates, db);
          setUmpireMatchIndex(selectedMatchIndex);
        };

        const resetManualInput = (
          umpireCallback: (umpire: Umpire) => void = () => {},
        ) => {
          const resetUmpire = createLeagueMatchUmpire(
            manualInput!.match.isDoubles,
          );
          umpireCallback(resetUmpire);
          const matchDatabaseRef = refTyped(db, `matches/${manualInput!.key}`);
          const updatedMatch = getUpdatedMatchFromUmpire(
            manualInput!.match,
            resetUmpire,
          );
          updatedMatch.pointHistory = {
            "0": "empty",
          };
          setTyped(matchDatabaseRef, updatedMatch);

          setManualInput(undefined);
        };

        return (
          <>
            {manualInput && (
              <Dialog open onClose={() => setManualInput(undefined)}>
                <DialogTitle>Manual Input</DialogTitle>
                <DialogContent>
                  {getIsManualInput(manualInput!.match) && (
                    <>
                      <Button onClick={() => resetManualInput()}>Remove</Button>
                      <Divider />
                      <br />
                    </>
                  )}
                  <ManualScoresInput
                    bestOf={manualInput.match.bestOf}
                    upTo={manualInput.match.upTo}
                    clearBy2={manualInput.match.clearBy2}
                    submit={function (gameScoreInputs: GameScoreInput[]): void {
                      resetManualInput((resetUmpire) => {
                        scoreGameScores(
                          resetUmpire,
                          gameScoreInputs.map((gsi) => {
                            return {
                              team1Points: gsi.homePoints,
                              team2Points: gsi.awayPoints,
                            };
                          }),
                        );
                      });
                    }}
                  />
                </DialogContent>
              </Dialog>
            )}
            <ScoresheetGameMenu
              inputScores={(umpireMatchAndKey) => {
                setManualInput(umpireMatchAndKey);
              }}
              closeMenu={() => setGameMenuState(null)}
              anchorElement={gameMenuState?.anchorElement}
              umpireMatchAndKey={
                gameMenuState === null
                  ? undefined
                  : umpireMatchAndKeys[gameMenuState.index]
              }
              umpireGame={umpireGame}
              updateConceded={(conceded, isHome, key) => {
                // todo - error handling
                updateConceded(conceded, isHome, key, db, (updatedMatch) => {
                  if (umpireMatchIndex === gameMenuState!.index) {
                    updatedMatch.umpired = null;
                  }
                });
                setUmpireMatchIndex(undefined);
              }}
            />
            {umpireViewInfo !== undefined && (
              <DbUmpireView
                {...umpireViewInfo}
                {...umpireViewInfo!.playerNames}
                autoShowServerReceiverChooser={false}
                dbMatch={umpireMatchAndKeys[umpireMatchIndex!].match}
                matchKey={umpireMatchAndKeys[umpireMatchIndex!].key}
              />
            )}
            <Box sx={{ width: "100%" }}>
              <Paper sx={{ width: "100%", mb: 2 }}>
                <TableContainer>
                  <Table size="small" aria-label={scoresheetTableAriaLabel}>
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
                      <TableRow
                        aria-label={scoresheetLeagueMatchResultRowAriaLabel}
                      >
                        <TableCell padding="none"></TableCell>
                        <TableCell padding="none"></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell padding="none"></TableCell>
                        <TableCell padding="none"></TableCell>
                        <TableCell padding="none"></TableCell>
                        <TableCell padding="none"></TableCell>
                        <TableCell padding="none"></TableCell>
                        <TableCell
                          aria-label={scoresheetLeagueMatchResultCellAriaLabel}
                        >
                          {getMatchResultDisplay(
                            getLeagueMatchResultModel(umpireMatchAndKeys),
                          )}
                        </TableCell>
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
