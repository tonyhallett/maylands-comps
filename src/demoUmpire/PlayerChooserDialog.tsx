import { Box, Button, Dialog, DialogTitle } from "@mui/material";
import DialogContent from "@mui/material/DialogContent";
import { Player } from "../umpire";
import { PlayerAndName } from "./mapNames";

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
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {playerAndNames.map((playerAndName) => (
          <Box key={playerAndName.player} p={1}>
            <Button
              style={{
                width: "100%",
              }}
              variant="contained"
              onClick={() => callback(playerAndName.player)}
            >
              {playerAndName.name}
            </Button>
          </Box>
        ))}
      </DialogContent>
    </Dialog>
  );
}
