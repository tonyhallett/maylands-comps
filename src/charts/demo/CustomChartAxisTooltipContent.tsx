import { ChartsAxisContentProps } from "@mui/x-charts/ChartsTooltip";
import { Score } from "./DemoScoringCharts";

interface CustomChartAxisTooltipContentData {
  score: Score | undefined;
}
export type AxisTooltipScoreRenderer = (
  props: ChartsAxisContentProps,
  score: Score,
) => JSX.Element;

interface CustomChartAxisTooltipContentPropsFromSlots {
  getData: (dataIndex: number) => CustomChartAxisTooltipContentData;
  renderer: AxisTooltipScoreRenderer;
}
interface CustomChartAxisTooltipContentProps
  extends ChartsAxisContentProps,
    CustomChartAxisTooltipContentPropsFromSlots {}
export interface CustomChartAxisTooltipContentSlotProps
  extends CustomChartAxisTooltipContentPropsFromSlots,
    Partial<ChartsAxisContentProps> {}
export function CustomChartAxisTooltipContent(
  props: CustomChartAxisTooltipContentProps,
) {
  const { renderer, ...other } = props;
  const data = props.getData(props.dataIndex);
  if (data.score === undefined) return null;
  return renderer(other, data.score);
}
