import { MatchState, getPlayers, getUmpire } from "../src/umpire/index";
describe("umpiring", () => {
  const singlesPlayers = getPlayers(false);
  const doublesPlayers = getPlayers(true);
  const getNormalUmpire = () => getUmpire("normal");
  const getHardbatUmpire = () => getUmpire("hardbat");
  const getHandicapUmpire = () => getUmpire("handicap");
  describe("initialization", () => {
    it("should initialize a normal umpire - singles", () => {
      const umpire = getNormalUmpire();
      const matchState = umpire.initialize(false, 1);
      expect(matchState).toEqual<Partial<MatchState>>({
        team1StartGameScore: 0,
        team2StartGameScore: 0,
        adjustedUpTo: 11,
        team1Left: true,
        team1Score: { gamesWon: 0, pointsWon: 0 },
        team2Score: { gamesWon: 0, pointsWon: 0 },
        availableServers: singlesPlayers,
        availableReceivers: [],
        isDoubles: false,
        bestOf: 1,
      });
    });

    it("should initialize a hardbat umpire - singles", () => {
      const umpire = getHardbatUmpire();
      const matchState = umpire.initialize(false, 1);
      expect(matchState).toEqual<Partial<MatchState>>({
        team1StartGameScore: 0,
        team2StartGameScore: 0,
        adjustedUpTo: 15,
        team1Left: true,
        team1Score: { gamesWon: 0, pointsWon: 0 },
        team2Score: { gamesWon: 0, pointsWon: 0 },
        availableServers: singlesPlayers,
        availableReceivers: [],
        isDoubles: false,
        bestOf: 1,
      });
    });

    describe("handicap inititialization - singles", () => {
      it("should adjust negatives start game scores if set option and negative handicaps", () => {
        const umpire = getHandicapUmpire();
        const matchState = umpire.initialize(false, 1, {
          team1Handicap: -1,
          team2Handicap: -2,
          shiftNegatives: true,
        });
        expect(matchState).toEqual<Partial<MatchState>>({
          team1StartGameScore: 1,
          team2StartGameScore: 0,
          adjustedUpTo: 33,
          team1Left: true,
          team1Score: { gamesWon: 0, pointsWon: 1 },
          team2Score: { gamesWon: 0, pointsWon: 0 },
          availableServers: singlesPlayers,
          availableReceivers: [],
          isDoubles: false,
          bestOf: 1,
        });
      });

      it("should leave negatives and upTo if do not shiftNegatives", () => {
        const umpire = getHandicapUmpire();
        const matchState = umpire.initialize(false, 1, {
          team1Handicap: -1,
          team2Handicap: -2,
          shiftNegatives: false,
        });
        expect(matchState).toEqual<Partial<MatchState>>({
          team1StartGameScore: -1,
          team2StartGameScore: -2,
          adjustedUpTo: 31,
          team1Left: true,
          team1Score: { gamesWon: 0, pointsWon: -1 },
          team2Score: { gamesWon: 0, pointsWon: -2 },
          availableServers: singlesPlayers,
          availableReceivers: [],
          isDoubles: false,
          bestOf: 1,
        });
      });
    });

    describe("doubles", () => {
      it("should have 4 players available", () => {
        const umpire = getNormalUmpire();
        const matchState = umpire.initialize(true, 5);
        expect(matchState).toEqual<Partial<MatchState>>({
          team1StartGameScore: 0,
          team2StartGameScore: 0,
          adjustedUpTo: 11,
          team1Left: true,
          team1Score: { gamesWon: 0, pointsWon: 0 },
          team2Score: { gamesWon: 0, pointsWon: 0 },
          availableServers: doublesPlayers,
          availableReceivers: [],
          isDoubles: true,
          bestOf: 5,
        });
      });
    });
  });

  describe("setting initial server", () => {
    describe("when singles", () => {
      // todo parameterize
      it("should set the server and receiver", () => {
        const umpire = getNormalUmpire();
        const matchState = umpire.initialize(false, 1);
        const newMatchState = umpire.setInitialServer("Team1Player1");
        expect(newMatchState).toEqual<MatchState>({
          ...matchState,
          availableReceivers: [],
          availableServers: [],
          server: "Team1Player1",
          receiver: "Team2Player1",
        });
      });
    });
    describe("when doubles", () => {
      // todo parameterize
      it("should set the server and available receivers", () => {
        const umpire = getNormalUmpire();
        const matchState = umpire.initialize(true, 1);
        const newMatchState = umpire.setInitialServer("Team1Player1");
        expect(newMatchState).toEqual<MatchState>({
          ...matchState,
          availableReceivers: ["Team2Player1", "Team2Player2"],
          availableServers: [],
          server: "Team1Player1",
          receiver: undefined,
        });
      });
    });
  });

  it("should allow switching ends", () => {
    // should happen before match starts
    const umpire = getNormalUmpire();
    const matchState = umpire.initialize(true, 5);
    expect(matchState.team1Left).toBe(true);
    const newMatchState = umpire.switchEnds();

    expect(newMatchState).toEqual({
      ...matchState,
      team1Left: false,
    });
  });
});
