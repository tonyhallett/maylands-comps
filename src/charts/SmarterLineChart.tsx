import {
  LineChart,
  LineChartProps,
  MarkElementProps,
} from "@mui/x-charts/LineChart";
import {
  SmarterMarkElement,
  SmarterMarkElementSlotProps,
} from "./SmarterMarkElement";

export type SmarterLineChartProps = Omit<
  LineChartProps,
  "slots" | "slotProps"
> & {
  slots?: Omit<LineChartProps["slots"], "mark">;
  slotProps?: Omit<LineChartProps["slotProps"], "mark"> & {
    mark: SmarterMarkElementSlotProps & Partial<MarkElementProps>;
  };
};

export function SmarterLineChart(props: SmarterLineChartProps) {
  const { slots, slotProps, ...rest } = props;
  const { mark, ...otherSlotProps } = slotProps;
  const markSlotProps = mark as unknown as Partial<MarkElementProps>;
  const lineChartProps: LineChartProps = {
    ...rest,
    slotProps: {
      ...otherSlotProps,
      mark: markSlotProps,
    },
    slots: {
      ...slots,
      mark: SmarterMarkElement,
    },
  };
  return <LineChart {...lineChartProps} />;
}
