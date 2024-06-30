import { Box, DialogTitle } from "@mui/material";
import ServerReceiverIcon from "../ServerReceiverIcon";

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
      <ServerReceiverIcon />
    </DialogTitle>
  );
}
