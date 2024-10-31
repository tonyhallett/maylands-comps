import { LivestreamProvider } from "../LivestreamProvider";
import InstagramIcon from "@mui/icons-material/Instagram";
import { LivestreamService } from "../../../../../../firebase/rtb/team";

// https://www.instagram.com/hallett1694/live/17927797259956173?igsh=MXgyN29vY3N5YzV5dQ%3D%3D
const instagramRegex =
  /^https:\/\/www\.instagram\.com\/([a-zA-Z0-9_]+)\/live\/([0-9]+)\?igsh=([a-zA-Z0-9%]+)$/;

export const instagramProvider: LivestreamProvider = {
  icon: <InstagramIcon />,
  service: LivestreamService.instagram,
  serviceName: "Instagram",
  isPermitted: (url) => {
    const match = url.match(instagramRegex);
    if (match) {
      return {
        suggestedTag: `${match[1]}`,
      };
    }
    return undefined;
  },
  inputLabel: "Share url",
  canSeek: false,
  /* validInputs: [
    "https://www.instagram.com/yourusername/live/yourvideoid?igsh=yourhash",
  ], */
  getPlayer(livestreamPlayerInfo) {
    return <a href={livestreamPlayerInfo.url}>Instagram live stream</a>;
  },
};
