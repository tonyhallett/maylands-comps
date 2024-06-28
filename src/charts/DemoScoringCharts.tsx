import Box from "@mui/material/Box/Box";
import Button from "@mui/material/Button/Button";
import {
  ChartsAxisContentProps,
  ShowMarkParams,
  mangoFusionPalette,
} from "@mui/x-charts";
import { useRef, useState } from "react";
import { SmarterLineChart } from "./SmarterLineChart";
import { ParallelXAxisLine } from "../demoUmpire/ParallelXAxisLine";
import { SmarterMarkElementSlotProps } from "./SmarterMarkElement";
import { fillArrayWithIndices } from "../demoUmpire/fillArray";
import { FormControlLabel, Switch, Typography, styled } from "@mui/material";

export const ChartsTooltipPaper = styled("div", {
  name: "MuiChartsTooltip",
  slot: "Container",
})(({ theme }) => ({
  boxShadow: theme.shadows[1],
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  transition: theme.transitions.create("box-shadow"),
  borderRadius: theme.shape.borderRadius,
}));

enum ScoreState {
  Normal = 0,
  GamePointSaved = 1,
  GamePointTeam1 = 2,
  GamePointTeam2 = 4,
  GameWon = 8,
}
interface Points {
  team1: number;
  team2: number;
}
interface Score extends Points {
  winnerTeam1?: boolean;
  scoreState: ScoreState;
}

function HasNotScored11(scores: Score[]) {
  if (scores.length === 0) return true;
  const lastScore = scores[scores.length - 1];
  return lastScore.team1 < 11 && lastScore.team2 < 11;
}

const teamStartScores: Score = {
  team1: 0,
  team2: 4,
  scoreState: ScoreState.Normal,
};
const getScoreState = (
  points: Points,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  previousScoreState: ScoreState,
): ScoreState => {
  const pointsDifference = Math.abs(points.team1 - points.team2);
  if (pointsDifference >= 2 && (points.team1 >= 11 || points.team2 >= 11)) {
    return ScoreState.GameWon;
  }
  if (pointsDifference !== 0 && (points.team1 >= 10 || points.team2 >= 10)) {
    return points.team1 > points.team2
      ? ScoreState.GamePointTeam1
      : ScoreState.GamePointTeam2;
  }

  return ScoreState.Normal;
};

interface CustomChartAxisTooltipContentData {
  points: Points;
}
// remember that want to show nothing when undefined scores ( are nulls different )
interface CustomChartAxisTooltipContentPropsFromSlots {
  getData: (dataIndex: number) => CustomChartAxisTooltipContentData;
}
interface CustomChartAxisTooltipContentProps
  extends ChartsAxisContentProps,
    CustomChartAxisTooltipContentPropsFromSlots {}
interface CustomChartAxisTooltipContentSlotProps
  extends CustomChartAxisTooltipContentPropsFromSlots,
    Partial<ChartsAxisContentProps> {}
export function CustomChartAxisTooltipContent({
  series,
  dataIndex,
  getData,
  classes,
  sx,
}: CustomChartAxisTooltipContentProps) {
  const data = getData(dataIndex);
  if (data.points === undefined) return null;
  // know team1 is first
  const colors = series.map((series) => series.color);
  return (
    <Box p={1}>
      <ChartsTooltipPaper sx={sx} className={classes.root}>
        <Typography display="inline" color={colors[0]}>
          {data.points.team1}
        </Typography>
        <Typography display="inline"> - </Typography>
        <Typography display="inline" color={colors[1]}>
          {data.points.team2}
        </Typography>
      </ChartsTooltipPaper>
    </Box>
  );
}

