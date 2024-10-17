import { SvgIcon } from "@mui/material";

export function TwitchIcon() {
  return (
    <SvgIcon
      fill="currentColor"
      style={{
        paddingTop: 2,
        paddingBottom: 3,
        paddingLeft: 2,
        paddingRight: 2,
      }}
    >
      <svg
        version="1.1"
        id="Layer_1"
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        viewBox="0 0 2400 2800"
      >
        <path d="M500,0L0,500v1800h600v500l500-500h400l900-900V0H500z M2200,1300l-400,400h-400l-350,350v-350H600V200h1600	V1300z" />
        <rect x="1700" y="550" width="200" height="600" />
        <rect x="1150" y="550" width="200" height="600" />
      </svg>
    </SvgIcon>
  );
}
