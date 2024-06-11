import { TeamScore } from "../umpire";

export enum LeftRightMatchWinState {
  NotWon = 0,
  LeftWon = 1,
  RightWon = 2,
  GamePointLeft = 4,
  GamePointRight = 8,
  MatchPointLeft = 16,
  MatchPointRight = 32,
}
export interface UmpireViewProps {
  leftScore: TeamScore;
  rightScore: TeamScore;
  leftPlayer1Name: string;
  leftPlayer2Name: string | undefined;
  rightPlayer1Name: string;
  rightPlayer2Name: string | undefined;
  matchWinState: LeftRightMatchWinState;
  canScorePoint: boolean;
  serverName: string;
  receiverName: string;
  remainingServes: number;
  scorePoint: (isLeft: boolean) => void;
}

enum PointState {
  Normal,
  GamePoint,
  MatchPoint,
  Won,
}

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
export function UmpireView({
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
  canScorePoint,
  scorePoint,
}: UmpireViewProps) {
  const leftPointState = getPointState(matchWinState, true);
  const rightPointState = getPointState(matchWinState, false);
  return (
    <table>
      <thead>
        <tr>
          <th>
            <button disabled={!canScorePoint} onClick={() => scorePoint(true)}>
              +
            </button>
          </th>
          <th>
            <GamePoint
              point={leftScore.pointsWon}
              pointState={leftPointState}
            />
            <SetPoint point={leftScore.gamesWon} pointState={leftPointState} />
          </th>
          <th>
            <SetPoint
              point={rightScore.gamesWon}
              pointState={rightPointState}
            />
            <GamePoint
              point={rightScore.pointsWon}
              pointState={rightPointState}
            />
          </th>
          <th>
            <button disabled={!canScorePoint} onClick={() => scorePoint(false)}>
              +
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <PlayerServiceInfo
              playerName={leftPlayer1Name}
              remainingServes={remainingServes}
              receiverName={receiverName}
              serverName={serverName}
            />
          </td>
          <td>{leftPlayer1Name}</td>

          <td>{rightPlayer1Name}</td>
          <td>
            <PlayerServiceInfo
              playerName={rightPlayer1Name}
              remainingServes={remainingServes}
              receiverName={receiverName}
              serverName={serverName}
            />
          </td>
        </tr>
        {leftPlayer2Name !== undefined && (
          <tr>
            <td>
              <PlayerServiceInfo
                playerName={leftPlayer2Name}
                remainingServes={remainingServes}
                receiverName={receiverName}
                serverName={serverName}
              />
            </td>
            <td>{leftPlayer2Name}</td>

            <td>{rightPlayer2Name}</td>
            <td>
              <PlayerServiceInfo
                playerName={rightPlayer2Name}
                remainingServes={remainingServes}
                receiverName={receiverName}
                serverName={serverName}
              />
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

function PlayerServiceInfo({
  playerName,
  receiverName,
  serverName,
  remainingServes,
}: {
  playerName: string;
  remainingServes: number;
  serverName: string;
  receiverName: string;
}) {
  let suffix = "";
  if (playerName === serverName) {
    suffix = `(${remainingServes})`;
  } else if (playerName === receiverName) {
    suffix = `(R)`;
  }
  return suffix;
}

function SetPoint({
  point,
  pointState,
}: {
  point: number;
  pointState: PointState;
}) {
  return (
    <span
      style={{
        fontSize: 16,
        fontStyle: pointState === PointState.Won ? "italic" : "normal",
        textDecoration:
          pointState === PointState.MatchPoint ? "underline" : undefined,
      }}
    >
      {point}
    </span>
  );
}
function GamePoint({
  point,
  pointState,
}: {
  point: number;
  pointState: PointState;
}) {
  return (
    <span
      style={{
        fontSize: 30,
        fontStyle: pointState === PointState.Won ? "italic" : "normal",
        textDecoration:
          pointState === PointState.MatchPoint ||
          pointState === PointState.GamePoint
            ? "underline"
            : undefined,
      }}
    >
      {point}
    </span>
  );
}
