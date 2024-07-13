import { TeamScore } from "../../umpire";
import { TeamView } from "../team/TeamView";
import { MatchScore, PointState } from "./score/MatchScore";
import { Box } from "@mui/material";
import { TeamPointsFontSizes } from "./score/TeamPoints";

export enum LeftRightMatchWinState {
  NotWon = 0,
  LeftWon = 1,
  RightWon = 2,
  GamePointLeft = 4,
  GamePointRight = 8,
  MatchPointLeft = 16,
  MatchPointRight = 32,
}

interface ServerReceiverInfo {
  remainingServes: number;
  serverName: string;
  receiverName: string;
}

export type MatchViewProps = {
  leftScore: TeamScore;
  rightScore: TeamScore;
  leftPlayer1Name: string;
  leftPlayer2Name: string | undefined;
  rightPlayer1Name: string;
  rightPlayer2Name: string | undefined;
  matchWinState: LeftRightMatchWinState;
  serverName: string;
  receiverName: string;
  remainingServes: number;
} & ServerReceiverInfo &
  TeamPointsFontSizes;

function getPointState(
  leftRightMatchWinState: LeftRightMatchWinState,
  isLeft: boolean,
): PointState {
  if (leftRightMatchWinState === LeftRightMatchWinState.NotWon) {
    return PointState.Normal;
  }
  if (isLeft) {
    if (leftRightMatchWinState === LeftRightMatchWinState.LeftWon) {
      return PointState.Won;
    }
    if (leftRightMatchWinState & LeftRightMatchWinState.MatchPointLeft) {
      return PointState.MatchPoint;
    }
    if (leftRightMatchWinState & LeftRightMatchWinState.GamePointLeft) {
      return PointState.GamePoint;
    }
  } else {
    if (leftRightMatchWinState === LeftRightMatchWinState.RightWon) {
      return PointState.Won;
    }
    if (leftRightMatchWinState & LeftRightMatchWinState.MatchPointRight) {
      return PointState.MatchPoint;
    }
    if (leftRightMatchWinState & LeftRightMatchWinState.GamePointRight) {
      return PointState.GamePoint;
    }
  }
  return PointState.Normal;
}

// eslint-disable-next-line no-empty-pattern
export function MatchView({
  leftPlayer1Name,
  leftPlayer2Name,
  rightPlayer1Name,
  rightPlayer2Name,
  remainingServes,
  serverName,
  receiverName,
  leftScore,
  rightScore,
  matchWinState,
  gamePointFontSize,
  setPointFontSize,
}: MatchViewProps) {
  const leftPointState = getPointState(matchWinState, true);
  const rightPointState = getPointState(matchWinState, false);
  const serverReceiverInfo: ServerReceiverInfo = {
    remainingServes,
    serverName,
    receiverName,
  };
  return (
    <>
      <MatchScore
        leftScore={leftScore}
        rightScore={rightScore}
        leftPointState={leftPointState}
        rightPointState={rightPointState}
        gamePointFontSize={gamePointFontSize}
        setPointFontSize={setPointFontSize}
      />
      <Box mt={1} sx={{ width: "100%" }}>
        <div
          style={{
            display: "inline-block",
            width: "50%",
          }}
        >
          <TeamView
            player1={{
              prefix: getPlayerServerReceiverAffix({
                ...serverReceiverInfo,
                playerName: leftPlayer1Name,
              }),
              name: leftPlayer1Name,
            }}
            player2={
              leftPlayer2Name
                ? {
                    name: leftPlayer2Name,
                    prefix: getPlayerServerReceiverAffix({
                      ...serverReceiverInfo,
                      playerName: leftPlayer2Name,
                    }),
                  }
                : undefined
            }
          />
        </div>

        <div
          style={{
            display: "inline-block",
            width: "50%",
          }}
        >
          <TeamView
            player1={{
              prefix: getPlayerServerReceiverAffix({
                ...serverReceiverInfo,
                playerName: rightPlayer1Name,
              }),
              name: rightPlayer1Name,
            }}
            player2={
              rightPlayer2Name
                ? {
                    name: rightPlayer2Name,
                    prefix: getPlayerServerReceiverAffix({
                      ...serverReceiverInfo,
                      playerName: rightPlayer2Name,
                    }),
                  }
                : undefined
            }
          />
        </div>
      </Box>
    </>
  );
}

function getPlayerServerReceiverAffix({
  playerName,
  receiverName,
  serverName,
  remainingServes,
}: {
  playerName: string;
} & ServerReceiverInfo) {
  let affix = "";
  if (playerName === serverName) {
    affix = `(${remainingServes})`;
  } else if (playerName === receiverName) {
    affix = `(R)`;
  }
  return affix;
}
