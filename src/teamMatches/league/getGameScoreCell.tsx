import { TableCell } from "@mui/material";
import { GameScoreDisplay, PointsInfo } from "./getGameScoresDisplay";
import { getGameScorePointStateColor } from "./getGameScorePointStateColor";

export const getGameScoreCell = (
  gameScoreDisplay: GameScoreDisplay,
  i: number,
) => {
  const getGameRow = (pointsInfo: PointsInfo) => {
    const color = getGameScorePointStateColor(pointsInfo.state);
    return (
      <tr>
        <td style={{ color }}>{pointsInfo.display}</td>
      </tr>
    );
  };
  return (
    <TableCell padding="none" key={i}>
      <table>
        <tbody>
          {getGameRow(gameScoreDisplay.home)}
          {getGameRow(gameScoreDisplay.away)}
        </tbody>
      </table>
    </TableCell>
  );
};
