import Box from "@mui/material/Box/Box";
import Button from "@mui/material/Button/Button";
import {
  MarkElementProps,
  ShowMarkParams,
  mangoFusionPalette,
} from "@mui/x-charts";
import { useRef, useState } from "react";
import { SmarterLineChart, SmarterLineChartProps } from "../SmarterLineChart";
import { SmarterMarkElementSlotProps } from "../SmarterMarkElement";
import { fillArrayWithIndices } from "../../helpers/fillArray";
import { FormControlLabel, Switch } from "@mui/material";
import {
  AxisTooltipScoreRenderer,
  CustomChartAxisTooltipContent,
  CustomChartAxisTooltipContentSlotProps,
} from "./CustomChartAxisTooltipContent";
import { GamePointLine, GamePointLineProps } from "./GamePointLine";
import { demoScoreTooltipRenderer } from "./demoScoreTooltipRenderer";

enum ScoreState {
  Normal = 0,
  GamePointSaved = 1,
  GamePointTeam1 = 2,
  GamePointTeam2 = 4,
  GameWon = 8,
}
export interface Points {
  team1: number;
  team2: number;
}
export interface Score extends Points {
  winnerTeam1?: boolean;
  scoreState: ScoreState;
}

function hasNotScoredMinY(scores: Score[], amount: number) {
  if (scores.length === 0) return true;
  const lastScore = scores[scores.length - 1];
  return lastScore.team1 < amount && lastScore.team2 < amount;
}

