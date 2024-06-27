import Box from "@mui/material/Box/Box";
import Button from "@mui/material/Button/Button";
import { ShowMarkParams } from "@mui/x-charts";
import { useRef, useState } from "react";
import { SmarterLineChart } from "./SmarterLineChart";
import { ParallelXAxisLine } from "../demoUmpire/ParallelXAxisLine";
import { SmarterMarkElementSlotProps } from "./SmarterMarkElement";
import { fillArrayWithIndices } from "../demoUmpire/fillArray";
import { FormControlLabel, Switch } from "@mui/material";
import {
  SeriesValueFormatter,
  SeriesValueFormatterContext,
} from "@mui/x-charts/internals";

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
        return "star";
      }
    },
  };

  const atOrPastGamePoint =
    scoreRef.current.team1 >= 10 || scoreRef.current.team2 >= 10;

  const toolTipSeriesValueFormatter: SeriesValueFormatter<number> = (
    value: number,
    dataIndex: SeriesValueFormatterContext,
  ) => {
    dataIndex.dataIndex;
    const score = chartScores[dataIndex.dataIndex];
    return `${score.team1} - ${score.team2}`;
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
          slotProps={{
            mark: smarterMarkElementProps,
          }}
          tooltip={{
            trigger: "item",
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
              valueFormatter: toolTipSeriesValueFormatter,
              label(location) {
                if (location === "legend") {
                  return "Team 1";
                }
                return "Team 1 Won Point";
              },
            },
            {
              id: "Team2",
              data: chartScores.map((score) =>
                score === undefined ? undefined : score.team2,
              ),
              label(location) {
                if (location === "legend") {
                  return "Team 2";
                }
                return "Team 2 Won Point";
              },
              curve: "linear",
              showMark(showMarkParams) {
                return showMarkIfScored(false, showMarkParams);
              },
              valueFormatter: toolTipSeriesValueFormatter,
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
