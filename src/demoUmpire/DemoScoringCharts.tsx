import Button from "@mui/material/Button/Button";
import { LineChart } from "@mui/x-charts/LineChart";
import { useState } from "react";

interface Score {
  team1: number;
  team2: number;
}
export default function DemoScoringCharts() {
  const [score, setScore] = useState<Score>({ team1: 0, team2: 0 });
  const [scores, setScores] = useState<Score[]>([]);

  // will want to mark server / receiver ?
  function pointScored(team1: boolean) {
    const newScore = team1
      ? { team1: score.team1 + 1, team2: score.team2 }
      : { team1: score.team1, team2: score.team2 + 1 };
    setScore(newScore);
    setScores([...scores, newScore]);
  }
  return (
    <div>
      <Button onClick={() => pointScored(true)}>Team 1</Button>
      <Button onClick={() => [pointScored(false)]}>Team 2</Button>
      <LineChart
        width={600}
        height={400}
        series={[
          { data: scores.map((score) => score.team1) },
          { data: scores.map((score) => score.team2) },
        ]}
      />
    </div>
  );
}
