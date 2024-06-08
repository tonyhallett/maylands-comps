import { getPlayers, getUmpire } from "../src/umpire/index";
describe("umpiring", () => {
  const singlesPlayers = getPlayers(false);
  const doublesPlayers = getPlayers(true);
  const getAnUmpire = (bestOf = 1) => getUmpire("normal", false, bestOf);

  describe("initialization", () => {
    it("should have team1 left", () => {
      expect(getAnUmpire().team1Left).toBe(true);
    });

    it.each([1, 3])("should have best of", (bestOf) => {
      expect(getAnUmpire(bestOf).bestOf).toBe(bestOf);
    });
    it("should initialize normal scoring", () => {
      const umpire = getUmpire("normal", false, 1);
      expect(umpire.upTo).toBe(11);
      expect(umpire.team1Score).toStrictEqual({ gamesWon: 0, pointsWon: 0 });
      expect(umpire.team2Score).toStrictEqual({ gamesWon: 0, pointsWon: 0 });
    });
    it("should initialize available servers and receivers for singles", () => {
      const umpire = getUmpire("normal", false, 1);
      expect(umpire.availableServers).toEqual(singlesPlayers);
      expect(umpire.availableReceivers).toEqual([]);
    });
    it("should initialize available servers and receivers for doubles", () => {
      const umpire = getUmpire("normal", true, 1);
      expect(umpire.availableServers).toEqual(doublesPlayers);
      expect(umpire.availableReceivers).toHaveLength(0);
    });

    it("should initialize hardbat scoring", () => {
      const umpire = getUmpire("hardbat", false, 1);
      expect(umpire.upTo).toBe(15);
      expect(umpire.team1Score).toStrictEqual({ gamesWon: 0, pointsWon: 0 });
      expect(umpire.team2Score).toStrictEqual({ gamesWon: 0, pointsWon: 0 });
    });

    describe("handicap scoring", () => {
      it("should adjust negatives start game scores if set option and negative handicaps", () => {
        const umpire = getUmpire("handicap", false, 1, {
          team1Handicap: -1,
          team2Handicap: -2,
          shiftNegatives: true,
        });

        expect(umpire.upTo).toBe(33);
        expect(umpire.team1Score).toStrictEqual({ gamesWon: 0, pointsWon: 1 });
        expect(umpire.team2Score).toStrictEqual({ gamesWon: 0, pointsWon: 0 });
      });

      it("should leave negatives and upTo if do not shiftNegatives", () => {
        const umpire = getUmpire("handicap", false, 1, {
          team1Handicap: -1,
          team2Handicap: -2,
          shiftNegatives: false,
        });

        expect(umpire.upTo).toBe(31);
        expect(umpire.team1Score).toStrictEqual({ gamesWon: 0, pointsWon: -1 });
        expect(umpire.team2Score).toStrictEqual({ gamesWon: 0, pointsWon: -2 });
      });
    });
  });

  describe("setting initial server", () => {
    describe("when singles", () => {
      // todo parameterize
      it("should set the server and receiver", () => {
        const umpire = getUmpire("normal", false, 1);
        umpire.setInitialServer("Team1Player1");
        expect(umpire.availableServers).toHaveLength(0);
        expect(umpire.availableReceivers).toHaveLength(0);
        expect(umpire.server).toEqual("Team1Player1");
        expect(umpire.receiver).toEqual("Team2Player1");
      });
    });
    describe("when doubles", () => {
      // todo parameterize
      it("should set the server and available receivers", () => {
        const umpire = getUmpire("normal", true, 1);
        umpire.setInitialServer("Team1Player1");
        expect(umpire.availableServers).toHaveLength(0);
        expect(umpire.availableReceivers).toEqual([
          "Team2Player1",
          "Team2Player2",
        ]);
        expect(umpire.server).toEqual("Team1Player1");
        expect(umpire.receiver).toBeUndefined();
      });
    });
  });

  it("should allow switching ends", () => {
    // should happen before match starts
    const umpire = getAnUmpire();
    umpire.switchEnds();
    expect(umpire.team1Left).toBe(false);
  });
});
