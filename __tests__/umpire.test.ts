import {
  MatchWinState,
  MatchWinStateOptions,
  getMatchWinState,
} from "../src/umpire/helpers";
import {
  GameScore,
  Player,
  PointHistory,
  Team1Player,
  Team2Player,
  TeamScore,
  Umpire,
  availableServerReceiverChoice,
  getPlayers,
} from "../src/umpire/index";

import { HandicapOptions, shiftHandicap } from "../src/umpire/shiftHandicap";

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
    it("should have match win state not won", () => {
      expect(getAnUmpire().matchWinState).toBe(MatchWinState.NotWon);
    });
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

  describe("availableServerReceiverChoice", () => {
    describe("singles", () => {
      it("should be no choice to make if the initial server is set", () => {
        const choice = availableServerReceiverChoice(
          false,
          {
            firstDoublesReceiver: undefined,
            gameInitialServers: ["Team1Player1"],
          },
          1,
        );
        expect(choice.servers).toHaveLength(0);
        expect(choice.firstGameDoublesReceivers).toHaveLength(0);
      });

      it("should have both players as available servers and no receivers if the initial server is not set", () => {
        const choice = availableServerReceiverChoice(
          false,
          {
            firstDoublesReceiver: undefined,
            gameInitialServers: [],
          },
          1,
        );
        expect(choice.servers).toStrictEqual(["Team1Player1", "Team2Player1"]);
        expect(choice.firstGameDoublesReceivers).toHaveLength(0);
      });
    });

    describe("doubles", () => {
      describe("first game", () => {
        it("should have all players as available servers, no receivers if the initial server is not set", () => {
          const choice = availableServerReceiverChoice(
            true,
            {
              firstDoublesReceiver: undefined,
              gameInitialServers: [],
            },
            1,
          );
          expect(choice.servers).toStrictEqual([
            "Team1Player1",
            "Team1Player2",
            "Team2Player1",
            "Team2Player2",
          ]);
          expect(choice.firstGameDoublesReceivers).toHaveLength(0);
        });

        describe("initial server set", () => {
          it("should have no available servers if have set the initial server", () => {
            const choice = availableServerReceiverChoice(
              true,
              {
                firstDoublesReceiver: undefined,
                gameInitialServers: ["Team1Player1"],
              },
              1,
            );
            expect(choice.servers).toHaveLength(0);
          });

          it("should have no choices if have set the initial server and receiver", () => {
            const choice = availableServerReceiverChoice(
              true,
              {
                firstDoublesReceiver: "Team2Player1",
                gameInitialServers: ["Team1Player1"],
              },
              1,
            );

            expect(choice.firstGameDoublesReceivers).toHaveLength(0);
          });

          it("should require selecting the receiver from server opponents when not set", () => {
            const choice = availableServerReceiverChoice(
              true,
              {
                firstDoublesReceiver: undefined,
                gameInitialServers: ["Team1Player1"],
              },
              1,
            );

            expect(choice.firstGameDoublesReceivers).toStrictEqual([
              "Team2Player1",
              "Team2Player2",
            ]);

            const choice2 = availableServerReceiverChoice(
              true,
              {
                firstDoublesReceiver: undefined,
                gameInitialServers: ["Team1Player2"],
              },
              1,
            );

            expect(choice2.firstGameDoublesReceivers).toStrictEqual([
              "Team2Player1",
              "Team2Player2",
            ]);

            const choice3 = availableServerReceiverChoice(
              true,
              {
                firstDoublesReceiver: undefined,
                gameInitialServers: ["Team2Player1"],
              },
              1,
            );

            expect(choice3.firstGameDoublesReceivers).toStrictEqual([
              "Team1Player1",
              "Team1Player2",
            ]);

            const choice4 = availableServerReceiverChoice(
              true,
              {
                firstDoublesReceiver: undefined,
                gameInitialServers: ["Team2Player2"],
              },
              1,
            );

            expect(choice4.firstGameDoublesReceivers).toStrictEqual([
              "Team1Player1",
              "Team1Player2",
            ]);
          });
        });
      });
      describe("after the first game", () => {
        it.each([2, 3])(
          "should have no available receivers - game %p",
          (gameNumber) => {
            const choice = availableServerReceiverChoice(
              true,
              {
                firstDoublesReceiver: "Team2Player1",
                gameInitialServers: ["Team1Player1"],
              },
              gameNumber,
            );
            expect(choice.firstGameDoublesReceivers).toHaveLength(0);
          },
        );

        it("should have no choices if initial server for the game has been set", () => {
          const choice = availableServerReceiverChoice(
            true,
            {
              firstDoublesReceiver: "Team2Player1",
              gameInitialServers: ["Team1Player1", "Team2Player1"],
            },
            2,
          );
          expect(choice.servers).toHaveLength(0);
        });
        describe("initial server for game not set", () => {
          it("should have availableServers for the opposition team of the team that served first in the previous game", () => {
            const choice = availableServerReceiverChoice(
              true,
              {
                firstDoublesReceiver: "Team2Player1",
                gameInitialServers: ["Team1Player1"],
              },
              2,
            );
            expect(choice.servers).toEqual(["Team2Player1", "Team2Player2"]);

            const choice2 = availableServerReceiverChoice(
              true,
              {
                firstDoublesReceiver: "Team2Player1",
                gameInitialServers: ["Team1Player2"],
              },
              2,
            );
            expect(choice2.servers).toEqual(["Team2Player1", "Team2Player2"]);

            const choice3 = availableServerReceiverChoice(
              true,
              {
                firstDoublesReceiver: "Team1Player1",
                gameInitialServers: ["Team2Player1"],
              },
              2,
            );
            expect(choice3.servers).toEqual(["Team1Player1", "Team1Player2"]);

            const choice4 = availableServerReceiverChoice(
              true,
              {
                firstDoublesReceiver: "Team1Player1",
                gameInitialServers: ["Team2Player2"],
              },
              2,
            );
            expect(choice4.servers).toEqual(["Team1Player1", "Team1Player2"]);
          });
        });
      });
    });
  });

  const scorePoints = (umpire: Umpire, team1: boolean, n: number) => {
    [...Array(n)].forEach(() => umpire.pointScored(team1));
  };
  const oneThenOtherScores = (umpire: Umpire, n: number) => {
    for (let i = 0; i < n; i++) {
      umpire.pointScored(true);
      umpire.pointScored(false);
    }
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

    it("should have game won at 12-10 normal rules", () => {
      const umpire = getNormalSinglesBestOf5Umpire();

      scorePoints(umpire, true, 10);
      scorePoints(umpire, false, 12);

      expect(umpire.team1Score).toEqual<TeamScore>({
        gamesWon: 0,
        pointsWon: 0,
      });
      expect(umpire.team2Score).toEqual<TeamScore>({
        gamesWon: 1,
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
      expect(umpire.gameScores).toHaveLength(0);

      scorePoints(umpire, true, 7);
      expect(umpire.gameScores).toHaveLength(0);
      scoreGames(umpire, false, 1);
      expect(umpire.gameScores).toEqual<Array<GameScore>>([
        { team1Points: 7, team2Points: 11 },
      ]);

      scorePoints(umpire, false, 6);
      scoreGames(umpire, true, 1);

      expect(umpire.gameScores).toEqual<Array<GameScore>>([
        { team1Points: 7, team2Points: 11 },
        { team1Points: 11, team2Points: 6 },
      ]);

      scoreGames(umpire, true, 2);
      expect(umpire.gameScores).toEqual<Array<GameScore>>([
        { team1Points: 7, team2Points: 11 },
        { team1Points: 11, team2Points: 6 },
        { team1Points: 11, team2Points: 0 },
        { team1Points: 11, team2Points: 0 },
      ]);
    });

    describe("match win state", () => {
      describe("helper", () => {
        describe("clear by 2", () => {
          const normal11: MatchWinStateOptions = {
            clearBy2: true,
            upTo: 11,
            bestOf: 5,
          };
          it("should be NotWon at 0/0 - 0/0", () => {
            expect(
              getMatchWinState(
                normal11,
                {
                  gamesWon: 0,
                  pointsWon: 0,
                },
                {
                  gamesWon: 0,
                  pointsWon: 0,
                },
              ),
            ).toBe(MatchWinState.NotWon);
          });

          it("should be NotWon at 0/9 - 0/9", () => {
            expect(
              getMatchWinState(
                normal11,
                {
                  gamesWon: 0,
                  pointsWon: 9,
                },
                {
                  gamesWon: 0,
                  pointsWon: 9,
                },
              ),
            ).toBe(MatchWinState.NotWon);
          });

          it("should be NotWon at 1/0 - 0/0", () => {
            expect(
              getMatchWinState(
                normal11,
                {
                  gamesWon: 1,
                  pointsWon: 0,
                },
                {
                  gamesWon: 0,
                  pointsWon: 0,
                },
              ),
            ).toBe(MatchWinState.NotWon);
          });

          it("should be NotWon at 0/10 - 0/10", () => {
            expect(
              getMatchWinState(
                normal11,
                {
                  gamesWon: 0,
                  pointsWon: 10,
                },
                {
                  gamesWon: 0,
                  pointsWon: 10,
                },
              ),
            ).toBe(MatchWinState.NotWon);
          });

          it("should be NotWon at 0/11 - 0/11", () => {
            expect(
              getMatchWinState(
                normal11,
                {
                  gamesWon: 0,
                  pointsWon: 11,
                },
                {
                  gamesWon: 0,
                  pointsWon: 11,
                },
              ),
            ).toBe(MatchWinState.NotWon);
          });

          it("should be GamePointTeam1 at 0/10 - 0/9", () => {
            expect(
              getMatchWinState(
                normal11,
                {
                  gamesWon: 0,
                  pointsWon: 10,
                },
                {
                  gamesWon: 0,
                  pointsWon: 9,
                },
              ),
            ).toBe(MatchWinState.GamePointTeam1);
          });

          it("should be GamePointTeam2 at 0/9 - 0/10", () => {
            expect(
              getMatchWinState(
                normal11,
                {
                  gamesWon: 0,
                  pointsWon: 9,
                },
                {
                  gamesWon: 0,
                  pointsWon: 10,
                },
              ),
            ).toBe(MatchWinState.GamePointTeam2);
          });

          it("should be MatchPointTeam1 at 2/10 - 0/9", () => {
            expect(
              getMatchWinState(
                normal11,
                {
                  gamesWon: 2,
                  pointsWon: 10,
                },
                {
                  gamesWon: 0,
                  pointsWon: 9,
                },
              ),
            ).toBe(MatchWinState.MatchPointTeam1);
          });

          it("should be MatchPointTeam2 at 0/9 - 2/10", () => {
            expect(
              getMatchWinState(
                normal11,
                {
                  gamesWon: 0,
                  pointsWon: 9,
                },
                {
                  gamesWon: 2,
                  pointsWon: 10,
                },
              ),
            ).toBe(MatchWinState.MatchPointTeam2);
          });

          it("should be Team1Won at 3/0 - 0/0", () => {
            expect(
              getMatchWinState(
                normal11,
                {
                  gamesWon: 3,
                  pointsWon: 0,
                },
                {
                  gamesWon: 0,
                  pointsWon: 0,
                },
              ),
            ).toBe(MatchWinState.Team1Won);
          });

          it("should be Team2Won at 0/0 - 3/0", () => {
            expect(
              getMatchWinState(
                normal11,
                {
                  gamesWon: 0,
                  pointsWon: 0,
                },
                {
                  gamesWon: 3,
                  pointsWon: 0,
                },
              ),
            ).toBe(MatchWinState.Team2Won);
          });
        });
        describe("not clear by 2", () => {
          const hardBatBestOf3Options: MatchWinStateOptions = {
            clearBy2: false,
            upTo: 15,
            bestOf: 3,
          };
          it("should be NotWon at 0/11 - 0/0", () => {
            expect(
              getMatchWinState(
                hardBatBestOf3Options,
                {
                  gamesWon: 0,
                  pointsWon: 11,
                },
                {
                  gamesWon: 0,
                  pointsWon: 0,
                },
              ),
            ).toBe(MatchWinState.NotWon);
          });

          it("should be GamePointTeam1 at 0/14 - 0/0", () => {
            expect(
              getMatchWinState(
                hardBatBestOf3Options,
                {
                  gamesWon: 0,
                  pointsWon: 14,
                },
                {
                  gamesWon: 0,
                  pointsWon: 0,
                },
              ),
            ).toBe(MatchWinState.GamePointTeam1);
          });

          it("should be GamePointTeam2 at 0/0 - 0/14", () => {
            expect(
              getMatchWinState(
                hardBatBestOf3Options,
                {
                  gamesWon: 0,
                  pointsWon: 0,
                },
                {
                  gamesWon: 0,
                  pointsWon: 14,
                },
              ),
            ).toBe(MatchWinState.GamePointTeam2);
          });

          it("should be GamePointTeam1 & GamePointTeam2 at 0/14 - 0/14", () => {
            expect(
              getMatchWinState(
                hardBatBestOf3Options,
                {
                  gamesWon: 0,
                  pointsWon: 14,
                },
                {
                  gamesWon: 0,
                  pointsWon: 14,
                },
              ),
            ).toBe(MatchWinState.GamePointTeam1 + MatchWinState.GamePointTeam2);
          });

          it("should be MatchPointTeam1 & GamePointTeam2 at 1/14 - 0/14", () => {
            expect(
              getMatchWinState(
                hardBatBestOf3Options,
                {
                  gamesWon: 1,
                  pointsWon: 14,
                },
                {
                  gamesWon: 0,
                  pointsWon: 14,
                },
              ),
            ).toBe(
              MatchWinState.MatchPointTeam1 + MatchWinState.GamePointTeam2,
            );
          });

          it("should be MatchPointTeam2 & GamePointTeam1 at 0/14 - 1/14", () => {
            expect(
              getMatchWinState(
                hardBatBestOf3Options,
                {
                  gamesWon: 0,
                  pointsWon: 14,
                },
                {
                  gamesWon: 1,
                  pointsWon: 14,
                },
              ),
            ).toBe(
              MatchWinState.MatchPointTeam2 + MatchWinState.GamePointTeam1,
            );
          });

          it("should be MatchPointTeam1 & MatchPointTeam2 at 1/14 - 1/14", () => {
            const matchWinState = getMatchWinState(
              hardBatBestOf3Options,
              {
                gamesWon: 1,
                pointsWon: 14,
              },
              {
                gamesWon: 1,
                pointsWon: 14,
              },
            );

            expect(matchWinState).toBe(
              MatchWinState.MatchPointTeam1 + MatchWinState.MatchPointTeam2,
            );
          });
        });
      });

      describe("umpire", () => {
        describe("clear by 2", () => {
          it("should be NotWon at 0/9 - 0/9", () => {
            const umpire = getNormalSinglesBestOf5Umpire();
            scorePoints(umpire, true, 9);
            scorePoints(umpire, false, 9);

            expect(umpire.matchWinState).toBe(MatchWinState.NotWon);
          });

          it("should be NotWon at 1/0 - 0/0", () => {
            const umpire = getNormalSinglesBestOf5Umpire();
            scoreGames(umpire, true, 1);

            expect(umpire.matchWinState).toBe(MatchWinState.NotWon);
          });

          it("should be NotWon at 0/10 - 0/10", () => {
            const umpire = getNormalSinglesBestOf5Umpire();
            scorePoints(umpire, true, 10);
            scorePoints(umpire, false, 10);

            expect(umpire.matchWinState).toBe(MatchWinState.NotWon);
          });

          it("should be NotWon at 0/11 - 0/11", () => {
            const umpire = getNormalSinglesBestOf5Umpire();
            scorePoints(umpire, true, 10);
            scorePoints(umpire, false, 10);
            umpire.pointScored(true);
            umpire.pointScored(false);

            expect(umpire.matchWinState).toBe(MatchWinState.NotWon);
          });

          it("should be GamePointTeam1 at 0/10 - 0/9", () => {
            const umpire = getNormalSinglesBestOf5Umpire();
            scorePoints(umpire, true, 10);
            scorePoints(umpire, false, 9);

            expect(umpire.matchWinState).toBe(MatchWinState.GamePointTeam1);
          });

          it("should be GamePointTeam2 at 0/9 - 0/10", () => {
            const umpire = getNormalSinglesBestOf5Umpire();
            scorePoints(umpire, true, 9);
            scorePoints(umpire, false, 10);

            expect(umpire.matchWinState).toBe(MatchWinState.GamePointTeam2);
          });

          it("should be GamePointTeam2 at 0/12 - 0/13", () => {
            const umpire = getNormalSinglesBestOf5Umpire();
            oneThenOtherScores(umpire, 12);
            umpire.pointScored(false);

            expect(umpire.matchWinState).toBe(MatchWinState.GamePointTeam2);
          });

          it("should be MatchPointTeam1 at 2/10 - 2/0", () => {
            const umpire = getNormalSinglesBestOf5Umpire();
            umpire.setServer("Team1Player1");
            scoreGames(umpire, true, 2);
            scoreGames(umpire, false, 2);
            scorePoints(umpire, true, 10);

            expect(umpire.matchWinState).toBe(MatchWinState.MatchPointTeam1);
          });

          it("should be MatchPointTeam2 at 0/0 - 2/10", () => {
            const umpire = getNormalSinglesBestOf5Umpire();
            umpire.setServer("Team1Player1");
            scoreGames(umpire, false, 2);
            scorePoints(umpire, false, 10);

            expect(umpire.matchWinState).toBe(MatchWinState.MatchPointTeam2);
          });

          it("should be Team1Won at 3/0 - 0/0", () => {
            const umpire = getNormalSinglesBestOf5Umpire();
            umpire.setServer("Team1Player1");
            scoreGames(umpire, true, 3);

            expect(umpire.matchWinState).toBe(MatchWinState.Team1Won);
          });

          it("should be Team2Won at 0/0 - 3/0", () => {
            const umpire = getNormalSinglesBestOf5Umpire();
            umpire.setServer("Team1Player1");
            scoreGames(umpire, false, 3);

            expect(umpire.matchWinState).toBe(MatchWinState.Team2Won);
          });
        });
        describe("not clear by 2", () => {
          it("should be NotWon at 0/11 - 0/0", () => {
            const bestOf = 3;
            const umpire = getHardbatSinglesUmpire(bestOf);
            scorePoints(umpire, true, 11);

            expect(umpire.matchWinState).toBe(MatchWinState.NotWon);
          });

          it("should be GamePointTeam1 at 0/14 - 0/0", () => {
            const bestOf = 3;
            const umpire = getHardbatSinglesUmpire(bestOf);
            scorePoints(umpire, true, 14);

            expect(umpire.matchWinState).toBe(MatchWinState.GamePointTeam1);
          });

          it("should be GamePointTeam2 at 0/0 - 0/14", () => {
            const bestOf = 3;
            const umpire = getHardbatSinglesUmpire(bestOf);
            scorePoints(umpire, false, 14);

            expect(umpire.matchWinState).toBe(MatchWinState.GamePointTeam2);
          });

          it("should be GamePointTeam1 & GamePointTeam2 at 0/14 - 0/14", () => {
            const bestOf = 3;
            const umpire = getHardbatSinglesUmpire(bestOf);
            scorePoints(umpire, false, 14);
            scorePoints(umpire, true, 14);

            expect(umpire.matchWinState).toBe(
              MatchWinState.GamePointTeam1 + MatchWinState.GamePointTeam2,
            );
          });

          it("should be MatchPointTeam1 & GamePointTeam2 at 1/14 - 0/14", () => {
            const bestOf = 3;
            const umpire = getHardbatSinglesUmpire(bestOf);
            scorePoints(umpire, true, 15);
            scorePoints(umpire, true, 14);
            scorePoints(umpire, false, 14);

            expect(umpire.matchWinState).toBe(
              MatchWinState.MatchPointTeam1 + MatchWinState.GamePointTeam2,
            );
          });

          it("should be MatchPointTeam2 & GamePointTeam1 at 0/14 - 1/14", () => {
            const bestOf = 3;
            const umpire = getHardbatSinglesUmpire(bestOf);
            scorePoints(umpire, false, 15);
            scorePoints(umpire, true, 14);
            scorePoints(umpire, false, 14);

            expect(umpire.matchWinState).toBe(
              MatchWinState.MatchPointTeam2 + MatchWinState.GamePointTeam1,
            );
          });

          it("should be MatchPointTeam1 & MatchPointTeam2 at 1/14 - 1/14", () => {
            const bestOf = 3;
            const umpire = getHardbatSinglesUmpire(bestOf);
            scorePoints(umpire, false, 15);
            scorePoints(umpire, true, 15);
            scorePoints(umpire, true, 14);
            scorePoints(umpire, false, 14);

            expect(umpire.matchWinState).toBe(
              MatchWinState.MatchPointTeam1 + MatchWinState.MatchPointTeam2,
            );
          });
        });
      });
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
    interface RemainingServesTest {
      team1StartGameScore: number;
      team2StartGameScore: number;
      numServes: 2 | 5;
      expectedRemainingServes: number;
      description: string;
    }
    const remainingServesTests: RemainingServesTest[] = [
      {
        team1StartGameScore: 0,
        team2StartGameScore: 0,
        numServes: 2,
        expectedRemainingServes: 2,
        description: "0,0 2 = 2",
      },
      {
        team1StartGameScore: 0,
        team2StartGameScore: 0,
        numServes: 5,
        expectedRemainingServes: 5,
        description: "0,0 5 = 5",
      },
      {
        team1StartGameScore: 4,
        team2StartGameScore: 7,
        numServes: 5,
        expectedRemainingServes: 4,
        description: "4,7 5 = 4",
      },
      {
        team1StartGameScore: 15,
        team2StartGameScore: 8,
        numServes: 5,
        expectedRemainingServes: 2,
        description: "15,8 5 = 2",
      },
      {
        team1StartGameScore: 15,
        team2StartGameScore: 8,
        numServes: 2,
        expectedRemainingServes: 1,
        description: "15,8 2 = 1",
      },
      {
        team1StartGameScore: -5,
        team2StartGameScore: 3,
        numServes: 5,
        expectedRemainingServes: 2,
        description: "-5,3 5 = 2",
      },
      {
        team1StartGameScore: 3,
        team2StartGameScore: -5,
        numServes: 5,
        expectedRemainingServes: 2,
        description: "3,-5 5 = 2",
      },
    ];
    describe("initial state", () => {
      it.each(remainingServesTests)(
        "should set remaining serves $description",
        ({
          numServes,
          team1StartGameScore,
          team2StartGameScore,
          expectedRemainingServes,
        }) => {
          const umpire = new Umpire(
            {
              clearBy2: true,
              upTo: 31,
              numServes,
              team1StartGameScore,
              team2StartGameScore,
            },
            false,
            5,
          );
          expect(umpire.remainingServes).toBe(expectedRemainingServes);
        },
      );

      it("should have undefined server and receiver", () => {
        const umpire = getAnUmpire();
        expect(umpire.server).toBeUndefined();
        expect(umpire.receiver).toBeUndefined();
      });

      it("should initialize available servers and receivers for singles", () => {
        const umpire = getNormalSinglesBestOf5Umpire();
        const serviceReceiverChoice = umpire.serverReceiverChoice;
        expect(serviceReceiverChoice.servers).toEqual(singlesPlayers);
        expect(serviceReceiverChoice.firstGameDoublesReceivers).toEqual([]);
      });

      it("should initialize available servers and receivers for doubles", () => {
        const umpire = getNormalDoublesBestOf5Umpire();
        const serviceReceiverChoice = umpire.serverReceiverChoice;
        expect(serviceReceiverChoice.servers).toEqual(doublesPlayers);
        expect(serviceReceiverChoice.firstGameDoublesReceivers).toHaveLength(0);
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
            const serviceReceiverChoice = umpire.serverReceiverChoice;
            expect(serviceReceiverChoice.servers).toHaveLength(0);
            expect(
              serviceReceiverChoice.firstGameDoublesReceivers,
            ).toHaveLength(0);
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
            const serviceReceiverChoice = umpire.serverReceiverChoice;
            expect(serviceReceiverChoice.servers).toHaveLength(0);
            expect(serviceReceiverChoice.firstGameDoublesReceivers).toEqual(
              expectedReceivers,
            );
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

        umpire.setFirstGameDoublesReceiver("Team2Player1");
        expect(umpire.receiver).toEqual<Player>("Team2Player1");
      });

      it("should throw for singles", () => {
        const umpire = getNormalSinglesBestOf5Umpire();
        umpire.setServer("Team1Player1");
        expect(() =>
          umpire.setFirstGameDoublesReceiver("Team2Player1"),
        ).toThrow();
      });
    });

    const expectServerReceiver = (
      umpire: Umpire,
      expectedServer: Player,
      expectedReceiver: Player,
    ) => {
      expect(umpire.server).toBe(expectedServer);
      expect(umpire.receiver).toBe(expectedReceiver);
    };
    const expectSinglesServerReceiver = (
      umpire: Umpire,
      team1Serving: boolean,
    ) => {
      expectServerReceiver(
        umpire,
        team1Serving ? "Team1Player1" : "Team2Player1",
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
        umpire.setFirstGameDoublesReceiver("Team2Player1");

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
      umpire.setFirstGameDoublesReceiver(receiver);
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

            const serviceReceiverChoice = umpire.serverReceiverChoice;
            expect(serviceReceiverChoice.servers).toHaveLength(0);
            expect(
              serviceReceiverChoice.firstGameDoublesReceivers,
            ).toHaveLength(0);

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
            const serviceReceiverChoice = umpire.serverReceiverChoice;
            expect(serviceReceiverChoice.servers).toHaveLength(0);
            expect(
              serviceReceiverChoice.firstGameDoublesReceivers,
            ).toHaveLength(0);

            expectSinglesServerReceiver(umpire, team1ServeFirst);
          },
        );
        it.each(remainingServesTests)(
          "should set the start of game remaining serves $description",
          ({
            team1StartGameScore,
            team2StartGameScore,
            numServes,
            expectedRemainingServes,
          }) => {
            const umpire = new Umpire(
              {
                clearBy2: true,
                upTo: 31,
                numServes,
                team1StartGameScore,
                team2StartGameScore,
              },
              false,
              5,
            );

            scoreGames(umpire, true, 1, 31 - team1StartGameScore);

            expect(umpire.remainingServes).toBe(expectedRemainingServes);
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
          const serviceReceiverChoice = umpire.serverReceiverChoice;
          expect(serviceReceiverChoice.servers).toEqual([
            "Team2Player1",
            "Team2Player2",
          ]);
          expect(serviceReceiverChoice.firstGameDoublesReceivers).toHaveLength(
            0,
          );
        });
      });
    });

    describe("setting doubles server at the begining of subsequent games", () => {
      it("first receiver shall be the player who served to him or her in the preceding game - game 2 ( odd games played )", () => {
        const test = (
          server: Player,
          receiver: Player,
          nextServer: Player,
          expectedNextReceiver: Player,
        ) => {
          const umpire = scoreFirstDoublesGame(server, receiver);
          umpire.setServer(nextServer);
          expect(umpire.receiver).toBe(expectedNextReceiver);
        };
        test("Team1Player1", "Team2Player1", "Team2Player1", "Team1Player1");
        test("Team1Player1", "Team2Player1", "Team2Player2", "Team1Player2");
        test("Team2Player1", "Team1Player1", "Team1Player1", "Team2Player1");
        test("Team2Player1", "Team1Player1", "Team1Player2", "Team2Player2");
        test("Team1Player1", "Team2Player2", "Team2Player1", "Team1Player2");
        test("Team1Player1", "Team2Player2", "Team2Player2", "Team1Player1");
      });

      it("first receiver shall be the player who served to him or her in the preceding game - game 3 ( even games played )", () => {
        const test = (
          server: Player,
          receiver: Player,
          nextServer: Player,
          expectedNextReceiver: Player,
        ) => {
          const umpire = scoreFirstDoublesGame(server, receiver);
          umpire.setServer(receiver);
          scoreGames(umpire, true, 1);
          umpire.setServer(nextServer);
          expect(umpire.receiver).toBe(expectedNextReceiver);
        };
        test("Team1Player1", "Team2Player1", "Team1Player1", "Team2Player1");
        test("Team1Player1", "Team2Player1", "Team1Player2", "Team2Player2");
      });

      it("should throw if not an available server", () => {
        const umpire = scoreFirstDoublesGame("Team1Player1", "Team2Player1");
        expect(() => umpire.setServer("Team1Player1")).toThrow();
        expect(() => umpire.setServer("Team1Player2")).toThrow();
      });
    });

    it("should have undefined server and receiver when match won", () => {
      const umpire = getNormalSinglesBestOf5Umpire();
      umpire.setServer("Team1Player1");
      scoreGames(umpire, true, 3);

      const serviceReceiverChoice = umpire.serverReceiverChoice;
      expect(serviceReceiverChoice.servers).toHaveLength(0);
      expect(serviceReceiverChoice.firstGameDoublesReceivers).toHaveLength(0);

      expect(umpire.server).toBeUndefined();
      expect(umpire.receiver).toBeUndefined();
    });

    it("should switch doubles receivers at ends", () => {
      const test = (
        lastFirstServer: Team1Player,
        expectedReceiver: Team2Player,
      ) => {
        const umpire = getNormalDoublesBestOf5Umpire();
        umpire.setServer("Team1Player1");
        umpire.setFirstGameDoublesReceiver("Team2Player1");
        //cycle
        // Team1Player1 => Team2Player1
        // Team2Player1 => Team1Player2
        // Team1Player2 => Team2Player2
        // Team2Player2 => Team1Player1
        scoreGames(umpire, true, 1);

        umpire.setServer("Team2Player1");
        scoreGames(umpire, false, 1);

        umpire.setServer("Team1Player1");
        scoreGames(umpire, true, 1);

        umpire.setServer("Team2Player1");
        scoreGames(umpire, false, 1);

        //now 2-2 - even games played back to original cycle
        umpire.setServer(lastFirstServer);
        scorePoints(umpire, true, 4);
        const currentReceiver = umpire.receiver;
        scorePoints(umpire, true, 1);
        expect(umpire.receiver).not.toBe(currentReceiver);
        expect(umpire.receiver).toBe(expectedReceiver);
      };
      test("Team1Player1", "Team2Player1");
      test("Team1Player2", "Team2Player2");
    });

    it("after ends - previous receiver shall become the server and the partner of the previous server shall become the receiver", () => {
      const umpire = getNormalDoublesBestOf5Umpire();
      umpire.setServer("Team1Player1");
      umpire.setFirstGameDoublesReceiver("Team2Player1");

      scoreGames(umpire, true, 1);

      umpire.setServer("Team2Player1");
      scoreGames(umpire, false, 1);

      umpire.setServer("Team1Player1");
      scoreGames(umpire, true, 1);

      umpire.setServer("Team2Player1");
      scoreGames(umpire, false, 1);

      //cycle
      // Team1Player1 => Team2Player1
      // Team2Player1 => Team1Player2
      // Team1Player2 => Team2Player2
      // Team2Player2 => Team1Player1
      umpire.setServer("Team1Player1");
      scorePoints(umpire, true, 4);
      expectServerReceiver(umpire, "Team1Player2", "Team2Player2");
      scorePoints(umpire, true, 1);
      // cycle changes
      // Team1Player2 => Team2Player1
      // Team2Player1 => Team1Player1
      // Team1Player1 => Team2Player2
      // Team2Player2 => Team1Player2
      expectServerReceiver(umpire, "Team1Player2", "Team2Player1");
      scorePoints(umpire, true, 1);
      expectServerReceiver(umpire, "Team2Player1", "Team1Player1");
      scorePoints(umpire, false, 2);
      expectServerReceiver(umpire, "Team1Player1", "Team2Player2");
      scorePoints(umpire, false, 2);
      expectServerReceiver(umpire, "Team2Player2", "Team1Player2");
    });
  });

  describe("undoPoint", () => {
    describe("scoring", () => {
      it.each([true, false])(
        "should reduce pointsWon by one when not start of a game",
        (team2ScoresLast) => {
          const umpire = getAnUmpire();
          scorePoints(umpire, team2ScoresLast, 3);
          scorePoints(umpire, !team2ScoresLast, 2);

          umpire.undoPoint();
          expect(umpire.team1Score.pointsWon).toBe(!team2ScoresLast ? 1 : 3);
          expect(umpire.team2Score.pointsWon).toBe(team2ScoresLast ? 1 : 3);
        },
      );

      it("should remove from point history when not start of game", () => {
        const umpire = getAnUmpire();
        scorePoints(umpire, true, 3);
        scorePoints(umpire, false, 2);

        umpire.undoPoint();

        expect(umpire.pointHistory).toHaveLength(1);
        const points = umpire.pointHistory[0].map((point) => point.team1);
        expect(points).toStrictEqual([true, true, true, false]);
      });

      it("should have correct MatchWinState - from GamePointTeam1", () => {
        const umpire = getNormalSinglesBestOf5Umpire();
        scorePoints(umpire, true, 10);

        expect(umpire.matchWinState).toBe(MatchWinState.GamePointTeam1);

        umpire.undoPoint();

        expect(umpire.matchWinState).toBe(MatchWinState.NotWon);
      });

      it("should reduce gamesWon by one when start of a game - team1 scores last", () => {
        const umpire = getNormalSinglesBestOf5Umpire();
        scorePoints(umpire, true, 10);
        scorePoints(umpire, false, 1);
        scorePoints(umpire, true, 1);
        expect(umpire.gameScores).toHaveLength(1);
        expect(umpire.pointHistory).toHaveLength(2);

        umpire.undoPoint();

        expect(umpire.team1Score).toEqual<TeamScore>({
          gamesWon: 0,
          pointsWon: 10,
        });
        expect(umpire.team2Score).toEqual<TeamScore>({
          gamesWon: 0,
          pointsWon: 1,
        });
        expect(umpire.gameScores).toHaveLength(0);
        expect(umpire.pointHistory).toHaveLength(1);
      });

      it("should reduce gamesWon by one when start of a game - team2 scores last", () => {
        const umpire = getNormalSinglesBestOf5Umpire();
        scorePoints(umpire, false, 10);
        scorePoints(umpire, true, 1);
        scorePoints(umpire, false, 1);

        umpire.undoPoint();

        expect(umpire.team2Score).toEqual<TeamScore>({
          gamesWon: 0,
          pointsWon: 10,
        });
        expect(umpire.team1Score).toEqual<TeamScore>({
          gamesWon: 0,
          pointsWon: 1,
        });
        expect(umpire.gameScores).toHaveLength(0);
      });
    });

    describe("remaining serves", () => {
      interface RemainingServesCalculationTest {
        team1StartGameScore: number;
        team2StartGameScore: number;
        team1Points: number;
        team2Points: number;
        numServes: 2 | 5;
        expectedRemainingServes: number;
        description: string;
      }

      const getRemainingServesAtStartOfGame = (
        team1StartGameScore: number,
        team2StartGameScore: number,
        numServes: number,
      ): number => {
        const totalStartScores =
          Math.abs(team1StartGameScore) + Math.abs(team2StartGameScore);

        return numServes - (totalStartScores % numServes);
      };
      const getRemainingServes = (
        team1StartGameScore: number,
        team2StartGameScore: number,
        team1Points: number,
        team2Points: number,
        numServes: number,
      ) => {
        const remainingServesAtStartOfGame = getRemainingServesAtStartOfGame(
          team1StartGameScore,
          team2StartGameScore,
          numServes,
        );
        const totalPoints = team1Points + team2Points;
        const pointsScored =
          totalPoints - (team1StartGameScore + team2StartGameScore);
        if (pointsScored < remainingServesAtStartOfGame) {
          return remainingServesAtStartOfGame - pointsScored;
        }
        if (pointsScored === remainingServesAtStartOfGame) {
          return numServes;
        }
        const pointsScoredAfterInitialServer =
          pointsScored - remainingServesAtStartOfGame;
        return numServes - (pointsScoredAfterInitialServer % numServes);
      };

      const remainingServesCalculationTests: RemainingServesCalculationTest[] =
        [
          // non handicap
          {
            team1StartGameScore: 0,
            team2StartGameScore: 0,
            numServes: 2,
            expectedRemainingServes: 2,
            team1Points: 0,
            team2Points: 0,
            description: "No points scored non handicap 2 serves",
          },
          {
            team1StartGameScore: 0,
            team2StartGameScore: 0,
            numServes: 5,
            expectedRemainingServes: 5,
            team1Points: 0,
            team2Points: 0,
            description: "No points scored non handicap 5 serves",
          },
          {
            team1StartGameScore: 0,
            team2StartGameScore: 0,
            numServes: 5,
            expectedRemainingServes: 4,
            team1Points: 1,
            team2Points: 0,
            description: "Point scored non handicap 5 serves",
          },
          {
            team1StartGameScore: 0,
            team2StartGameScore: 0,
            numServes: 2,
            expectedRemainingServes: 1,
            team1Points: 1,
            team2Points: 0,
            description: "Point scored non handicap 2 serves",
          },
          {
            team1StartGameScore: 0,
            team2StartGameScore: 0,
            numServes: 2,
            expectedRemainingServes: 2,
            team1Points: 1,
            team2Points: 1,
            description: "Num serves scored non handicap 2 serves",
          },
          {
            team1StartGameScore: 0,
            team2StartGameScore: 0,
            numServes: 5,
            expectedRemainingServes: 5,
            team1Points: 3,
            team2Points: 2,
            description: "Num serves scored non handicap 5 serves",
          },
          {
            team1StartGameScore: 0,
            team2StartGameScore: 0,
            numServes: 5,
            expectedRemainingServes: 4,
            team1Points: 4,
            team2Points: 2,
            description: "Num serves scored + 1 non handicap 5 serves",
          },
          // handicap
          {
            team1StartGameScore: 1,
            team2StartGameScore: 0,
            numServes: 5,
            expectedRemainingServes: 4,
            team1Points: 1,
            team2Points: 0,
            description: "Handicap 1,0 no points scored 5 serves",
          },
          {
            team1StartGameScore: 0,
            team2StartGameScore: 1,
            numServes: 5,
            expectedRemainingServes: 4,
            team1Points: 0,
            team2Points: 1,
            description: "Handicap 0,1 no points scored 5 serves",
          },
          {
            team1StartGameScore: 0,
            team2StartGameScore: 2,
            numServes: 5,
            expectedRemainingServes: 3,
            team1Points: 0,
            team2Points: 2,
            description: "Handicap 0,2 no points scored 5 serves",
          },
          {
            team1StartGameScore: 0,
            team2StartGameScore: 3,
            numServes: 5,
            expectedRemainingServes: 2,
            team1Points: 0,
            team2Points: 3,
            description: "Handicap 0,3 no points scored 5 serves",
          },
          {
            team1StartGameScore: 0,
            team2StartGameScore: 4,
            numServes: 5,
            expectedRemainingServes: 1,
            team1Points: 0,
            team2Points: 4,
            description: "Handicap 0,4 no points scored 5 serves",
          },
          {
            team1StartGameScore: 0,
            team2StartGameScore: 6,
            numServes: 5,
            expectedRemainingServes: 4,
            team1Points: 0,
            team2Points: 6,
            description: "Handicap 0,6 no points scored 5 serves",
          },
          // negatives
          {
            team1StartGameScore: -1,
            team2StartGameScore: 1,
            numServes: 5,
            expectedRemainingServes: 3,
            team1Points: -1,
            team2Points: 1,
            description: "Handicap -1,1 no points scored 5 serves",
          },
          // ----------------------------------------------

          // scoring points
          {
            team1StartGameScore: 0,
            team2StartGameScore: 1,
            numServes: 5,
            expectedRemainingServes: 3,
            team1Points: 1,
            team2Points: 1,
            description: "Handicap 0,1 one point scored 5 serves",
          },
          {
            team1StartGameScore: 1,
            team2StartGameScore: 0,
            numServes: 5,
            expectedRemainingServes: 2,
            team1Points: 1,
            team2Points: 2,
            description: "Handicap 1,0 two points scored 5 serves",
          },
          {
            team1StartGameScore: 4,
            team2StartGameScore: 0,
            numServes: 5,
            expectedRemainingServes: 5,
            team1Points: 4,
            team2Points: 1,
            description:
              "Handicap 4,0 one point scored 5 serves - normal service resumes",
          },
        ];
      it.each(remainingServesCalculationTests)(
        "should calculate remaining serves $description",
        (testParameters) => {
          const remainingServes = getRemainingServes(
            testParameters.team1StartGameScore,
            testParameters.team2StartGameScore,
            testParameters.team1Points,
            testParameters.team2Points,
            testParameters.numServes,
          );
          expect(remainingServes).toEqual(
            testParameters.expectedRemainingServes,
          );
        },
      );
      // should be based solely on the number of points won and remaining serves at the start of the game
      // which is either num serves or less than
    });

    describe("ends", () => {
      it.each([true, false])(
        "should switch ends if undo after game won %p",
        (team1Left: boolean) => {
          const umpire = getNormalSinglesBestOf5Umpire();
          if (!team1Left) {
            umpire.switchEnds();
          }
          expect(umpire.team1Left).toBe(team1Left);
          scoreGames(umpire, true, 1);
          expect(umpire.team1Left).toBe(!team1Left);

          umpire.undoPoint();
          expect(umpire.team1Left).toBe(team1Left);
        },
      );
      it("should switch ends if have just switched ends in the decider", () => {
        const umpire = getNormalSinglesBestOf5Umpire();
        scoreGames(umpire, true, 2);
        scoreGames(umpire, false, 2);
        expect(umpire.team1Left).toBe(true);
        scorePoints(umpire, true, 4);
        expect(umpire.team1Left).toBe(true);
        umpire.pointScored(true);
        expect(umpire.team1Left).toBe(false);

        umpire.undoPoint();
        expect(umpire.team1Left).toBe(true);
      });
      it("should not switch ends after have switched ends in the decider", () => {
        const umpire = getNormalSinglesBestOf5Umpire();
        scoreGames(umpire, true, 2);
        scoreGames(umpire, false, 2);
        expect(umpire.team1Left).toBe(true);
        scorePoints(umpire, true, 6);

        expect(umpire.team1Left).toBe(false);

        umpire.undoPoint();
        expect(umpire.team1Left).toBe(false);
      });
    });
  });
});
