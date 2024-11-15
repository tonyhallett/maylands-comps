import { useXScale, useYScale } from "@mui/x-charts";
import { SVGAttributes } from "react";

export type ParallelXAxisLineProps = Omit<
  SVGAttributes<SVGLineElement>,
  "x1" | "x2" | "y1" | "y2"
> & {
  y: number;
};

export function ParallelXAxisLine({ y, ...other }: ParallelXAxisLineProps) {
  const xAxisScale = useXScale<"point">();
  const xLeft = xAxisScale.range()[0];
  const xRight = xAxisScale.range()[1];
  const yAxis = useYScale<"point">();
  const outputY = yAxis(y);
  return <line x1={xLeft} x2={xRight} y1={outputY} y2={outputY} {...other} />;
}
