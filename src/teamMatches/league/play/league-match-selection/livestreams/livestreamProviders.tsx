import { LivestreamProvider } from "./LiveStreamingDialog";
import YouTubeIcon from "@mui/icons-material/YouTube";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import { LivestreamService } from "../../../../../firebase/rtb/team";
import { TwitchIcon } from "./TwitchIcon";

// https://webapps.stackexchange.com/questions/54443/format-for-id-of-youtube-video
//  https://youtube.com/live/U_BtCIwvHqg?feature=share
export const youtubeRegex =
  /^https:\/\/(?:www\.)?youtube\.com\/(?:watch\?v=|live\/)([a-zA-Z0-9_-]{11})$/;

// https://www.instagram.com/hallett1694/live/17927797259956173?igsh=MXgyN29vY3N5YzV5dQ%3D%3D
export const instagramRegex =
  /^https:\/\/www\.instagram\.com\/([a-zA-Z0-9_]+)\/live\/([0-9]+)\?igsh=([a-zA-Z0-9%]+)$/;

// https://www.twitch.tv/thallett74?sr=a
// provided by chat gpt
// export const twitchRegex = /^https:\/\/www\.twitch\.tv\/([a-zA-Z0-9_]+)$/;
export const twitchRegex = /^https:\/\/www\.twitch\.tv\/.+$/;

// https://www.facebook.com/tony.hallett.777/videos/1554747258504979/

//export const facebookRegex =  /^https:\/\/www\.facebook\.com\/([a-zA-Z0-9\.]+)\/videos\/([0-9]+)\/$/;

// todo check the regexes above ! see liveStreamRegexes.test.ts

const youtubeProvider: LivestreamProvider = {
  icon: <YouTubeIcon />,
  service: LivestreamService.youtube,
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
  // need to change the regex
  inputLabel: "Url or video id",
};
const facebookProvider: LivestreamProvider = {
  icon: <FacebookIcon />,
  service: LivestreamService.facebook,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isPermitted: (url) => undefined,
  inputLabel: "Share url",
  //validInputs: ["https://www.facebook.com/yourfbid/videos/yourvideoid"],
};
const instagramProvider: LivestreamProvider = {
  icon: <InstagramIcon />,
  service: LivestreamService.instagram,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isPermitted: (url) => undefined,
  inputLabel: "Share url",
  validInputs: [
    "https://www.instagram.com/yourusername/live/yourvideoid?igsh=yourhash",
  ],
};

const twitchProvider: LivestreamProvider = {
  icon: <TwitchIcon />,
  service: LivestreamService.twitch,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isPermitted: (url) => undefined,
  inputLabel: "Channel id",
};

export const livestreamProviders = [
  youtubeProvider,
  facebookProvider,
  instagramProvider,
  twitchProvider,
];
