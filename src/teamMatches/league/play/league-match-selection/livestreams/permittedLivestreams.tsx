import {
  PermittedLivestreamInputResult,
  PermittedLivestreams,
} from "./LiveStreamingDialog";
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

type LivestreamServicePermitter = (
  url: string,
) => PermittedLivestreamInputResult | undefined;
const youtubePermitter: LivestreamServicePermitter = (url: string) => {
  const match = url.match(youtubeRegex);
  if (match) {
    return {
      service: LivestreamService.youtube,
      suggestedTag: `${match[1]}`,
      playerUrl: url,
    };
  }
  return undefined;
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const facebookPermitter: LivestreamServicePermitter = (url: string) => {
  return undefined;
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const instagramPermitter: LivestreamServicePermitter = (url: string) => {
  return undefined;
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const twitchPermitter: LivestreamServicePermitter = (url: string) => {
  return undefined;
};
const permitters = [
  youtubePermitter,
  facebookPermitter,
  instagramPermitter,
  twitchPermitter,
];

export const permittedLivestreams: PermittedLivestreams = {
  icons: [
    <YouTubeIcon key="yt" />,
    <FacebookIcon key="fb" />,
    <InstagramIcon key="ig" />,
    <TwitchIcon key="tw" />,
  ],
  getIconIndex: (service) => {
    switch (service) {
      case LivestreamService.youtube:
        return 0;
      case LivestreamService.facebook:
        return 1;
      case LivestreamService.instagram:
        return 2;
      case LivestreamService.twitch:
        return 3;
    }
  },
  isPermitted: (url) => {
    for (const permitter of permitters) {
      const result = permitter(url);
      if (result) {
        return result;
      }
    }
  },
};
