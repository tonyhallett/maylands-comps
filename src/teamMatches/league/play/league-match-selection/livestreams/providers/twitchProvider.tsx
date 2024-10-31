import { PermittedLivestreamInputResult } from "../LiveStreamingDialog";
import { LivestreamProvider } from "../LivestreamProvider";
import { LivestreamService } from "../../../../../../firebase/rtb/team";
import { TwitchIcon } from "./TwitchIcon";
import TwitchPlayer from "react-player/twitch";

// https://www.twitch.tv/thallett74?sr=a

export const twitchHttpRegex =
  /^https:\/\/www\.twitch\.tv\/([a-zA-Z0-9_]{2,25})(\?.*)?$/;
// is the minimum 3 - suggestion that there is a minimum of 1
export const twitchChannelNameRegex = /^[a-zA-Z0-9_]{2,25}$/;

export const getTwitchResult = (
  channelName: string,
): PermittedLivestreamInputResult => {
  return {
    suggestedTag: channelName,
    playerProp: `twitch.tv/${channelName}`,
  };
};

export const twitchProvider: LivestreamProvider = {
  icon: <TwitchIcon />,
  service: LivestreamService.twitch,
  serviceName: "Twitch",
  isPermitted: (url) => {
    let match = url.match(twitchHttpRegex);
    if (match) {
      return getTwitchResult(match[1]);
    }
    match = url.match(twitchChannelNameRegex);
    if (match) {
      return getTwitchResult(match[0]);
    }

    return undefined;
  },
  inputLabel: "Channel address or id",
  canSeek: false,
  getPlayer(livestreamPlayerInfo) {
    return <TwitchPlayer url={livestreamPlayerInfo.playerProp!} />;
  },
};