export default function DemoScoringCharts() {
  const scoreRef = useRef<Score>(teamStartScores);
  const [scores, setScores] = useState<Score[]>([]);
  const [reversed, setReversed] = useState(true);
  // will want to mark server / receiver ?
  function pointScored(team1: boolean) {
    const score = scoreRef.current;
    const newPoints: Points = team1
      ? { team1: score.team1 + 1, team2: score.team2 }
      : { team1: score.team1, team2: score.team2 + 1 };
    const newScore: Score = {
      ...newPoints,
      scoreState: getScoreState(newPoints, score.scoreState),
      winnerTeam1: team1,
    };

    if (scores.length === 0) {
      setScores([score, newScore]);
    } else {
      setScores([...scores, newScore]);
    }

    scoreRef.current = newScore;
  }
  const chartScores = getAtLeast11Scores(scores);

  function showMarkIfScored(
    team1: boolean,
    showMarkParams: ShowMarkParams,
  ): boolean {
    if (showMarkParams.index === 0) return false;
    const score = chartScores[showMarkParams.index];
    return score.winnerTeam1 === team1;
  }

  const smarterMarkElementProps: SmarterMarkElementSlotProps = {
    getColor(seriesId, dataIndex) {
      const chartScore = chartScores[dataIndex];
      switch (chartScore.scoreState) {
        case ScoreState.GamePointTeam1:
        case ScoreState.GamePointTeam2:
          return "red"; // todo from the theme
      }
    },
    getShape(seriesId, dataIndex) {
      const chartScore = chartScores[dataIndex];
      if (chartScore.scoreState === ScoreState.GameWon) {
        return "wye";
      }
    },
  };

  const atOrPastGamePoint =
    scoreRef.current.team1 >= 10 || scoreRef.current.team2 >= 10;

  const customChartAxisTooltipContentSlotProps: CustomChartAxisTooltipContentSlotProps =
    {
      getData(dataIndex) {
        return {
          points: chartScores[dataIndex],
        };
      },
    };
  return (
    <div>
      <Button onClick={() => pointScored(true)}>Team 1</Button>
      <Button onClick={() => [pointScored(false)]}>Team 2</Button>
      <FormControlLabel
        control={
          <Switch checked={reversed} onChange={() => setReversed(!reversed)} />
        }
        label="Reverse"
      />
      <Box sx={{ width: "100%", height: 400 }}>
        <SmarterLineChart
          grid={{
            horizontal: true,
            vertical: false,
          }}
          colors={mangoFusionPalette}
          slots={{ axisContent: CustomChartAxisTooltipContent }}
          slotProps={{
            mark: smarterMarkElementProps,
            axisContent: customChartAxisTooltipContentSlotProps,
          }}
          tooltip={{
            trigger: "axis",
          }}
          yAxis={[
            HasNotScored11(scores)
              ? {
                  max: 11,
                  tickMaxStep: 1,
                  label: "Game points",
                  valueFormatter(value, context) {
                    if (context.location === "tooltip") return undefined;
                    const currentScore = scoreRef.current;
                    const bothAt10 =
                      currentScore.team1 === 10 && currentScore.team2 === 10;
                    const gpValue = bothAt10 ? 11 : 10;
                    if (value === gpValue) {
                      return "GP";
                    }
                    return value.toString();
                  },
                }
              : {
                  label: "Game points",
                  valueFormatter(value, context) {
                    if (context.location === "tooltip") return undefined;
                    const currentScoreState = scoreRef.current.scoreState;
                    const atGamePoint =
                      currentScoreState == ScoreState.GamePointTeam1 ||
                      currentScoreState == ScoreState.GamePointTeam2;
                    if (atGamePoint) {
                      const maxPoints = Math.max(
                        scoreRef.current.team1,
                        scoreRef.current.team2,
                      );
                      if (value === maxPoints) {
                        return "GP";
                      }
                    }
                    return value.toString();
                  },
                },
          ]}
          xAxis={[
            {
              id: "x-axis",
              scaleType: "point",
              data: fillArrayWithIndices(chartScores.length),
              label: "Points scored",
              reverse: reversed,
            },
          ]}
          series={[
            {
              id: "Team1",
              data: chartScores.map((score) =>
                score === undefined ? undefined : score.team1,
              ),
              curve: "linear",
              showMark(showMarkParams) {
                return showMarkIfScored(true, showMarkParams);
              },

              label: "Team 1",
            },
            {
              id: "Team2",
              data: chartScores.map((score) =>
                score === undefined ? undefined : score.team2,
              ),
              label: "Team 2",
              curve: "linear",
              showMark(showMarkParams) {
                return showMarkIfScored(false, showMarkParams);
              },
            },
          ]}
        >
          <ParallelXAxisLine
            y={10}
            stroke={atOrPastGamePoint ? "red" : "white"}
            strokeWidth={1}
            strokeDasharray={"5 15"}
          />
        </SmarterLineChart>
      </Box>
    </div>
  );
}

function getAtLeast11Scores(scores: Score[]) {
  if (scores.length >= 12) return scores;
  scores = [...scores];
  while (scores.length < 12) {
    scores.push(undefined);
  }
  return scores;
}
