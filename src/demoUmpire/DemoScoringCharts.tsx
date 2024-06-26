import Box from "@mui/material/Box/Box";
import Button from "@mui/material/Button/Button";
import { MarkElement, ShowMarkParams } from "@mui/x-charts";
import { LineChart, MarkElementProps } from "@mui/x-charts/LineChart";
import { useRef, useState } from "react";

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

interface SmarterMarkElementSlotProps {
  getColor?: (seriesId, dataIndex: number) => MarkElementProps["color"];
  getShape?: (seriesId, dataIndex: number) => MarkElementProps["shape"];
}
interface SmarterMarkElementProps
  extends MarkElementProps,
    SmarterMarkElementSlotProps {}
export function SmarterMarkElement(props: SmarterMarkElementProps) {
  const { getColor, getShape, ...rest } = props;
  const color = getColor?.(props.id, props.dataIndex) ?? props.color;
  const shape = getShape?.(props.id, props.dataIndex) ?? props.shape;

  return <MarkElement {...rest} color={color} shape={shape} />;
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
export default function DemoScoringCharts() {
  const scoreRef = useRef<Score>(teamStartScores);
  const [scores, setScores] = useState<Score[]>([
    /* { team1: 0, team2: 0 } */
  ]);

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
        return "star";
      }
    },
  };

  return (
    <div>
      <Button onClick={() => pointScored(true)}>Team 1</Button>
      <Button onClick={() => [pointScored(false)]}>Team 2</Button>
      <Box sx={{ width: "100%", height: 400 }}>
        <LineChart
          slots={{
            mark: SmarterMarkElement,
          }}
          slotProps={{
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            mark: smarterMarkElementProps as any,
          }}
          yAxis={
            HasNotScored11(scores)
              ? [
                  {
                    max: 11,
                    label: "Game points",
                  },
                ]
              : undefined
          }
          xAxis={[
            {
              id: "x-axis",
              scaleType: "point",
              data: fillArrayWithIndexes(chartScores.length),
              valueFormatter: () => "",
              disableTicks: true,
            },
          ]}
          series={[
            {
              data: chartScores.map((score) =>
                score === undefined ? undefined : score.team1,
              ),
              label: "Team 1",
              curve: "linear",
              showMark(showMarkParams) {
                return showMarkIfScored(true, showMarkParams);
              },
            },
            {
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
        />
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

function fillArrayWithIndexes(numItems: number) {
  return fillArray(numItems, (i) => i);
}

function fillArray<T>(
  numItems: number,
  valueProvider: (index: number) => T,
): T[] {
  return new Array(numItems).fill(0).map((_, i) => valueProvider(i));
}
