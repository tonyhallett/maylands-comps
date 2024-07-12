import {
  ParallelXAxisLine,
  ParallelXAxisLineProps,
} from "../ParallelXAxisLine";
import { Points } from "./DemoScoringCharts";

type ParallelXAxisLinePropsNoY = Omit<ParallelXAxisLineProps, "y">;
export interface GamePointLineProps extends Points {
  gamePoint: number;
  atOrPastGamePointProps: ParallelXAxisLinePropsNoY;
  beforeGamePointProps: ParallelXAxisLinePropsNoY;
  commonGamePointProps: ParallelXAxisLinePropsNoY;
}

export function GamePointLine({
  gamePoint,
  team1,
  team2,
  beforeGamePointProps,
  atOrPastGamePointProps,
  commonGamePointProps,
}: GamePointLineProps) {
  const atOrPastGamePoint = team1 >= gamePoint || team2 >= gamePoint;
  const otherProps = atOrPastGamePoint
    ? atOrPastGamePointProps
    : beforeGamePointProps;
  return (
    <ParallelXAxisLine
      y={gamePoint}
      {...otherProps}
      {...commonGamePointProps}
    />
  );
}
