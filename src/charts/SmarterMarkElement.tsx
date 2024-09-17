import { MarkElement, MarkElementProps } from "@mui/x-charts";

export interface SmarterMarkElementSlotProps {
  getColor?: (
    seriesId,
    dataIndex: number,
  ) => MarkElementProps["color"] | undefined;
  getShape?: (
    seriesId,
    dataIndex: number,
  ) => MarkElementProps["shape"] | undefined;
}
export interface SmarterMarkElementProps
  extends MarkElementProps,
    SmarterMarkElementSlotProps {}

export function SmarterMarkElement(props: SmarterMarkElementProps) {
  const { getColor, getShape, ...rest } = props;
  const color = getColor?.(props.id, props.dataIndex) ?? props.color;
  const shape = getShape?.(props.id, props.dataIndex) ?? props.shape;

  return (
    <MarkElement
      data-index={props.dataIndex}
      data-series={props.id}
      data-shape={shape}
      {...rest}
      color={color}
      shape={shape}
    />
  );
}
