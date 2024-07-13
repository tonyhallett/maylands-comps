import { useRef, useState } from "react";
import { ServerReceiverChooser } from "./dialogs/serverReceiver/ServerReceiverChooser";
import { LeftRightMatchWinState, MatchView } from "./match/MatchView";
import { MatchState, Player } from "../umpire";
import {
  isGamePointTeam1,
  isGamePointTeam2,
  isMatchPointTeam1,
  isMatchPointTeam2,
  MatchWinState,
} from "../umpire/getMatchWinState";
import { Box, Card } from "@mui/material";
import { EndsDialog } from "./dialogs/EndsDialog";
import { UmpireToolbar } from "./toolbar/UmpireToolbar";
import { getTeamVs } from "./helpers";

export interface PlayerNames {
  team1Player1Name: string;
  team2Player1Name: string;
  team1Player2Name?: string;
  team2Player2Name?: string;
}

export type UmpireMatchStateRenderer = (
  matchState: MatchState,
  umpire: ControllableUmpire,
  rules: MatchInfo,
  playerNames: PlayerNames,
) => JSX.Element;

interface ControllableUmpire {
  setFirstGameDoublesReceiver(player: string): MatchState;
  switchEnds(): MatchState;
  resetServerReceiver(): MatchState;
  pointScored(isTeam1: boolean): MatchState;
  undoPoint(): MatchState;
  setServer(player: Player): MatchState;
  getMatchState(): MatchState;
}

interface MatchInfo {
  team2StartGameScore: number;
  team1StartGameScore: number;
  bestOf: number;
  clearBy2: boolean;
  upTo: number;
  numServes: number;
  team1EndsAt: number;
  team2EndsAt: number;
}
export interface UmpireControllerProps extends PlayerNames {
  umpire: ControllableUmpire;
  rules: MatchInfo;
  matchStateChanged?: () => void;
  additionalStateRendering?: UmpireMatchStateRenderer;
}

function getServerReceiverName(
  player: Player | undefined,
  team1Player1Name: string,
  team2Player1Name: string,
  team1Player2Name: string,
  team2Player2Name: string,
): string {
  if (player === undefined) {
    return "";
  }
  switch (player) {
    case "Team1Player1":
      return team1Player1Name;
    case "Team1Player2":
      return team1Player2Name;
    case "Team2Player1":
      return team2Player1Name;
    default:
      return team2Player2Name;
  }
}

function matchWon(matchWinState: MatchWinState): boolean {
  return (
    matchWinState === MatchWinState.Team1Won ||
    matchWinState === MatchWinState.Team2Won
  );
}

function getLeftMatchWinState(
  matchWinState: MatchWinState,
  isTeam1Left: boolean,
): LeftRightMatchWinState {
  if (matchWinState === MatchWinState.NotWon) {
    return LeftRightMatchWinState.NotWon;
  }
  if (matchWinState === MatchWinState.Team1Won) {
    return isTeam1Left
      ? LeftRightMatchWinState.LeftWon
      : LeftRightMatchWinState.RightWon;
  }
  if (matchWinState === MatchWinState.Team2Won) {
    return !isTeam1Left
      ? LeftRightMatchWinState.LeftWon
      : LeftRightMatchWinState.RightWon;
  }
  let leftRightMatchWinState = LeftRightMatchWinState.NotWon;
  if (isGamePointTeam1(matchWinState)) {
    leftRightMatchWinState = isTeam1Left
      ? LeftRightMatchWinState.GamePointLeft
      : LeftRightMatchWinState.GamePointRight;
  }

  if (isGamePointTeam2(matchWinState)) {
    leftRightMatchWinState =
      leftRightMatchWinState +
      (!isTeam1Left
        ? LeftRightMatchWinState.GamePointLeft
        : LeftRightMatchWinState.GamePointRight);
  }

  if (isMatchPointTeam1(matchWinState)) {
    leftRightMatchWinState =
      leftRightMatchWinState +
      (isTeam1Left
        ? LeftRightMatchWinState.MatchPointLeft
        : LeftRightMatchWinState.MatchPointRight);
  }
  if (isMatchPointTeam2(matchWinState)) {
    leftRightMatchWinState =
      leftRightMatchWinState +
      (!isTeam1Left
        ? LeftRightMatchWinState.MatchPointLeft
        : LeftRightMatchWinState.MatchPointRight);
  }
  return leftRightMatchWinState;
}

