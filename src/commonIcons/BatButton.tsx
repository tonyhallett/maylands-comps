import { Box, IconButton } from "@mui/material";
import { BatIcon, BatIconProps } from "./BatIcon";

export interface BatButtonProps extends BatIconProps {
  enabled: boolean;
  clicked: () => void;
}

export function BatButton({ enabled, clicked, ...svgProps }: BatButtonProps) {
  return (
    <Box m={1}>
      <IconButton
        sx={{ border: 1, borderRadius: 1 }}
        disabled={!enabled}
        onClick={clicked}
      >
        <BatIcon {...svgProps} />
      </IconButton>
    </Box>
  );
}
