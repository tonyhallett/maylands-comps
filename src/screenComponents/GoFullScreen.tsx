import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { IconButton, Typography } from "@mui/material";

export interface GoFullScreenProps {
  moveMouseToExit?: boolean;
}
export function GoFullScreen({ moveMouseToExit = false }: GoFullScreenProps) {
  return (
    <>
      <Typography display={"inline"}>
        {"Let's go full screen. Click !"}
      </Typography>
      <IconButton
        onClick={() => {
          document.body.requestFullscreen();
        }}
      >
        <FullscreenIcon />
      </IconButton>
      {moveMouseToExit && (
        <Typography>{"Touch the screen or move mouse to exit"}</Typography>
      )}
    </>
  );
}
