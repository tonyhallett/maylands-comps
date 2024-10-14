import { twitchRegex } from "../src/teamMatches/league/play/league-match-view/liveSteamExtractor";

describe("live stream regexes", () => {
  describe("twitch regex", () => {
    it("should match twitch url", () => {
      expect(twitchRegex.test("https://www.twitch.tv/aperson")).toBe(true);
      expect(twitchRegex.test("https://www.twitch.tv/aperson123")).toBe(true);
    });
    it("should not match if not twitch url", () => {
      expect(twitchRegex.test("https://www.twitchy.tv/aperson")).toBe(false);
      expect(twitchRegex.test("https://www.twitch.tv/")).toBe(false);
      expect(twitchRegex.test("https://www.twitch.tv")).toBe(false);
    });
  });
});
