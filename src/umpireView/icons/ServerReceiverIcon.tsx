import { SvgIcon } from "@mui/material";

export default function ServerReceiverIcon() {
  return (
    <SvgIcon>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <line x1={2} x2={2} y1={2} y2={22} />
        <circle cx="11" cy="12" r="6" fill="currentColor" />
        <line x1={20} x2={20} y1={2} y2={22} />
      </svg>
    </SvgIcon>
  );
}
