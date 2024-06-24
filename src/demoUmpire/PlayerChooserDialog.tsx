import { Button, Dialog, Stack } from "@mui/material";
import DialogContent from "@mui/material/DialogContent";
import { Player } from "../umpire";
import { PlayerAndName } from "./mapNames";
import ServerReceiverEndsDialogTitle from "./ServerReceiverEndsDialogTitle";

export function PlayerChooserDialog({
  playerAndNames,
  callback,
  title,
}: {
  playerAndNames: PlayerAndName[];
  callback: (player: Player) => void;
  title: string;
}) {
  return (
    <Dialog open>
      <ServerReceiverEndsDialogTitle title={title} />
      <DialogContent>
        <Stack spacing={1}>
          {playerAndNames.map((playerAndName) => (
            <Button
              key={playerAndName.name}
              fullWidth
              variant="contained"
              onClick={() => callback(playerAndName.player)}
            >
              {playerAndName.name}
            </Button>
          ))}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
