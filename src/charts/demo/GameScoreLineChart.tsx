import { MarkElementProps, ShowMarkParams } from "@mui/x-charts";
import { fillArrayWithIndices } from "../../helpers/fillArray";
import { GameScore, GameScoreState, PointState } from "../../umpire";
import { SmarterLineChartProps, SmarterLineChart } from "../SmarterLineChart";
import { SmarterMarkElementSlotProps } from "../SmarterMarkElement";
import {
  CustomChartAxisTooltipContentSlotProps,
  CustomChartAxisTooltipContent,
  AxisTooltipScoreRenderer,
} from "./CustomChartAxisTooltipContent";
import { GamePointLine, GamePointLineProps } from "./GamePointLine";
import { isGameOrMatchPoint } from "../../umpire/pointStateHelpers";

export function hasNotScoredMinY(scores: GameScoreState[], amount: number) {
  if (scores.length === 0) return true;
  const lastScore = scores[scores.length - 1];
  return lastScore.team1Points < amount && lastScore.team2Points < amount;
}

export function getAtLeastMinScores(
  scores: GameScoreState[],
  min: number,
): (GameScoreState | undefined)[] {
  if (scores.length >= min + 1) return scores;
  scores = [...scores];
  while (scores.length < min + 1) {
    scores.push(undefined);
  }
  return scores;
}

export type ChartGamePointLineProps = Omit<
  GamePointLineProps,
  "gamePoint" | "team1Points" | "team2Points"
>;
export type GameScoreLineChartProps<T extends GameScoreState = GameScoreState> =
  Omit<SmarterLineChartProps, "series"> & {
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
    startScore: GameScore;
    axisTooltipRenderer?: AxisTooltipScoreRenderer;
  };

interface MarkProps<T> {
  getColor(team1: boolean, score: T, isStartScore): MarkElementProps["color"];
  getShape(team1: boolean, score: T, isStartScore): MarkElementProps["shape"];
  showMark(team1: boolean, score: T, isStartScore): boolean;
}

export const team1SeriesId = "Team1";
export const team2SeriesId = "Team2";

export function GameScoreLineChart(props: GameScoreLineChartProps) {
  const currentScore = props.scores[props.scores.length - 1];
  let showGamePointLine = props.showGamePointLine ?? true;
  const scoresWithStartScore: GameScoreState[] = [
    { ...props.startScore, pointState: PointState.NotWon, team1WonPoint: true },
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
      const currentScoreState = currentScore.pointState;
      const atGamePoint = isGameOrMatchPoint(currentScoreState);
      if (atGamePoint) {
        gamePointValue = Math.max(
          currentScore.team1Points,
          currentScore.team2Points,
        );
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
    const maxY = Math.max(currentScore.team1Points, currentScore.team2Points);
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
            score === undefined ? undefined : score.team1Points,
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
            score === undefined ? undefined : score.team2Points,
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
          team1Points={currentScore?.team1Points ?? 0}
          team2Points={currentScore?.team2Points ?? 0}
          {...chartGamePointLineProps}
        />
      )}
      {props.children}
    </SmarterLineChart>
  );
}