import { Box } from "@mui/material";

export function FirtyFity({
  left,
  right,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <Box display="flex" justifyContent="space-between">
      <div style={{ flexGrow: 1, flexBasis: "50%" }}>{left}</div>
      <div style={{ flexGrow: 1, flexBasis: "50%" }}>{right}</div>
    </Box>
  );
}
