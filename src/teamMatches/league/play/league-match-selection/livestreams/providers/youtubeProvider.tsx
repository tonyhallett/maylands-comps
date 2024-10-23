import {
  LivestreamProvider,
  PermittedLivestreamInputResult,
} from "../LiveStreamingDialog";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { LivestreamService } from "../../../../../../firebase/rtb/team";

// https://webapps.stackexchange.com/questions/54443/format-for-id-of-youtube-video
// https://youtube.com/live/U_BtCIwvHqg?feature=share
// https://www.youtube.com/live/jWK9PiYzTiQ?si=GcYnObJDva19ysVF
/* const youtubeRegex =
  /^https:\/\/(?:www\.)?youtube\.com\/(?:watch\?v=|live\/)([a-zA-Z0-9_-]{11})$/; */

const youtubeLiveRegex =
  /^https:\/\/(?:www\.)?youtube\.com\/live\/([a-zA-Z0-9_-]{11})(\?.*)?$/;
// todo query parameters
const youtubeWatchRegex =
  /^https:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})$/;

const regexes = [youtubeLiveRegex, youtubeWatchRegex];

const getResult = (match: RegExpMatchArray): PermittedLivestreamInputResult => {
  return {
    suggestedTag: `${match[1]}`,
    playerProp: match[0],
  };
};
export const youtubeProvider: LivestreamProvider = {
  icon: <YouTubeIcon />,
  service: LivestreamService.youtube,
  serviceName: "YouTube",
  isPermitted: (url) => {
    for (const regex of regexes) {
      const match = url.match(regex);
      if (match) {
        return getResult(match);
      }
    }

    return undefined;
  },
  inputLabel: "Share url",
};
