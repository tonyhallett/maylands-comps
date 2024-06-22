import { PlayerPrefix } from "./PlayerPrefix";

export function ServerReceiverPlayer({ name, prefix }: PlayerPrefix) {
  return (
    <div>
      <div style={{ width: 30, display: "inline-block" }}>{prefix}</div>
      <span style={{ textWrap: "nowrap" }}>{name}</span>
    </div>
  );
}
