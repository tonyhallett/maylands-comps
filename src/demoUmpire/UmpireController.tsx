import { useState } from "react";
import { ServersReceiversChooser } from "./ServersReceiversChooser";
import { PlayerNames } from ".";
import { LeftRightMatchWinState, MatchView } from "./MatchView";
import { MatchState, Player, Umpire } from "../umpire";
import { HistoryView } from "./HistoryView";
import { MatchWinState } from "../umpire/getMatchWinState";
import { Box, Card } from "@mui/material";
import { EndsDialog } from "./EndsDialog";
import { UmpireToolbar } from "./UmpireToolbar";

export interface UmpireControllerProps extends PlayerNames {
  umpire: Umpire;
  matchStateChanged?: () => void;
} //todo

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
  if (matchWinState & MatchWinState.GamePointTeam1) {
    leftRightMatchWinState = isTeam1Left
      ? LeftRightMatchWinState.GamePointLeft
      : LeftRightMatchWinState.GamePointRight;
  }

  if (matchWinState & MatchWinState.GamePointTeam2) {
    leftRightMatchWinState =
      leftRightMatchWinState +
      (!isTeam1Left
        ? LeftRightMatchWinState.GamePointLeft
        : LeftRightMatchWinState.GamePointRight);
  }

  if (matchWinState & MatchWinState.MatchPointTeam1) {
    leftRightMatchWinState =
      leftRightMatchWinState +
      (isTeam1Left
        ? LeftRightMatchWinState.MatchPointLeft
        : LeftRightMatchWinState.MatchPointRight);
  }
  if (matchWinState & MatchWinState.MatchPointTeam2) {
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
  team1Player1Name,
  team2Player1Name,
  team1Player2Name,
  team2Player2Name,
  matchStateChanged,
}: UmpireControllerProps) {
  const [matchState, setMatchState] = useState<MatchState>(
    umpire.getMatchState(),
  );
  const setNewMatchState = (matchState: MatchState) => {
    setMatchState(matchState);
    if (matchStateChanged) {
      matchStateChanged();
    }
  };
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
    <>
      <EndsDialog
        isEnds={matchState.isEnds}
        isDoubles={team1Player2Name !== undefined}
      />
      <ServersReceiversChooser
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
            undoPoint={() => setNewMatchState(umpire.undoPoint())}
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
              bestOf: umpire.bestOf,
              clearBy2: umpire.clearBy2,
              upTo: umpire.upTo,
              numServes: umpire.numServes,
            }}
            switchEnds={() => {
              setNewMatchState(umpire.switchEnds());
            }}
          />
        </Box>
      </Card>
      <HistoryView
        team1StartScore={umpire.team1StartGameScore}
        team2StartScore={umpire.team2StartGameScore}
        gameWon={gameWon(matchState.matchWinState)}
        currentGameScore={{
          team1Points: matchState.team1Score.points,
          team2Points: matchState.team2Score.points,
        }}
        team1Left={matchState.team1Left}
        gameScores={matchState.gameScores}
        pointHistory={matchState.pointHistory}
      />
    </>
  );
}

function gameWon(matchWinState: MatchWinState) {
  return (
    matchWinState === MatchWinState.Team1Won ||
    matchWinState === MatchWinState.Team2Won
  );
}
