import { Button, Dialog, Stack } from "@mui/material";
import DialogContent from "@mui/material/DialogContent/DialogContent";
import ServerReceiverEndsDialogTitle from "./ServerReceiverEndsDialogTitle";

export interface InitialEndsDialogProps {
  switchEnds: () => void;
  ok: () => void;
}

export function InitialEndsDialog({ ok, switchEnds }: InitialEndsDialogProps) {
  return (
    <Dialog open={true}>
      <ServerReceiverEndsDialogTitle title="Choose Ends" />
      <DialogContent>
        <Stack spacing={1}>
          <Button fullWidth variant="contained" onClick={switchEnds}>
            Switch
          </Button>
          <Button fullWidth variant="contained" onClick={ok}>
            OK
          </Button>{" "}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
