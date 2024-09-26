import { Box } from "@mui/material";
import { ReactNode } from "react";
export default function Centered({ children }: { children: ReactNode }) {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      {children}
    </Box>
  );
}
