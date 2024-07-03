import { BatButton, BatButtonProps } from "../commonIcons/BatButton";

export type CurrentColorBatButtonProps = Omit<
  BatButtonProps,
  | "rubberFillColor"
  | "bladeFillColor1"
  | "bladeFillColor2"
  | "showBall"
  | "flip"
>;

export function CurrentColorBatButton({
  clicked,
  enabled,
}: CurrentColorBatButtonProps) {
  return (
    <BatButton
      rubberFillColor="currentColor"
      bladeFillColor1="currentColor"
      bladeFillColor2="currentColor"
      showBall={false}
      enabled={enabled}
      clicked={clicked}
    ></BatButton>
  );
}
