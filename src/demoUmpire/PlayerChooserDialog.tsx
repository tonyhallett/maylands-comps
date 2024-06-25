import { Box, Button, Dialog, Stack } from "@mui/material";
import DialogContent from "@mui/material/DialogContent";
import { Player } from "../umpire";
import { PlayerAndName } from "./mapNames";
import ServerReceiverEndsDialogTitle from "./ServerReceiverEndsDialogTitle";
import { ClickKingTosser } from "./DemoTosser";

export function PlayerChooserDialog({
  playerAndNames,
  callback,
  title,
  showTosser,
}: {
  playerAndNames: PlayerAndName[];
  callback: (player: Player) => void;
  title: string;
  showTosser: boolean;
}) {
  return (
    <Dialog open>
      <ServerReceiverEndsDialogTitle title={title} />
      <DialogContent>
        <Stack spacing={1}>
          {playerAndNames.map((playerAndName) => (
            <Button
              sx={{
                justifyContent: "flex-start",
              }}
              key={playerAndName.name}
              variant="contained"
              onClick={() => callback(playerAndName.player)}
            >
              <Box
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {playerAndName.name}
              </Box>
            </Button>
          ))}
          {showTosser && (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <ClickKingTosser />
            </Box>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
