import { LivestreamProvider } from "./LiveStreamingDialog";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { LivestreamService } from "../../../../../firebase/rtb/team";

// https://webapps.stackexchange.com/questions/54443/format-for-id-of-youtube-video
//  https://youtube.com/live/U_BtCIwvHqg?feature=share
const youtubeRegex =
  /^https:\/\/(?:www\.)?youtube\.com\/(?:watch\?v=|live\/)([a-zA-Z0-9_-]{11})$/;

export const youtubeProvider: LivestreamProvider = {
  icon: <YouTubeIcon />,
  service: LivestreamService.youtube,
  serviceName: "YouTube",
  isPermitted: (url) => {
    const match = url.match(youtubeRegex);
    if (match) {
      return {
        service: LivestreamService.youtube,
        suggestedTag: `${match[1]}`,
        playerUrl: url,
      };
    }
    return undefined;
  },
  inputLabel: "Share url",
};
