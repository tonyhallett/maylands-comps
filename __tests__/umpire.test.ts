import { Player, TeamScore, getPlayers, getUmpire } from "../src/umpire/index";
describe("umpiring", () => {
  const singlesPlayers = getPlayers(false);
  const doublesPlayers = getPlayers(true);
  const getAnUmpire = (bestOf = 1) => getUmpire("normal", false, bestOf);
  const getNormalSinglesBestOf5Umpire = () => getUmpire("normal", false, 5);

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
      const serverReceivers: Array<[Player, Player]> = [
        ["Team1Player1", "Team2Player1"],
        ["Team2Player1", "Team1Player1"],
      ];
      it.each(serverReceivers)(
        "should set the server and receiver",
        (server, expectedReceiver) => {
          const umpire = getUmpire("normal", false, 1);
          umpire.setInitialServer(server);
          expect(umpire.availableServers).toHaveLength(0);
          expect(umpire.availableReceivers).toHaveLength(0);
          expect(umpire.server).toEqual(server);
          expect(umpire.receiver).toEqual(expectedReceiver);
        },
      );
    });
    describe("when doubles", () => {
      const serverReceivers: Array<[Player, [Player, Player]]> = [
        ["Team1Player1", ["Team2Player1", "Team2Player2"]],
        ["Team1Player2", ["Team2Player1", "Team2Player2"]],
        ["Team2Player1", ["Team1Player1", "Team1Player2"]],
        ["Team2Player2", ["Team1Player1", "Team1Player2"]],
      ];

      it.each(serverReceivers)(
        "should set the server and available receivers",
        (server, expectedReceivers) => {
          const umpire = getUmpire("normal", true, 1);
          umpire.setInitialServer(server);
          expect(umpire.availableServers).toHaveLength(0);
          expect(umpire.availableReceivers).toEqual(expectedReceivers);
          expect(umpire.server).toEqual(server);
          expect(umpire.receiver).toBeUndefined();
        },
      );
    });
  });

  describe("scoring", () => {
    // todo - that game scores are kept !
    it.each([true, false])("should increment points", (team1Scores) => {
      const umpire = getAnUmpire();
      umpire.pointScored(team1Scores);
      const incrementedTeamScore = team1Scores
        ? umpire.team1Score
        : umpire.team2Score;
      const notIncrementedTeamScore = team1Scores
        ? umpire.team2Score
        : umpire.team1Score;
      expect(incrementedTeamScore).toEqual<TeamScore>({
        gamesWon: 0,
        pointsWon: 1,
      });
      expect(notIncrementedTeamScore).toEqual<TeamScore>({
        gamesWon: 0,
        pointsWon: 0,
      });
    });
    it("should increment games resetting points when game won", () => {
      const umpire = getNormalSinglesBestOf5Umpire();
      umpire.pointScored(false);
      [...Array(11)].forEach(() => umpire.pointScored(true));
      expect(umpire.team1Score).toEqual<TeamScore>({
        gamesWon: 1,
        pointsWon: 0,
      });
      expect(umpire.team2Score).toEqual<TeamScore>({
        gamesWon: 0,
        pointsWon: 0,
      });
    });
    it("should reset handicap start game scores correctly", () => {
      // up to 31
      const umpire = getUmpire("handicap", false, 3, {
        team1Handicap: -1,
        team2Handicap: -2,
        shiftNegatives: false,
      });
      umpire.pointScored(true);
      [...Array(33)].forEach(() => umpire.pointScored(false));
      expect(umpire.team1Score).toStrictEqual({ gamesWon: 0, pointsWon: -1 });
      expect(umpire.team2Score).toStrictEqual({ gamesWon: 1, pointsWon: -2 });
    });
  });

  describe("switching ends", () => {
    it("should allow switching ends", () => {
      // should happen before match starts
      const umpire = getAnUmpire();
      umpire.switchEnds();
      expect(umpire.team1Left).toBe(false);
    });

    it("should switch ends after game", () => {
      const umpire = getNormalSinglesBestOf5Umpire();
      expect(umpire.team1Left).toBe(true);
      [...Array(10)].forEach(() => {
        umpire.pointScored(true);
        expect(umpire.team1Left).toBe(true);
      });

      umpire.pointScored(true);
      expect(umpire.team1Left).toBe(false);
    });

    it("should switch ends in the middle of the last game", () => {
      const umpire = getNormalSinglesBestOf5Umpire();
      expect(umpire.team1Left).toBe(true);
      [...Array(22)].forEach(() => umpire.pointScored(true));
      expect(umpire.team1Left).toBe(true);
      [...Array(22)].forEach(() => umpire.pointScored(false));
      expect(umpire.team1Left).toBe(true);
      [...Array(5)].forEach(() => umpire.pointScored(true));
      expect(umpire.team1Left).toBe(false);
    });

    it("should only switch ends once in the middle of the last game", () => {
      const umpire = getNormalSinglesBestOf5Umpire();
      expect(umpire.team1Left).toBe(true);
      [...Array(22)].forEach(() => umpire.pointScored(true));
      expect(umpire.team1Left).toBe(true);
      [...Array(22)].forEach(() => umpire.pointScored(false));
      expect(umpire.team1Left).toBe(true);
      [...Array(5)].forEach(() => umpire.pointScored(true));
      expect(umpire.team1Left).toBe(false);
      [...Array(5)].forEach(() => umpire.pointScored(false));
      expect(umpire.team1Left).toBe(false);
    });

    it("should switch ends in the last handicap game differently for each player", () => {
      const umpire = getUmpire("handicap", false, 3, {
        team1Handicap: 10,
        team2Handicap: 20,
        shiftNegatives: false,
      });
      expect(umpire.team1Left).toBe(true);
      [...Array(21)].forEach(() => umpire.pointScored(true));
      [...Array(11)].forEach(() => umpire.pointScored(false));
      expect(umpire.team1Left).toBe(true);

      throw new Error("finish this test");
    });

    it("should not switch ends when the match is won", () => {
      const umpire = getNormalSinglesBestOf5Umpire();
      expect(umpire.team1Left).toBe(true);
      [...Array(33)].forEach(() => umpire.pointScored(true));

      expect(umpire.team1Left).toBe(true);
    });
  });

  describe("serving", () => {
    // do singles 2 serves /  5 serves
    // keep track of number of serves remaining too
  });
});
