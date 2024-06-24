import { Box, DialogTitle } from "@mui/material";
import ServerReceiverEndsIcon from "../ServerReceiverEndsIcon";

export default function ServerReceiverEndsDialogTitle({
  title,
}: {
  title: string;
}) {
  return (
    <DialogTitle>
      <Box sx={{ display: "inline" }} mr={1}>
        {title}
      </Box>
      <ServerReceiverEndsIcon />
    </DialogTitle>
  );
}
