import { PlayerPrefix } from "./PlayerPrefix";

export function ServerReceiverPlayer({ name, prefix }: PlayerPrefix) {
  return (
    <section
      aria-label="Player with service information"
      style={{
        textWrap: "nowrap",
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
      }}
    >
      <span style={{ width: 30, display: "inline-block" }}>{prefix}</span>
      {name}
    </section>
  );
}
