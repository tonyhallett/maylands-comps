import { GameScore } from "../../umpire";
import {
  ParallelXAxisLine,
  ParallelXAxisLineProps,
} from "../../charts/ParallelXAxisLine";

type ParallelXAxisLinePropsNoY = Omit<ParallelXAxisLineProps, "y">;
export interface GamePointLineProps extends GameScore {
  gamePoint: number;
  atOrPastGamePointProps: ParallelXAxisLinePropsNoY;
  beforeGamePointProps: ParallelXAxisLinePropsNoY;
  commonGamePointProps: ParallelXAxisLinePropsNoY;
}

export function GamePointLine({
  gamePoint,
  team1Points,
  team2Points,
  beforeGamePointProps,
  atOrPastGamePointProps,
  commonGamePointProps,
}: GamePointLineProps) {
  const atOrPastGamePoint =
    team1Points >= gamePoint || team2Points >= gamePoint;
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
