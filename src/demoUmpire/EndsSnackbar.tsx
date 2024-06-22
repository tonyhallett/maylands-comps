import { useEffect, useState } from "react";
import { Alert, Snackbar } from "@mui/material";
import SwitchAccountIcon from "@mui/icons-material/SwitchAccount";

export interface EndsSnackbarProps {
  isEnds: boolean;
  isDoubles: boolean;
}

export function EndsSnackbar({ isEnds, isDoubles }: EndsSnackbarProps) {
  const [showSnackbar, setShowSnackbar] = useState(false);
  useEffect(() => {
    if (isEnds) {
      setShowSnackbar(true);
    }
  }, [isEnds]);
  return (
    <Snackbar
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      open={showSnackbar}
      autoHideDuration={6000}
      onClose={() => {
        setShowSnackbar(false);
      }}
    >
      <Alert icon={<SwitchAccountIcon />} severity="info">
        Ends ! {isDoubles ? "Switch receivers" : ""}.
      </Alert>
    </Snackbar>
  );
}