export function UmpireController({
  umpire,
  rules,
  matchStateChanged,
  additionalStateRendering,
  ...playerNames
}: UmpireControllerProps) {
  const [matchState, setMatchState] = useState<MatchState>(
    umpire.getMatchState(),
  );
  const revertedPointRef = useRef(false);
  const setNewMatchState = (
    newMatchState: MatchState,
    revertedPoint = false,
  ) => {
    revertedPointRef.current = revertedPoint;
    setMatchState(newMatchState);

    if (matchStateChanged) {
      matchStateChanged();
    }
  };
  const {
    team1Player1Name,
    team2Player1Name,
    team1Player2Name,
    team2Player2Name,
  } = playerNames;
  const serverReceiverChoice = matchState.serverReceiverChoice;

  const canScorePoint =
    serverReceiverChoice.servers.length === 0 &&
    serverReceiverChoice.firstGameDoublesReceivers.length === 0 &&
    !matchWon(matchState.matchWinState);

  const getNameOfServerReceiver = (isServer: boolean) => {
    return getServerReceiverName(
      isServer ? matchState.server : matchState.receiver,
      team1Player1Name,
      team2Player1Name,
      team1Player2Name,
      team2Player2Name,
    );
  };
  return (
    <div>
      <div style={{ userSelect: "none" }}>
        <EndsDialog
          isEnds={matchState.isEnds && !revertedPointRef.current}
          isDoubles={team1Player2Name !== undefined}
        />
        <ServerReceiverChooser
          showTosser={
            serverReceiverChoice.servers.length > 0 &&
            matchState.gameScores.length === 0
          }
          availableReceivers={serverReceiverChoice.firstGameDoublesReceivers}
          availableServers={serverReceiverChoice.servers}
          chosenCallback={(player, isServer) => {
            let matchState: MatchState;
            if (isServer) {
              matchState = umpire.setServer(player);
            } else {
              matchState = umpire.setFirstGameDoublesReceiver(player);
            }
            setNewMatchState(matchState);
          }}
          team1Player1Name={team1Player1Name}
          team2Player1Name={team2Player1Name}
          team1Player2Name={team1Player2Name}
          team2Player2Name={team2Player2Name}
        />
        <Card variant="outlined">
          <Box p={1}>
            <MatchView
              leftPlayer1Name={
                matchState.team1Left ? team1Player1Name : team2Player1Name
              }
              leftPlayer2Name={
                matchState.team1Left ? team1Player2Name : team2Player2Name
              }
              rightPlayer1Name={
                !matchState.team1Left ? team1Player1Name : team2Player1Name
              }
              rightPlayer2Name={
                !matchState.team1Left ? team1Player2Name : team2Player2Name
              }
              leftScore={
                matchState.team1Left
                  ? matchState.team1Score
                  : matchState.team2Score
              }
              rightScore={
                !matchState.team1Left
                  ? matchState.team1Score
                  : matchState.team2Score
              }
              matchWinState={getLeftMatchWinState(
                matchState.matchWinState,
                matchState.team1Left,
              )}
              receiverName={getNameOfServerReceiver(false)}
              serverName={getNameOfServerReceiver(true)}
              remainingServes={matchState.remainingServes}
              gamePointFontSize={80}
              setPointFontSize={40}
            />
            <UmpireToolbar
              canUndoPoint={matchState.canUndoPoint}
              undoPoint={() => setNewMatchState(umpire.undoPoint(), true)}
              canScorePoint={canScorePoint}
              scorePoint={(isLeft) => {
                const isTeam1 = matchState.team1Left === isLeft;
                setNewMatchState(umpire.pointScored(isTeam1));
              }}
              canResetServerReceiver={matchState.canResetServerReceiver}
              resetServerReceiver={() => {
                setNewMatchState(umpire.resetServerReceiver());
              }}
              rules={{
                bestOf: rules.bestOf,
                clearBy2: rules.clearBy2,
                upTo: rules.upTo,
                numServes: rules.upTo,
                team1EndsAt: rules.team1EndsAt,
                team2EndsAt: rules.team2EndsAt,
                team1Identifier: getTeamVs(team1Player1Name, team1Player2Name),
                team2Identifier: getTeamVs(team2Player1Name, team2Player2Name),
              }}
              switchEnds={() => {
                setNewMatchState(umpire.switchEnds());
              }}
            />
          </Box>
        </Card>
      </div>
      {additionalStateRendering &&
        additionalStateRendering(matchState, umpire, rules, playerNames)}
    </div>
  );
}
