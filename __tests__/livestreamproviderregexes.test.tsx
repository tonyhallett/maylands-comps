import { twitchProvider } from "../src/teamMatches/league/play/league-match-selection/livestreams/providers/twitchProvider";
import { youtubeProvider } from "../src/teamMatches/league/play/league-match-selection/livestreams/providers/youtubeProvider";
import ReactPlayer from "react-player";
import twitchPlayer from "react-player/lib/players/Twitch";
import youtubePlayer from "react-player/lib/players/YouTube";

describe("LivestreamProviderRegexes", () => {
  describe("youtube", () => {
    it("live regex matches with query parameters", () => {
      const permittedResult = youtubeProvider.isPermitted(
        "https://www.youtube.com/live/jWK9PiYzTiQ?si=GcYnObJDva19ysVF",
      );
      expect(permittedResult?.suggestedTag).toBe("jWK9PiYzTiQ");
      expect(permittedResult?.playerProp).toBe(
        "https://www.youtube.com/live/jWK9PiYzTiQ?si=GcYnObJDva19ysVF",
      );
      expect(youtubePlayer.canPlay(permittedResult!.playerProp!)).toBe(true);
    });
    it("live regex matches without query parameters", () => {
      const permittedResult = youtubeProvider.isPermitted(
        "https://www.youtube.com/live/jWK9PiYzTiQ",
      );
      expect(permittedResult?.suggestedTag).toBe("jWK9PiYzTiQ");
      expect(permittedResult?.playerProp).toBe(
        "https://www.youtube.com/live/jWK9PiYzTiQ",
      );
      expect(youtubePlayer.canPlay(permittedResult!.playerProp!)).toBe(true);
    });
  });
  describe("twitch", () => {
    it("should return a player url compatible with react-player regex", () => {
      const permittedResult = twitchProvider.isPermitted(
        "https://www.twitch.tv/thallett74",
      );

      expect(twitchPlayer.canPlay(permittedResult!.playerProp!)).toBe(true);
      expect(ReactPlayer.canPlay(permittedResult!.playerProp!)).toBe(true);
    });
    it("should work with query parameters", () => {
      const permittedResult = twitchProvider.isPermitted(
        "https://www.twitch.tv/thallett74?sr=a",
      );

      expect(twitchPlayer.canPlay(permittedResult!.playerProp!)).toBe(true);
      expect(ReactPlayer.canPlay(permittedResult!.playerProp!)).toBe(true);
    });
  });
});
