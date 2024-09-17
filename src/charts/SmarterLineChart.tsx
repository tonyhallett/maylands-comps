import {
  LineChart,
  LineChartProps,
  LineChartSlotProps,
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
  slots?: Omit<Exclude<LineChartProps["slots"], undefined>, "mark">;
  slotProps?: Omit<LineChartSlotProps, "mark"> & {
    mark: SmarterMarkElementSlotProps & Partial<MarkElementProps>;
  };
};

export function SmarterLineChart(props: SmarterLineChartProps) {
  const { slots, slotProps, ...rest } = props;
  const lineChartProps: LineChartProps = {
    ...rest,
    slots: {
      ...slots,
      mark: SmarterMarkElement,
    },
  };
  if (slotProps !== undefined) {
    const { mark, ...otherSlotProps } = slotProps;
    lineChartProps.slotProps = {
      ...otherSlotProps,
      mark: mark as unknown as Partial<MarkElementProps>,
    };
  }
  return <LineChart {...lineChartProps} />;
}
