import { TableCell } from "@mui/material";
import { GameScoreModel, PointsInfo } from "../model/getGameScoresModel";
import { getGameScorePointStateColor } from "./getGameScorePointStateColor";

export const getGameScoreCell = (
  gameScoreDisplay: GameScoreModel,
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
    <TableCell align="right" style={{ minWidth: "2em" }} padding="none" key={i}>
      <table>
        <tbody>
          {getGameRow(gameScoreDisplay.home)}
          {getGameRow(gameScoreDisplay.away)}
        </tbody>
      </table>
    </TableCell>
  );
};
