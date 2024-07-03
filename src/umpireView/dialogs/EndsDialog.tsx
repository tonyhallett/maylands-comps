import { useEffect, useState } from "react";
import { Alert, Dialog, Typography } from "@mui/material";
import SwitchReceiversIcon from "@mui/icons-material/SocialDistance";

export interface EndsDialogProps {
  isEnds: boolean;
  isDoubles: boolean;
}

export function EndsDialog({ isEnds, isDoubles }: EndsDialogProps) {
  const [showDialog, setShowDialog] = useState(false);
  useEffect(() => {
    if (isEnds) {
      setShowDialog(true);
    }
  }, [isEnds]);
  return (
    <Dialog
      open={showDialog}
      onClose={() => {
        setShowDialog(false);
      }}
    >
      <Alert icon={<SwitchReceiversIcon fontSize="large" />} severity="info">
        <Typography variant="h5">
          Ends ! {isDoubles ? "Switch receivers" : ""}
        </Typography>
      </Alert>
    </Dialog>
  );
}
