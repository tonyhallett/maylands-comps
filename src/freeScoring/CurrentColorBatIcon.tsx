import { BatIcon } from "../commonIcons/BatIcon";

export function BatPlusIcon() {
  return (
    <BatIcon
      showBall={false}
      bladeFillColor1="currentColor"
      bladeFillColor2="currentColor"
      rubberFillColor="none"
      rubberStrokeColor="currentColor"
    />
  );
}
export function CurrentColorBatIcon() {
  return (
    <BatIcon
      showBall={false}
      bladeFillColor1="currentColor"
      bladeFillColor2="currentColor"
      rubberFillColor="currentColor"
    />
  );
}
