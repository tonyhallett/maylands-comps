import { Box, IconButton } from "@mui/material";

export function BatButton({
  enabled,
  clicked,
  fontSize,
}: {
  fontSize: number;
  enabled: boolean;
  clicked: () => void;
}) {
  return (
    <Box m={1}>
      <IconButton
        style={{ color: "white" }}
        disabled={!enabled}
        onClick={clicked}
      >
        <div style={{ fontSize, fontFamily: "Noto Color Emoji variant0" }}>
          🏓
        </div>
      </IconButton>
    </Box>
  );
}
