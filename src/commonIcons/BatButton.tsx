import { Box, IconButton } from "@mui/material";
import { BatIcon, BatIconProps } from "./BatIcon";

export interface BatButtonProps extends BatIconProps {
  enabled: boolean;
  clicked: () => void;
  ariaLabel?: string;
}

export function BatButton({
  enabled,
  clicked,
  ariaLabel,
  ...svgProps
}: BatButtonProps) {
  return (
    <Box m={1}>
      <IconButton
        aria-label={ariaLabel}
        sx={{ border: 1, borderRadius: 1 }}
        disabled={!enabled}
        onClick={clicked}
      >
        <BatIcon {...svgProps} />
      </IconButton>
    </Box>
  );
}
