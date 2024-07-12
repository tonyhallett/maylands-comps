import Typography from "@mui/material/Typography/Typography";
import { ChartsTooltipPaper } from "./ChartsTooltipPaper";
import Box from "@mui/material/Box/Box";
import { ChartsAxisContentProps } from "@mui/x-charts/ChartsTooltip";
import { Score } from "./DemoScoringCharts";

export function demoScoreTooltipRenderer(
  { series, classes, sx }: ChartsAxisContentProps,
  score: Score,
) {
  // know team1 is first
  const colors = series.map((series) => series.color);
  return (
    <Box p={1}>
      <ChartsTooltipPaper sx={sx} className={classes.root}>
        <Typography display="inline" color={colors[0]}>
          {score.team1}
        </Typography>
        <Typography display="inline"> - </Typography>
        <Typography display="inline" color={colors[1]}>
          {score.team2}
        </Typography>
      </ChartsTooltipPaper>
    </Box>
  );
}
