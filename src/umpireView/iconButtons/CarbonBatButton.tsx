import { BatButton, BatButtonProps } from "../../commonIcons/BatButton";

export type CarbonBatButtonProps = Omit<
  BatButtonProps,
  "bladeFillColor1" | "bladeFillColor2"
>;

export function CarbonBatButton(props: CarbonBatButtonProps) {
  return (
    <BatButton bladeFillColor1="#3ce86a" bladeFillColor2="#A9A9A9" {...props} />
  );
}
