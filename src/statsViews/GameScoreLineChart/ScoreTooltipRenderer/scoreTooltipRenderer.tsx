import Typography from "@mui/material/Typography/Typography";
import Box from "@mui/material/Box/Box";
import { ChartsAxisContentProps } from "@mui/x-charts/ChartsTooltip";
import { GameScoreState } from "../../../umpire";
import { ChartsTooltipPaper } from "./ChartsTooltipPaper";

export function scoreTooltipRenderer(
  { series }: ChartsAxisContentProps,
  score: GameScoreState,
) {
  // know team1 is first
  const colors = series.map((series) => series.color);
  return (
    <Box p={1}>
      <ChartsTooltipPaper>
        <Typography display="inline" color={colors[0]}>
          {score.team1Points}
        </Typography>
        <Typography display="inline"> - </Typography>
        <Typography display="inline" color={colors[1]}>
          {score.team2Points}
        </Typography>
      </ChartsTooltipPaper>
    </Box>
  );
}
