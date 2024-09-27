import { TableCell } from "@mui/material";
import { GameScoreModel, PointsInfo } from "../model/getGameScoresModel";
import { getGameScorePointStateColor } from "./getGameScorePointStateColor";

export const getGameScoreCellAriaLabel = (index: number) =>
  `Game ${index + 1} score cell`;
export const getGameScoreCellTeamAriaLabel = (isHome: boolean) =>
  isHome ? "Home team game score" : "Away team game score";
export const getGameScoreCell = (
  gameScoreDisplay: GameScoreModel,
  i: number,
) => {
  const getGameRow = (pointsInfo: PointsInfo, isHome: boolean) => {
    const color = getGameScorePointStateColor(pointsInfo.state);
    return (
      <tr>
        <td
          aria-label={getGameScoreCellTeamAriaLabel(isHome)}
          style={{ color }}
        >
          {pointsInfo.display}
        </td>
      </tr>
    );
  };
  return (
    <TableCell
      aria-label={getGameScoreCellAriaLabel(i)}
      align="right"
      style={{ minWidth: "2em" }}
      padding="none"
      key={i}
    >
      <table>
        <tbody>
          {getGameRow(gameScoreDisplay.home, true)}
          {getGameRow(gameScoreDisplay.away, false)}
        </tbody>
      </table>
    </TableCell>
  );
};
