import Box from "@mui/material/Box/Box";
import Button from "@mui/material/Button/Button";
import { mangoFusionPalette } from "@mui/x-charts";
import { useRef, useState } from "react";
import { FormControlLabel, Switch } from "@mui/material";
import { demoScoreTooltipRenderer } from "./demoScoreTooltipRenderer";
import { GameScore, GameScoreState, PointState } from "../../umpire";
import { GameScoreLineChart } from "./GameScoreLineChart";
import {
  isGameOrMatchPoint,
  isGamePoint,
  isMatchPoint,
} from "../../umpire/pointStateHelpers";

const startScore: GameScore = {
  team1Points: 0,
  team2Points: 4,
};

const getScoreState = (points: GameScore): PointState => {
  const pointsDifference = Math.abs(points.team1Points - points.team2Points);
  if (
    pointsDifference >= 2 &&
    (points.team1Points >= 11 || points.team2Points >= 11)
  ) {
    return PointState.GameWonTeam1;
  }
  if (
    pointsDifference !== 0 &&
    (points.team1Points >= 10 || points.team2Points >= 10)
  ) {
    return points.team1Points > points.team2Points
      ? PointState.GamePointTeam1
      : PointState.GamePointTeam2;
  }

  return PointState.NotWon;
};

export default function DemoScoringCharts() {
  const [reversed, setReversed] = useState(true);
  const scoreRef = useRef<GameScoreState>({
    ...startScore,
    pointState: PointState.NotWon,
    team1WonPoint: true,
  });
  const [scores, setScores] = useState<GameScoreState[]>([]);

  function pointScored(team1: boolean) {
    const score = scoreRef.current;
    const newPoints: GameScore = team1
      ? { team1Points: score.team1Points + 1, team2Points: score.team2Points }
      : { team1Points: score.team1Points, team2Points: score.team2Points + 1 };
    const newScore: GameScoreState = {
      ...newPoints,
      pointState: getScoreState(newPoints),
      team1WonPoint: team1,
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
              if (isGamePoint(score.pointState)) {
                return "orange";
              } else if (isMatchPoint(score.pointState)) {
                return "red";
              }
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            getShape(team1, score, isStartScore) {
              if (isGameOrMatchPoint(score.pointState)) {
                return "wye";
              }
            },
            showMark(team1, score, isStartScore) {
              if (isStartScore) {
                return false;
              }
              return score.team1WonPoint === team1;
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
