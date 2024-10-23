import { youtubeProvider } from "./youtubeProvider";
import { facebookProvider } from "./facebookProvider";
import { instagramProvider } from "./instagramProvider";
import { twitchProvider } from "./twitchProvider";
import { LivestreamProvider } from "../LiveStreamingDialog";
import { xProvider } from "./xProvider";

export const livestreamProviders: LivestreamProvider[] = [
  youtubeProvider,
  facebookProvider,
  instagramProvider,
  twitchProvider,
  xProvider,
];
