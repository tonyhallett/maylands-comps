import { LeftRightMatchWinState, MatchView } from "./match/MatchView";
import { MatchState, Player } from "../umpire";
import {
  MatchWinState,
  isGamePointTeam1,
  isGamePointTeam2,
  isMatchPointTeam1,
  isMatchPointTeam2,
} from "../umpire/matchWinState";

export function getLeftMatchWinState(
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

export function getServerReceiverName(
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

export interface MatchStateViewProps {
  serverReceiverTop: boolean;
  team1Player1Name: string;
  team2Player1Name: string;
  team1Player2Name: string | undefined;
  team2Player2Name: string | undefined;
  matchState: MatchState;
}

export function MatchStateView({
  matchState,
  serverReceiverTop,
  team1Player1Name,
  team2Player1Name,
  team1Player2Name,
  team2Player2Name,
}: MatchStateViewProps) {
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
        matchState.team1Left ? matchState.team1Score : matchState.team2Score
      }
      rightScore={
        !matchState.team1Left ? matchState.team1Score : matchState.team2Score
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
  );
}