const startScore: Points = {
  team1: 0,
  team2: 4,
};
const getScoreState = (points: Points): ScoreState => {
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

export default function DemoScoringCharts() {
  const [reversed, setReversed] = useState(true);
  const scoreRef = useRef<Score>({
    ...startScore,
    scoreState: ScoreState.Normal,
  });
  const [scores, setScores] = useState<Score[]>([]);

  function pointScored(team1: boolean) {
    const score = scoreRef.current;
    const newPoints: Points = team1
      ? { team1: score.team1 + 1, team2: score.team2 }
      : { team1: score.team1, team2: score.team2 + 1 };
    const newScore: Score = {
      ...newPoints,
      scoreState: getScoreState(newPoints),
      winnerTeam1: team1,
    };

    if (scores.length === 0) {
      setScores([newScore]);
    } else {
      setScores([...scores, newScore]);
    }

    scoreRef.current = newScore;
  }
  return (
    <>
      <FormControlLabel
        control={
          <Switch checked={reversed} onChange={() => setReversed(!reversed)} />
        }
        label="Reverse"
      />
      <Button onClick={() => pointScored(true)}>Team 1</Button>
      <Button onClick={() => pointScored(false)}>Team 2</Button>

      <Box sx={{ width: "100%", height: 400 }}>
        <GameScoreLineChart
          grid={{ horizontal: true, vertical: false }}
          colors={mangoFusionPalette}
          reversed={reversed}
          xAxisLabel="Points scored"
          yAxisLabel="Game points"
          team1Label="Team 1"
          team2Label="Team 2"
          gamePoint={10}
          minY={9}
          minX={11}
          mark={{
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            getColor(team1, score, isStartScore) {
              switch (score.scoreState) {
                case ScoreState.GamePointTeam1:
                case ScoreState.GamePointTeam2:
                  return "red";
              }
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            getShape(team1, score, isStartScore) {
              if (score.scoreState === ScoreState.GameWon) {
                return "wye";
              }
            },
            showMark(team1, score, isStartScore) {
              if (isStartScore) {
                return false;
              }
              return score.winnerTeam1 === team1;
            },
          }}
          scores={scores}
          startScore={startScore}
          axisTooltipRenderer={demoScoreTooltipRenderer}
        />
      </Box>
    </>
  );
}

type ChartGamePointLineProps = Omit<
  GamePointLineProps,
  "gamePoint" | "team1" | "team2"
>;
type GameScoreLineChartProps<T extends Score = Score> = Omit<
  SmarterLineChartProps,
  "series"
> & {
  reversed: boolean;
  xAxisLabel: string;
  yAxisLabel: string;
  team1Label: string;
  team2Label: string;
  minY: number;
  minX: number;
  gamePoint: number;
  showGamePointLine?: boolean;
  gamePointLineProps?: ChartGamePointLineProps;
  mark: MarkProps<T>;
  scores: T[];
  startScore: Points;
  axisTooltipRenderer?: AxisTooltipScoreRenderer;
};

interface MarkProps<T> {
  getColor(team1: boolean, score: T, isStartScore): MarkElementProps["color"];
  getShape(team1: boolean, score: T, isStartScore): MarkElementProps["shape"];
  showMark(team1: boolean, score: Score, isStartScore): boolean;
}

const team1SeriesId = "Team1";
const team2SeriesId = "Team2";
function GameScoreLineChart(props: GameScoreLineChartProps) {
  const currentScore = props.scores[props.scores.length - 1];
  let showGamePointLine = props.showGamePointLine ?? true;
  const scoresWithStartScore: Score[] = [
    { ...props.startScore, scoreState: ScoreState.Normal },
    ...props.scores,
  ];
  const chartScores = getAtLeastMinScores(scoresWithStartScore, props.minX);
  const chartGamePointLineProps: ChartGamePointLineProps =
    props.gamePointLineProps ?? {
      beforeGamePointProps: { stroke: "white" },
      atOrPastGamePointProps: { stroke: "red" },
      commonGamePointProps: { strokeWidth: 1, strokeDasharray: "5 15" },
    };

  //#region marks
  function showMarkIfScored(
    team1: boolean,
    showMarkParams: ShowMarkParams,
  ): boolean {
    const score = chartScores[showMarkParams.index];
    return props.mark.showMark(team1, score, showMarkParams.index === 0);
  }

  const smarterMarkElementProps: SmarterMarkElementSlotProps = {
    getColor(seriesId, dataIndex) {
      const isTeam1 = seriesId === team1SeriesId;
      const chartScore = chartScores[dataIndex];
      return props.mark.getColor(isTeam1, chartScore, dataIndex === 0);
    },
    getShape(seriesId, dataIndex) {
      const isTeam1 = seriesId === team1SeriesId;
      const chartScore = chartScores[dataIndex];
      return props.mark.getShape(isTeam1, chartScore, dataIndex === 0);
    },
  };
  //#endregion

  const customChartAxisTooltipContentSlotProps: CustomChartAxisTooltipContentSlotProps =
    {
      getData(dataIndex) {
        return {
          score: chartScores[dataIndex],
        };
      },
      renderer(rendererProps, score) {
        return props.axisTooltipRenderer!(rendererProps, score);
      },
    };

  const getYAxisTickTextGamePoint = (value: number) => {
    let gamePointValue = props.gamePoint;
    if (currentScore !== undefined) {
      const currentScoreState = currentScore.scoreState;
      const atGamePoint =
        currentScoreState == ScoreState.GamePointTeam1 ||
        currentScoreState == ScoreState.GamePointTeam2;
      if (atGamePoint) {
        gamePointValue = Math.max(currentScore.team1, currentScore.team2);
      }
    }
    if (value === gamePointValue) {
      return "GP";
    }
    return value.toString();
  };

  const yAxis: SmarterLineChartProps["yAxis"][number] = {
    label: props.yAxisLabel,
    tickMaxStep: 1,
    valueFormatter(value, context) {
      if (context.location === "tooltip") return undefined;
      return getYAxisTickTextGamePoint(value);
    },
  };

  let sufficientGamePointY: boolean;
  if (hasNotScoredMinY(props.scores, props.minY)) {
    yAxis.max = props.minY;
    sufficientGamePointY = yAxis.max >= props.gamePoint;
  } else {
    const maxY = Math.max(currentScore.team1, currentScore.team2);
    sufficientGamePointY = maxY >= props.gamePoint;
  }
  showGamePointLine = showGamePointLine && sufficientGamePointY;
  const toolTipProps: SmarterLineChartProps["tooltip"] = {
    ...props.tooltip,
  };
  const slots = props.slots ?? {};
  const slotProps: SmarterLineChartProps["slotProps"] = {
    ...props.slotProps,
    mark: smarterMarkElementProps,
  };
  if (props.axisTooltipRenderer !== undefined) {
    slots.axisContent = CustomChartAxisTooltipContent;
    slotProps.axisContent = customChartAxisTooltipContentSlotProps;
    toolTipProps.trigger = "axis";
  }
  return (
    <SmarterLineChart
      grid={props.grid}
      colors={props.colors}
      slots={slots}
      slotProps={slotProps}
      tooltip={toolTipProps}
      yAxis={[yAxis]}
      xAxis={[
        {
          id: "x-axis",
          scaleType: "point",
          data: fillArrayWithIndices(chartScores.length),
          label: props.xAxisLabel,
          reverse: props.reversed,
        },
      ]}
      series={[
        {
          id: team1SeriesId,
          data: chartScores.map((score) =>
            score === undefined ? undefined : score.team1,
          ),
          curve: "linear",
          showMark(showMarkParams) {
            return showMarkIfScored(true, showMarkParams);
          },

          label: props.team1Label,
        },
        {
          id: team2SeriesId,
          data: chartScores.map((score) =>
            score === undefined ? undefined : score.team2,
          ),
          label: props.team2Label,
          curve: "linear",
          showMark(showMarkParams) {
            return showMarkIfScored(false, showMarkParams);
          },
        },
      ]}
    >
      {showGamePointLine && (
        <GamePointLine
          gamePoint={props.gamePoint}
          team1={currentScore?.team1 ?? 0}
          team2={currentScore?.team2 ?? 0}
          {...chartGamePointLineProps}
        />
      )}
      {props.children}
    </SmarterLineChart>
  );
}

function getAtLeastMinScores(
  scores: Score[],
  min: number,
): (Score | undefined)[] {
  if (scores.length >= min + 1) return scores;
  scores = [...scores];
  while (scores.length < min + 1) {
    scores.push(undefined);
  }
  return scores;
}
