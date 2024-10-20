import { useRef, useState } from "react";
import { ServerReceiverChooser } from "./dialogs/serverReceiver/ServerReceiverChooser";
import { LeftRightMatchWinState, MatchView } from "./match/MatchView";
import { CompetitionRules, MatchState, Player } from "../umpire";
import {
  isGamePointTeam1,
  isGamePointTeam2,
  isMatchPointTeam1,
  isMatchPointTeam2,
  isMatchWon,
  MatchWinState,
} from "../umpire/matchWinState";
import { Box, Card } from "@mui/material";
import { EndsDialog } from "./dialogs/EndsDialog";
import {
  ServerReceiverButtonProps,
  UmpireToolbar,
} from "./toolbar/UmpireToolbar";
import { getTeamInitials } from "./helpers";

export interface PlayerNames {
  team1Player1Name: string;
  team2Player1Name: string;
  team1Player2Name: string | undefined;
  team2Player2Name: string | undefined;
}

export type DoublesPlayerNames = Required<PlayerNames>;

export interface ControllableUmpire {
  setFirstGameDoublesReceiver(player: Player): void;
  switchEnds(): void;
  resetServerReceiver(): void;
  pointScored(isTeam1: boolean): void;
  undoPoint(): void;
  setServer(player: Player): void;
}

export interface MatchInfo extends CompetitionRules {
  bestOf: number;
  team1EndsAt: number;
  team2EndsAt: number;
}
export interface UmpireViewProps extends PlayerNames {
  umpire: ControllableUmpire;
  matchState: MatchState;
  rules: MatchInfo;
  autoShowServerReceiverChooser: boolean;
  serverReceiverTop?: boolean | undefined;
}

function getServerReceiverName(
  player: Player | undefined,
  team1Player1Name: string,
  team2Player1Name: string,
  team1Player2Name: string | undefined,
  team2Player2Name: string | undefined,
): string | undefined {
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

export function UmpireView({
  umpire,
  rules,
  matchState,
  autoShowServerReceiverChooser,
  serverReceiverTop,
  ...playerNames
}: UmpireViewProps) {
  const revertedPointRef = useRef(false);
  const [showManualServerReceiverDialog, setShowManualServerReceiverDialog] =
    useState(false);
  serverReceiverTop =
    serverReceiverTop === undefined ? true : serverReceiverTop;
  const {
    team1Player1Name,
    team2Player1Name,
    team1Player2Name,
    team2Player2Name,
  } = playerNames;
  const serverReceiverChoice = matchState.serverReceiverChoice;
  const hasFirstGameDoublesReceivers =
    serverReceiverChoice.firstGameDoublesReceivers.length > 0;
  const hasServerReceiverChoice =
    serverReceiverChoice.servers.length > 0 || hasFirstGameDoublesReceivers;

  const canScorePoint =
    !hasServerReceiverChoice && !isMatchWon(matchState.matchWinState);

  const getNameOfServerReceiver = (isServer: boolean) => {
    return getServerReceiverName(
      isServer ? matchState.server : matchState.receiver,
      team1Player1Name,
      team2Player1Name,
      team1Player2Name,
      team2Player2Name,
    );
  };

  let serverReceiverButtonProps: ServerReceiverButtonProps;
  let shouldShowServerReceiverChooser = true;
  if (autoShowServerReceiverChooser) {
    serverReceiverButtonProps = {
      serverReceiverButtonEnabled: matchState.canResetServerReceiver,
      serverReceiverButtonClicked: () => {
        umpire.resetServerReceiver();
      },
      serverReceiverButtonAriaLabel: "Reset server and receiver",
    };
  } else {
    serverReceiverButtonProps = {
      serverReceiverButtonAriaLabel: "Set server and receiver",
      serverReceiverButtonEnabled:
        matchState.canResetServerReceiver || hasServerReceiverChoice,
      serverReceiverButtonClicked: () => {
        if (matchState.canResetServerReceiver) {
          umpire.resetServerReceiver();
        }
        setShowManualServerReceiverDialog(true);
      },
    };
    shouldShowServerReceiverChooser =
      hasFirstGameDoublesReceivers || showManualServerReceiverDialog;
  }

  return (
    <div style={{ userSelect: "none" }}>
      <EndsDialog
        isEnds={matchState.isEnds && !revertedPointRef.current}
        isDoubles={team1Player2Name !== undefined}
      />
      {shouldShowServerReceiverChooser && (
        <ServerReceiverChooser
          showTosser={
            serverReceiverChoice.servers.length > 0 &&
            matchState.completedGameScores.length === 0
          }
          availableReceivers={serverReceiverChoice.firstGameDoublesReceivers}
          availableServers={serverReceiverChoice.servers}
          chosenCallback={(player, isServer) => {
            if (showManualServerReceiverDialog) {
              setShowManualServerReceiverDialog(false);
            }
            if (isServer) {
              umpire.setServer(player);
            } else {
              umpire.setFirstGameDoublesReceiver(player);
            }
          }}
          team1Player1Name={team1Player1Name}
          team2Player1Name={team2Player1Name}
          team1Player2Name={team1Player2Name}
          team2Player2Name={team2Player2Name}
        />
      )}
      <Card variant="outlined">
        <Box p={1}>
          <MatchView
            serverReceiverTop={serverReceiverTop}
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
            receiverName={getNameOfServerReceiver(false)!}
            serverName={getNameOfServerReceiver(true)!}
            remainingServes={matchState.remainingServes}
            gamePointFontSize={80}
            setPointFontSize={40}
          />
          <UmpireToolbar
            canUndoPoint={matchState.canUndoPoint}
            undoPoint={() => {
              revertedPointRef.current = true;
              umpire.undoPoint();
            }}
            canScorePoint={canScorePoint}
            scorePoint={(isLeft) => {
              const isTeam1 = matchState.team1Left === isLeft;
              revertedPointRef.current = false;
              umpire.pointScored(isTeam1);
            }}
            {...serverReceiverButtonProps}
            rules={{
              bestOf: rules.bestOf,
              clearBy2: rules.clearBy2,
              upTo: rules.upTo,
              numServes: rules.numServes,
              team1EndsAt: rules.team1EndsAt,
              team2EndsAt: rules.team2EndsAt,
              team1Identifier: getTeamInitials(
                team1Player1Name,
                team1Player2Name,
              ),
              team2Identifier: getTeamInitials(
                team2Player1Name,
                team2Player2Name,
              ),
            }}
            switchEnds={() => {
              umpire.switchEnds();
            }}
          />
        </Box>
      </Card>
    </div>
  );
}
