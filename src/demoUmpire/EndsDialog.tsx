import { useEffect, useState } from "react";
import { Alert, Dialog } from "@mui/material";
import SwitchAccountIcon from "@mui/icons-material/SwitchAccount";

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
      <Alert icon={<SwitchAccountIcon />} severity="info">
        Ends ! {isDoubles ? "Switch receivers" : ""}.
      </Alert>
    </Dialog>
  );
}
