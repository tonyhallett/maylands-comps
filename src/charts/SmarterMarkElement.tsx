import { MarkElement, MarkElementProps } from "@mui/x-charts";

export interface SmarterMarkElementSlotProps {
  getColor?: (seriesId, dataIndex: number) => MarkElementProps["color"];
  getShape?: (seriesId, dataIndex: number) => MarkElementProps["shape"];
}
export interface SmarterMarkElementProps
  extends MarkElementProps,
    SmarterMarkElementSlotProps {}

export function SmarterMarkElement(props: SmarterMarkElementProps) {
  const { getColor, getShape, ...rest } = props;
  const color = getColor?.(props.id, props.dataIndex) ?? props.color;
  const shape = getShape?.(props.id, props.dataIndex) ?? props.shape;

  return <MarkElement {...rest} color={color} shape={shape} />;
}
