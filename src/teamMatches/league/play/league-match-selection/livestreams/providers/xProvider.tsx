import XIcon from "@mui/icons-material/X";
import { LivestreamProvider } from "../LiveStreamingDialog";
import { LivestreamService } from "../../../../../../firebase/rtb/team";

const postRegex =
  /^https?:\/\/(?:www\.)?x\.com\/([A-Za-z0-9_]{1,15})\/status\/(\d+)$/;

export const xProvider: LivestreamProvider = {
  icon: <XIcon />,
  service: LivestreamService.x,
  serviceName: "Instagram",
  isPermitted: (url) => {
    const match = url.match(postRegex);
    if (match) {
      return {
        suggestedTag: match[1],
        playerProp: match[2],
      };
    }
    return undefined;
  },
  inputLabel: "Post url",
};
