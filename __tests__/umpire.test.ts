import {
  GameScore,
  HandicapOptions,
  Player,
  PointHistory,
  TeamScore,
  Umpire,
  getPlayers,
  shiftHandicap,
} from "../src/umpire/index";
describe("umpiring", () => {
  const singlesPlayers = getPlayers(false);
  const doublesPlayers = getPlayers(true);
  const getAnUmpire = (bestOf = 1) =>
    new Umpire(
      {
        clearBy2: true,
        upTo: 11,
        numServes: 2,
        team1StartGameScore: 0,
        team2StartGameScore: 0,
      },
      false,
      bestOf,
    );
  const getNormalSinglesBestOf5Umpire = () =>
    new Umpire(
      {
        clearBy2: true,
        upTo: 11,
        numServes: 2,
        team1StartGameScore: 0,
        team2StartGameScore: 0,
      },
      false,
      5,
    );

  const getNormalDoublesBestOf5Umpire = () =>
    new Umpire(
      {
        clearBy2: true,
        upTo: 11,
        numServes: 2,
        team1StartGameScore: 0,
        team2StartGameScore: 0,
      },
      true,
      5,
    );
  const getHardbatSinglesUmpire = (bestOf = 3) => {
    return new Umpire(
      {
        clearBy2: false,
        upTo: 15,
        numServes: 5,
        team1StartGameScore: 0,
        team2StartGameScore: 0,
      },
      false,
      bestOf,
    );
  };

  describe("initialization", () => {
    it("should have team1 left", () => {
      expect(getAnUmpire().team1Left).toBe(true);
    });

    it.each([1, 3])("should have best of", (bestOf) => {
      expect(getAnUmpire(bestOf).bestOf).toBe(bestOf);
    });

    it("should initialize scoring", () => {
      const umpire = new Umpire(
        {
          clearBy2: true,
          upTo: 11,
          numServes: 2,
          team1StartGameScore: -1,
          team2StartGameScore: -2,
        },
        false,
        3,
      );

      expect(umpire.team1Score).toStrictEqual({ gamesWon: 0, pointsWon: -1 });
      expect(umpire.team2Score).toStrictEqual({ gamesWon: 0, pointsWon: -2 });
    });

    describe("handicap scoring", () => {
      it("shiftHandicaps can shift negative handicaps and up to", () => {
        const shifted = shiftHandicap({
          team1Handicap: -1,
          team2Handicap: -2,
          upTo: 31,
        });
        expect(shifted).toEqual<HandicapOptions>({
          team1Handicap: 1,
          team2Handicap: 0,
          upTo: 33,
        });
      });
    });
  });

  const scorePoints = (umpire: Umpire, team1: boolean, n: number) => {
    [...Array(n)].forEach(() => umpire.pointScored(team1));
  };
  const scoreGames = (
    umpire: Umpire,
    team1: boolean,
    n: number,
    gamePoints = 11,
  ) => {
    [...Array(n)].forEach(() => scorePoints(umpire, team1, gamePoints));
  };

  describe("scoring", () => {
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
      scoreGames(umpire, true, 1);
      expect(umpire.team1Score).toEqual<TeamScore>({
        gamesWon: 1,
        pointsWon: 0,
      });
      expect(umpire.team2Score).toEqual<TeamScore>({
        gamesWon: 0,
        pointsWon: 0,
      });
    });

    it("should reset start game scores correctly", () => {
      const umpire = new Umpire(
        {
          clearBy2: true,
          upTo: 31,
          numServes: 2,
          team1StartGameScore: -1,
          team2StartGameScore: -2,
        },
        false,
        3,
      );

      umpire.pointScored(true);
      scorePoints(umpire, false, 33);

      expect(umpire.team1Score).toStrictEqual({ gamesWon: 0, pointsWon: -1 });
      expect(umpire.team2Score).toStrictEqual({ gamesWon: 1, pointsWon: -2 });
    });

    it("should not win game if not clear by 2", () => {
      const clearBy2Umpire = getNormalSinglesBestOf5Umpire();
      scorePoints(clearBy2Umpire, true, 10);
      scorePoints(clearBy2Umpire, false, 10);
      clearBy2Umpire.pointScored(true);
      expect(clearBy2Umpire.team1Score).toStrictEqual({
        gamesWon: 0,
        pointsWon: 11,
      });
      expect(clearBy2Umpire.team2Score).toStrictEqual({
        gamesWon: 0,
        pointsWon: 10,
      });

      const notClearBy2Umpire = getHardbatSinglesUmpire();
      scorePoints(notClearBy2Umpire, true, 14);
      scorePoints(notClearBy2Umpire, false, 14);
      notClearBy2Umpire.pointScored(false);
      expect(notClearBy2Umpire.team1Score).toStrictEqual({
        gamesWon: 0,
        pointsWon: 0,
      });
      expect(notClearBy2Umpire.team2Score).toStrictEqual({
        gamesWon: 1,
        pointsWon: 0,
      });
    });

    it("should keep scoring history", () => {
      const umpire = getNormalSinglesBestOf5Umpire();
      // going to have to conside locale and serialization
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toJSON
      const dates = [...Array(20)].map((x, y) => new Date(2024, 0, y + 1));
      let dateIndex = 0;
      (umpire as unknown as { dateProvider: () => Date }).dateProvider = () => {
        return dates[dateIndex++];
      };
      umpire.pointScored(true);
      expect(umpire.pointHistory[0][0]).toEqual<PointHistory>({
        team1: true,
        date: dates[0],
      });
      umpire.pointScored(false);
      expect(umpire.pointHistory[0][1]).toEqual<PointHistory>({
        team1: false,
        date: dates[1],
      });
      scorePoints(umpire, true, 10);

      umpire.pointScored(true);
      expect(umpire.pointHistory[1][0]).toEqual<PointHistory>({
        team1: true,
        date: dates[12],
      });
    });

    it("should keep scores from previous games", () => {
      const umpire = getNormalSinglesBestOf5Umpire();
      scorePoints(umpire, true, 7);
      scoreGames(umpire, false, 1);

      scorePoints(umpire, false, 6);
      scoreGames(umpire, true, 1);

      expect(umpire.gameScores).toEqual<Array<GameScore>>([
        { team1Points: 7, team2Points: 11 },
        { team1Points: 11, team2Points: 6 },
      ]);
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

    const team1Ends = () => {
      const umpire = getNormalSinglesBestOf5Umpire();
      expect(umpire.team1Left).toBe(true);
      scoreGames(umpire, true, 2);
      expect(umpire.team1Left).toBe(true);
      scoreGames(umpire, false, 2);
      expect(umpire.team1Left).toBe(true);
      scorePoints(umpire, true, 5);
      return umpire;
    };
    const expectEndsInDecider = (team1Left: boolean) =>
      expect(team1Left).toBe(false);

    it("should switch ends in the middle of the last game", () => {
      const umpire = team1Ends();
      expectEndsInDecider(umpire.team1Left);
    });

    it("should not switch ends again when the ends team scores again", () => {
      const umpire = team1Ends();
      umpire.pointScored(true);
      expectEndsInDecider(umpire.team1Left);
    });

    it("should not switch ends again when the other team scores", () => {
      const umpire = team1Ends();
      umpire.pointScored(false);
      expectEndsInDecider(umpire.team1Left);
    });

    it("should not switch ends again when other team scores ends score", () => {
      const umpire = team1Ends();
      umpire.pointScored(true);
      expectEndsInDecider(umpire.team1Left);
      scorePoints(umpire, false, 5);
      expectEndsInDecider(umpire.team1Left);
    });

    it("should switch ends in the last handicap game differently for each player", () => {
      const oneGameEach = () => {
        const umpire = new Umpire(
          {
            clearBy2: true,
            upTo: 31,
            numServes: 2,
            team1StartGameScore: 10,
            team2StartGameScore: 20,
          },
          false,
          3,
        );

        expect(umpire.team1Left).toBe(true);
        scorePoints(umpire, true, 21);
        scorePoints(umpire, false, 11);

        expect(umpire.team1Left).toBe(true);
        return umpire;
      };

      const shouldSwitchEnds = (isTeam1: boolean, pointsToMidway: number) => {
        const umpire = oneGameEach();
        scorePoints(umpire, isTeam1, pointsToMidway - 1);
        expect(umpire.team1Left).toBe(true);
        scorePoints(umpire, isTeam1, 1);
        expect(umpire.team1Left).toBe(false);
      };

      shouldSwitchEnds(true, 10);
      shouldSwitchEnds(false, 5);
    });

    it("should not switch ends when the match is won", () => {
      const umpire = getNormalSinglesBestOf5Umpire();
      expect(umpire.team1Left).toBe(true);
      scoreGames(umpire, true, 3);

      expect(umpire.team1Left).toBe(true);
    });
  });

  describe("serving", () => {
    describe("initial state", () => {
      it.each([2, 5])("should set remaining serves", (numServes) => {
        const umpire = new Umpire(
          {
            clearBy2: true,
            upTo: 11,
            numServes,
            team1StartGameScore: 0,
            team2StartGameScore: 0,
          },
          false,
          5,
        );
        expect(umpire.remainingServes).toBe(numServes);
      });

      it("should have undefined server and receiver", () => {
        const umpire = getAnUmpire();
        expect(umpire.server).toBeUndefined();
        expect(umpire.receiver).toBeUndefined();
      });

      it("should initialize available servers and receivers for singles", () => {
        const umpire = getNormalSinglesBestOf5Umpire();
        expect(umpire.availableServers).toEqual(singlesPlayers);
        expect(umpire.availableReceivers).toEqual([]);
      });

      it("should initialize available servers and receivers for doubles", () => {
        const umpire = getNormalDoublesBestOf5Umpire();
        expect(umpire.availableServers).toEqual(doublesPlayers);
        expect(umpire.availableReceivers).toHaveLength(0);
      });
    });
    describe("initial setting server", () => {
      describe("when singles", () => {
        const serverReceivers: Array<[Player, Player]> = [
          ["Team1Player1", "Team2Player1"],
          ["Team2Player1", "Team1Player1"],
        ];
        it.each(serverReceivers)(
          "should set the server and receiver",
          (server, expectedReceiver) => {
            const umpire = getNormalSinglesBestOf5Umpire();
            umpire.setServer(server);
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
            const umpire = getNormalDoublesBestOf5Umpire();
            umpire.setServer(server);
            expect(umpire.availableServers).toHaveLength(0);
            expect(umpire.availableReceivers).toEqual(expectedReceivers);
            expect(umpire.server).toEqual(server);
            expect(umpire.receiver).toBeUndefined();
          },
        );
      });
    });

    describe("initial setting receiver", () => {
      it("should set receiver if available receiver doubles", () => {
        const umpire = getNormalDoublesBestOf5Umpire();
        umpire.setServer("Team1Player1");

        umpire.setReceiver("Team2Player1");
        expect(umpire.receiver).toEqual<Player>("Team2Player1");
      });

      it("should throw for singles", () => {
        const umpire = getNormalSinglesBestOf5Umpire();
        umpire.setServer("Team1Player1");
        expect(() => umpire.setReceiver("Team2Player1")).toThrow();
      });
    });

    const expectSinglesServerReceiver = (
      umpire: Umpire,
      team1Serving: boolean,
    ) => {
      expect(umpire.server).toBe(
        team1Serving ? "Team1Player1" : "Team2Player1",
      );
      expect(umpire.receiver).toBe(
        team1Serving ? "Team2Player1" : "Team1Player1",
      );
    };

    describe("midgame", () => {
      it("should decrement remaining serves", () => {
        const umpire = getAnUmpire();
        umpire.pointScored(true);
        expect(umpire.remainingServes).toBe(1);
      });

      it.each([2, 5])(
        "should reset remaining serves after last remaining serve",
        (numServes: number) => {
          const umpire = new Umpire(
            {
              clearBy2: true,
              upTo: 11,
              numServes,
              team1StartGameScore: 0,
              team2StartGameScore: 0,
            },
            false,
            5,
          );

          umpire.setServer("Team1Player1");

          scorePoints(umpire, true, numServes);

          expect(umpire.remainingServes).toBe(numServes);
        },
      );

      it("should have 1 remaining serve when reach 10-10", () => {
        const umpire = new Umpire(
          {
            clearBy2: true,
            upTo: 11,
            numServes: 2,
            team1StartGameScore: 0,
            team2StartGameScore: 0,
          },
          false,
          5,
        );

        umpire.setServer("Team1Player1");

        scorePoints(umpire, true, 10);
        expect(umpire.remainingServes).toBe(2);
        scorePoints(umpire, false, 10);
        expect(umpire.remainingServes).toBe(1);
      });

      it.each([2, 5])(
        "should switch server / receiver in singles",
        (numServes) => {
          const umpire = new Umpire(
            {
              clearBy2: true,
              upTo: 11,
              numServes,
              team1StartGameScore: 0,
              team2StartGameScore: 0,
            },
            false,
            5,
          );

          const expectInitial = () => {
            expectSinglesServerReceiver(umpire, true);
          };
          umpire.setServer("Team1Player1");
          expectInitial();
          scorePoints(umpire, true, 1);
          expectInitial();
          scorePoints(umpire, true, numServes - 1);
          expectSinglesServerReceiver(umpire, false);
        },
      );

      it("should switch server / receiver on each point in normal singles from 10-10", () => {
        const umpire = getNormalSinglesBestOf5Umpire();
        umpire.setServer("Team1Player1");
        expectSinglesServerReceiver(umpire, true);
        scorePoints(umpire, true, 10);
        scorePoints(umpire, false, 10);
        expectSinglesServerReceiver(umpire, true); // multiple of 4 !
        scorePoints(umpire, true, 1);
        expectSinglesServerReceiver(umpire, false);
        scorePoints(umpire, false, 1);
        expectSinglesServerReceiver(umpire, true);
      });

      it("previous receiver shall become the server and the partner of the previous server shall become the receiver.", () => {
        const umpire = getNormalDoublesBestOf5Umpire();
        umpire.setServer("Team1Player1");
        umpire.setReceiver("Team2Player1");

        scorePoints(umpire, true, 2);
        expect(umpire.server).toBe("Team2Player1");
        expect(umpire.receiver).toBe("Team1Player2");

        scorePoints(umpire, true, 2);
        expect(umpire.server).toBe("Team1Player2");
        expect(umpire.receiver).toBe("Team2Player2");

        scorePoints(umpire, true, 2);
        expect(umpire.server).toBe("Team2Player2");
        expect(umpire.receiver).toBe("Team1Player1");

        // cycle begins
        scorePoints(umpire, true, 2);
        expect(umpire.server).toBe("Team1Player1");
        expect(umpire.receiver).toBe("Team2Player1");
      });
    });

    const scoreFirstDoublesGame = (server: Player, receiver: Player) => {
      const umpire = getNormalDoublesBestOf5Umpire();
      umpire.setServer(server);
      umpire.setReceiver(receiver);
      scoreGames(umpire, true, 1);
      return umpire;
    };

    describe("at the end of a game and match not won", () => {
      describe("singles", () => {
        it.each([true, false])(
          "should switch the initial server receiver after 1 game for singles",
          (team1ServeFirst) => {
            const umpire = getNormalSinglesBestOf5Umpire();
            umpire.setServer(team1ServeFirst ? "Team1Player1" : "Team2Player1");
            expectSinglesServerReceiver(umpire, team1ServeFirst);
            scoreGames(umpire, true, 1);

            expect(umpire.availableServers).toHaveLength(0);
            expect(umpire.availableReceivers).toHaveLength(0);

            expectSinglesServerReceiver(umpire, !team1ServeFirst);
          },
        );

        it.each([true, false])(
          "should revert back to the initial server receiver after 2 games for singles",
          (team1ServeFirst) => {
            const umpire = getNormalSinglesBestOf5Umpire();
            umpire.setServer(team1ServeFirst ? "Team1Player1" : "Team2Player1");
            expectSinglesServerReceiver(umpire, team1ServeFirst);
            scoreGames(umpire, true, 2);

            expect(umpire.availableServers).toHaveLength(0);
            expect(umpire.availableReceivers).toHaveLength(0);

            expectSinglesServerReceiver(umpire, team1ServeFirst);
          },
        );
      });

      describe("doubles", () => {
        it("should set the server and receiver to undefined", () => {
          const umpire = scoreFirstDoublesGame("Team1Player1", "Team2Player1");
          expect(umpire.server).toBeUndefined();
          expect(umpire.receiver).toBeUndefined();
        });
        it("should set the availableServers to the players in the team that did not serve at the beginning of the previous game", () => {
          const umpire = scoreFirstDoublesGame("Team1Player1", "Team2Player1");
          expect(umpire.availableServers).toEqual([
            "Team2Player1",
            "Team2Player2",
          ]);
          expect(umpire.availableReceivers).toHaveLength(0);
        });
      });
    });

    describe("setting doubles server at the begining of subsequent games", () => {
      it("should set receiver according to the rules when set server", () => {
        const umpire = scoreFirstDoublesGame("Team1Player1", "Team2Player1");
        umpire.setServer("Team2Player1");
        throw new Error("not implemented");
        //expect(umpire.receiver).toBe(".....");
      });
      it("should throw of not an available server", () => {
        const umpire = scoreFirstDoublesGame("Team1Player1", "Team2Player1");
        expect(() => umpire.setServer("Team1Player1")).toThrow();
        expect(() => umpire.setServer("Team1Player2")).toThrow();
      });
    });

    it("should have undefined server and receiver when match won", () => {
      const umpire = getNormalSinglesBestOf5Umpire();
      umpire.setServer("Team1Player1");
      scoreGames(umpire, true, 3);

      expect(umpire.availableServers).toHaveLength(0);
      expect(umpire.availableReceivers).toHaveLength(0);

      expect(umpire.server).toBeUndefined();
      expect(umpire.receiver).toBeUndefined();
    });

    it("should switch doubles receivers at ends", () => {
      throw new Error("not implemented");
    });
  });
});