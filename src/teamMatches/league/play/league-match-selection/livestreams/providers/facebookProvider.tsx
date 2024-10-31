import { LivestreamProvider } from "../LivestreamProvider";
import FacebookIcon from "@mui/icons-material/Facebook";
import { LivestreamService } from "../../../../../../firebase/rtb/team";
import FacebookPlayer from "react-player/facebook";

// https://www.facebook.com/tony.hallett.777/videos/1554747258504979/

export const facebookRegex =
  /^https:\/\/www\.facebook\.com\/([a-zA-Z0-9.]{5,})\/videos\/([0-9]+)\/?$/;

export const facebookProvider: LivestreamProvider = {
  icon: <FacebookIcon />,
  service: LivestreamService.facebook,
  serviceName: "Facebook",
  isPermitted: (url) => {
    const match = url.match(facebookRegex);
    if (match) {
      return {
        suggestedTag: `${match[1]}`,
        playerProp: url,
      };
    }
    return undefined;
  },
  inputLabel: "Share url",
  //validInputs: ["https://www.facebook.com/yourfbid/videos/yourvideoid"],
  canSeek: false,
  getPlayer(livestreamPlayerInfo) {
    return <FacebookPlayer url={livestreamPlayerInfo.playerProp!} />;
  },
};
