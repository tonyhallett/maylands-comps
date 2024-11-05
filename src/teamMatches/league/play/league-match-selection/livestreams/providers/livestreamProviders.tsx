import { youtubeProvider } from "./youtubeProvider";
import { facebookProvider } from "./facebookProvider";
import { instagramProvider } from "./instagramProvider";
import { twitchProvider } from "./twitchProvider";
import { LivestreamProvider } from "../LivestreamProvider";
import { xProvider } from "./xProvider";
import { LivestreamService } from "../../../../../../firebase/rtb/team";

export const livestreamProviders: LivestreamProvider[] = [
  youtubeProvider,
  facebookProvider,
  instagramProvider,
  twitchProvider,
  xProvider,
];

export function getLivestreamProvider(service: LivestreamService) {
  const livestreamProvider = livestreamProviders.find(
    (lsp) => lsp.service === service,
  );
  if (livestreamProvider === undefined) {
    throw new Error("No live stream provider for service");
  }
  return livestreamProvider;
}
