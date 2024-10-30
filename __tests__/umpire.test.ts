import {
  InitialServersDoublesReceiver,
  availableServerReceiverChoice,
} from "../src/umpire/availableServerReceiverChoice";
import {
  ServingState,
  getServerReceiver,
  shiftInCycle,
} from "../src/umpire/getServerReceiver";
import { getInitialServerReceiverForGame } from "../src/umpire/getInitialServerReceiverForGame";
import { MatchWinState } from "../src/umpire/matchWinState";
import {
  MatchWinStateOptions,
  MatchWinStatus,
  getMatchWinStatus,
} from "../src/umpire/getMatchWinStatus";
import {
  GameScore,
  MatchState,
  Player,
  PointHistory,
  PointState,
  SinglesPlayer,
  Team1Player,
  Team2Player,
  TeamScore,
  Umpire,
} from "../src/umpire/index";

import { HandicapOptions, shiftHandicap } from "../src/umpire/shiftHandicap";
import {
  Team,
  getDoublesPartner,
  getDoublesServiceCycle,
  getPlayers,
} from "../src/umpire/playersHelpers";
import { ServerReceiver } from "../src/umpire/commonTypes";
import { getLast } from "../src/helpers/getLast";
import { scoreGames, scorePoints } from "../src/umpire/umpireHelpers";

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
        bestOf,
      },
      false,
    );
  const getNormalSinglesBestOf5Umpire = () =>
    new Umpire(
      {
        clearBy2: true,
        upTo: 11,
        numServes: 2,
        team1StartGameScore: 0,
        team2StartGameScore: 0,
        bestOf: 5,
      },
      false,
    );

  const getNormalDoublesBestOf5Umpire = () =>
    new Umpire(
      {
        clearBy2: true,
        upTo: 11,
        numServes: 2,
        team1StartGameScore: 0,
        team2StartGameScore: 0,
        bestOf: 5,
      },
      true,
    );
  const getHardbatSinglesUmpire = (bestOf = 3) => {
    return new Umpire(
      {
        clearBy2: false,
        upTo: 15,
        numServes: 5,
        team1StartGameScore: 0,
        team2StartGameScore: 0,
        bestOf,
      },
      false,
    );
  };

  describe("initialization", () => {
    it("should have match win state not won", () => {
      expect(getAnUmpire().getMatchState().matchWinState).toBe(
        MatchWinState.NotWon,
      );
    });
    it("should have team1 left", () => {
      expect(getAnUmpire().getMatchState().team1Left).toBe(true);
    });

    it("should initialize scoring", () => {
      const matchState = new Umpire(
        {
          clearBy2: true,
          upTo: 11,
          numServes: 2,
          team1StartGameScore: -1,
          team2StartGameScore: -2,
          bestOf: 3,
        },
        false,
      ).getMatchState();

      expect(matchState.team1Score).toStrictEqual<TeamScore>({
        games: 0,
        points: -1,
      });
      expect(matchState.team2Score).toStrictEqual<TeamScore>({
        games: 0,
        points: -2,
      });
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

    describe("resetting", () => {
      describe("canResetServerReceiver", () => {
        it("should be true when have set and a point has not been scored", () => {
          let umpire = getNormalSinglesBestOf5Umpire();
          let matchState = umpire.getMatchState();
          expect(matchState.canResetServerReceiver).toBe(false);
          matchState = umpire.setServer("Team1Player1");
          expect(matchState.canResetServerReceiver).toBe(true);
          // not after a point has been scored
          matchState = umpire.pointScored(true);
          expect(matchState.canResetServerReceiver).toBe(false);
          // in singles can't reset server receiver after the first game
          matchState = scoreGames(umpire, false, 1);
          expect(matchState.canResetServerReceiver).toBe(false);

          umpire = getNormalDoublesBestOf5Umpire();
          matchState = umpire.setServer("Team1Player1");
          expect(matchState.canResetServerReceiver).toBe(false);
          matchState = umpire.setFirstGameDoublesReceiver("Team2Player1");
          expect(matchState.canResetServerReceiver).toBe(true);
          matchState = scoreGames(umpire, true, 1);
          expect(matchState.canResetServerReceiver).toBe(false);
          matchState = umpire.setServer("Team2Player1");
          expect(matchState.canResetServerReceiver).toBe(true);
          matchState = umpire.pointScored(true);
          expect(matchState.canResetServerReceiver).toBe(false);
        });
      });

      describe("resetServerReceiver", () => {
        it("should reset the server and receiver in game 1", () => {
          let umpire = getNormalSinglesBestOf5Umpire();
          let matchState = umpire.setServer("Team1Player1");
          expect(matchState.serverReceiverChoice.servers).toHaveLength(0);
          matchState = umpire.resetServerReceiver();
          expect(matchState.serverReceiverChoice.servers).toHaveLength(2);
          expect(matchState.server).toBeUndefined();
          expect(matchState.receiver).toBeUndefined();

          umpire = getNormalDoublesBestOf5Umpire();
          matchState = umpire.setServer("Team1Player1");
          expect(
            matchState.serverReceiverChoice.firstGameDoublesReceivers,
          ).toHaveLength(2);
          matchState = umpire.resetServerReceiver();
          expect(matchState.server).toBeUndefined();
          expect(matchState.receiver).toBeUndefined();
          expect(
            matchState.serverReceiverChoice.firstGameDoublesReceivers,
          ).toHaveLength(0);
        });
        it("should reset the server and receiver in doubles game 2", () => {
          const umpire = getNormalDoublesBestOf5Umpire();
          umpire.setServer("Team1Player1");
          umpire.setFirstGameDoublesReceiver("Team2Player1");
          scoreGames(umpire, true, 1);
          umpire.setServer("Team2Player1");
          const matchState = umpire.resetServerReceiver();
          expect(matchState.server).toBeUndefined();
          expect(matchState.receiver).toBeUndefined();
          expect(matchState.serverReceiverChoice.servers).toHaveLength(2);
          expect(
            matchState.serverReceiverChoice.firstGameDoublesReceivers,
          ).toHaveLength(0);
        });
      });
    });
  });

  const oneThenOtherScores = (umpire: Umpire, n: number) => {
    for (let i = 0; i < n; i++) {
      umpire.pointScored(true);
      umpire.pointScored(false);
    }
  };

  describe("scoring", () => {
    it.each([true, false])(
      "should increment points, Team 1 scores - %p",
      (team1Scores) => {
        const umpire = getAnUmpire();
        const matchState = umpire.pointScored(team1Scores);
        const incrementedTeamScore = team1Scores
          ? matchState.team1Score
          : matchState.team2Score;
        const notIncrementedTeamScore = team1Scores
          ? matchState.team2Score
          : matchState.team1Score;
        expect(incrementedTeamScore).toEqual<TeamScore>({
          games: 0,
          points: 1,
        });
        expect(notIncrementedTeamScore).toEqual<TeamScore>({
          games: 0,
          points: 0,
        });
      },
    );

    it("should increment games resetting points when game won", () => {
      const umpire = getNormalSinglesBestOf5Umpire();
      umpire.pointScored(false);
      const matchState = scoreGames(umpire, true, 1);
      expect(matchState.team1Score).toEqual<TeamScore>({
        games: 1,
        points: 0,
      });
      expect(matchState.team2Score).toEqual<TeamScore>({
        games: 0,
        points: 0,
      });
    });

    it("should not show start game scores when match won", () => {
      const umpire = new Umpire(
        {
          bestOf: 1,
          clearBy2: true,
          numServes: 2,
          team1StartGameScore: 4,
          team2StartGameScore: 5,
          upTo: 11,
        },
        false,
      );
      const matchState = scorePoints(umpire, true, 7);
      expect(matchState.team1Score).toEqual<TeamScore>({
        games: 1,
        points: 0,
      });
    });

    it.each([true, false])(
      "should increment correct games when go to deuce twice - team1 wins - %p",
      (team1Wins) => {
        const umpire = getNormalSinglesBestOf5Umpire();
        scorePoints(umpire, true, 10);
        scorePoints(umpire, false, 10);
        umpire.pointScored(true);
        umpire.pointScored(false);

        umpire.pointScored(team1Wins);
        const matchState = umpire.pointScored(team1Wins);

        const winTeamScore = team1Wins
          ? matchState.team1Score
          : matchState.team2Score;
        const loseTeamScore = !team1Wins
          ? matchState.team1Score
          : matchState.team2Score;
        expect(loseTeamScore).toEqual<TeamScore>({
          games: 0,
          points: 0,
        });
        expect(winTeamScore).toEqual<TeamScore>({
          games: 1,
          points: 0,
        });
      },
    );

    it("should have game won at 12-10 normal rules", () => {
      const umpire = getNormalSinglesBestOf5Umpire();

      scorePoints(umpire, true, 10);
      const matchState = scorePoints(umpire, false, 12);

      expect(matchState.team1Score).toEqual<TeamScore>({
        games: 0,
        points: 0,
      });
      expect(matchState.team2Score).toEqual<TeamScore>({
        games: 1,
        points: 0,
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
          bestOf: 3,
        },
        false,
      );

      umpire.pointScored(true);
      const matchState = scorePoints(umpire, false, 33);

      expect(matchState.team1Score).toStrictEqual<TeamScore>({
        games: 0,
        points: -1,
      });
      expect(matchState.team2Score).toStrictEqual<TeamScore>({
        games: 1,
        points: -2,
      });
    });

    it("should not win game if not clear by 2", () => {
      const clearBy2Umpire = getNormalSinglesBestOf5Umpire();
      scorePoints(clearBy2Umpire, true, 10);
      scorePoints(clearBy2Umpire, false, 10);
      let matchState = clearBy2Umpire.pointScored(true);
      expect(matchState.team1Score).toStrictEqual<TeamScore>({
        games: 0,
        points: 11,
      });
      expect(matchState.team2Score).toStrictEqual<TeamScore>({
        games: 0,
        points: 10,
      });

      const notClearBy2Umpire = getHardbatSinglesUmpire();
      scorePoints(notClearBy2Umpire, true, 14);
      scorePoints(notClearBy2Umpire, false, 14);
      matchState = notClearBy2Umpire.pointScored(false);
      expect(matchState.team1Score).toStrictEqual<TeamScore>({
        games: 0,
        points: 0,
      });
      expect(matchState.team2Score).toStrictEqual<TeamScore>({
        games: 1,
        points: 0,
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
      umpire.setServer("Team1Player1");
      let matchState = umpire.pointScored(true);
      expect(matchState.pointHistory[0][0]).toEqual<PointHistory>({
        team1WonPoint: true,
        date: dates[0],
        pointState: PointState.Default,
        server: "Team1Player1",
        receiver: "Team2Player1",
        team1Points: 1,
        team2Points: 0,
      });
      matchState = umpire.pointScored(false);
      expect(matchState.pointHistory[0][1]).toEqual<PointHistory>({
        team1WonPoint: false,
        date: dates[1],
        pointState: PointState.Default,
        server: "Team1Player1",
        receiver: "Team2Player1",
        team1Points: 1,
        team2Points: 1,
      });
      matchState = scorePoints(umpire, true, 9);
      expect(matchState.gameOrMatchPoints).toBe(9);
      matchState = umpire.pointScored(true);
      const lastPoint = getLast(matchState.pointHistory[0] as PointHistory[]);
      expect(lastPoint.pointState).toBe(PointState.GameWonTeam1);

      matchState = umpire.pointScored(true);
      expect(matchState.pointHistory[1][0]).toEqual<PointHistory>({
        team1WonPoint: true,
        date: dates[12],
        pointState: PointState.Default,
        server: "Team2Player1",
        receiver: "Team1Player1",
        team1Points: 1,
        team2Points: 0,
      });
    });

    it("should have correct point states", () => {
      let umpire = new Umpire(
        {
          clearBy2: true,
          upTo: 3,
          numServes: 2,
          team1StartGameScore: 0,
          team2StartGameScore: 0,
          bestOf: 3,
        },
        false,
      );

      const scorePointAndGetState = (team1: boolean) => {
        const matchState = umpire.pointScored(team1);

        const pointHistory = matchState.pointHistory;
        let lastGameHistory = getLast(pointHistory as PointHistory[][]);
        if (lastGameHistory.length === 0) {
          lastGameHistory = pointHistory[
            pointHistory.length - 2
          ] as PointHistory[];
        }
        return getLast(lastGameHistory).pointState;
      };

      // upTo 3 !

      expect(scorePointAndGetState(true)).toBe(PointState.Default); // 1-0
      expect(scorePointAndGetState(false)).toBe(PointState.Default); // 1-1
      expect(scorePointAndGetState(true)).toBe(PointState.GamePointTeam1); // 2-1
      expect(scorePointAndGetState(false)).toBe(PointState.Deuce); // 2-2
      expect(scorePointAndGetState(false)).toBe(PointState.GamePointTeam2); // 2-3
      expect(scorePointAndGetState(true)).toBe(PointState.Deuce); // 3-3
      umpire.pointScored(true);
      expect(scorePointAndGetState(true)).toBe(PointState.GameWonTeam1); // 5-3

      // game 2
      scorePoints(umpire, false, 2);
      expect(scorePointAndGetState(false)).toBe(PointState.GameWonTeam2);

      // decider
      umpire.pointScored(true);
      expect(scorePointAndGetState(true)).toBe(PointState.MatchPointTeam1); //2-0
      scorePoints(umpire, false, 2); //2-2
      expect(scorePointAndGetState(false)).toBe(PointState.MatchPointTeam2); //2-3
      expect(scorePointAndGetState(false)).toBe(PointState.Team2Won); //2-4

      umpire = new Umpire(
        {
          clearBy2: false,
          upTo: 3,
          numServes: 2,
          team1StartGameScore: 0,
          team2StartGameScore: 0,
          bestOf: 3,
        },
        false,
      );

      scorePoints(umpire, false, 2);
      umpire.pointScored(true);
      expect(scorePointAndGetState(true)).toBe(
        PointState.GamePointTeam1 + PointState.GamePointTeam2,
      ); //2-2 not deuce
      umpire.pointScored(true);

      // game 2
      umpire.pointScored(true);
      expect(scorePointAndGetState(true)).toBe(PointState.MatchPointTeam1);
      umpire.pointScored(false);
      expect(scorePointAndGetState(false)).toBe(
        PointState.MatchPointTeam1 + PointState.GamePointTeam2,
      );
      umpire.pointScored(false);

      //decider
      scorePoints(umpire, true, 2);
      umpire.pointScored(false);
      expect(scorePointAndGetState(false)).toBe(
        PointState.MatchPointTeam1 + PointState.MatchPointTeam2,
      );
      expect(scorePointAndGetState(true)).toBe(PointState.Team1Won);
    });

    it("should keep scores from previous games", () => {
      const umpire = getNormalSinglesBestOf5Umpire();
      expect(umpire.getMatchState().completedGameScores).toHaveLength(0);

      let matchState = scorePoints(umpire, true, 7);
      expect(matchState.completedGameScores).toHaveLength(0);
      matchState = scoreGames(umpire, false, 1);
      expect(matchState.completedGameScores).toEqual<GameScore[]>([
        { team1Points: 7, team2Points: 11 },
      ]);

      scorePoints(umpire, false, 6);
      matchState = scoreGames(umpire, true, 1);

      expect(matchState.completedGameScores).toEqual<GameScore[]>([
        { team1Points: 7, team2Points: 11 },
        { team1Points: 11, team2Points: 6 },
      ]);

      matchState = scoreGames(umpire, true, 2);
      expect(matchState.completedGameScores).toEqual<GameScore[]>([
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
              getMatchWinStatus(
                normal11,
                {
                  games: 0,
                  points: 0,
                },
                {
                  games: 0,
                  points: 0,
                },
              ).matchWinState,
            ).toBe(MatchWinState.NotWon);
          });

          it("should be NotWon at 0/9 - 0/9", () => {
            expect(
              getMatchWinStatus(
                normal11,
                {
                  games: 0,
                  points: 9,
                },
                {
                  games: 0,
                  points: 9,
                },
              ).matchWinState,
            ).toBe(MatchWinState.NotWon);
          });

          it("should be NotWon at 1/0 - 0/0", () => {
            expect(
              getMatchWinStatus(
                normal11,
                {
                  games: 1,
                  points: 0,
                },
                {
                  games: 0,
                  points: 0,
                },
              ).matchWinState,
            ).toBe(MatchWinState.NotWon);
          });

          it("should be NotWon at 0/10 - 0/10", () => {
            expect(
              getMatchWinStatus(
                normal11,
                {
                  games: 0,
                  points: 10,
                },
                {
                  games: 0,
                  points: 10,
                },
              ).matchWinState,
            ).toBe(MatchWinState.NotWon);
          });

          it("should be NotWon at 0/11 - 0/11", () => {
            expect(
              getMatchWinStatus(
                normal11,
                {
                  games: 0,
                  points: 11,
                },
                {
                  games: 0,
                  points: 11,
                },
              ).matchWinState,
            ).toBe(MatchWinState.NotWon);
          });

          it("should be GamePointTeam1 at 0/10 - 0/9", () => {
            expect(
              getMatchWinStatus(
                normal11,
                {
                  games: 0,
                  points: 10,
                },
                {
                  games: 0,
                  points: 9,
                },
              ),
            ).toEqual<MatchWinStatus>({
              matchWinState: MatchWinState.GamePointTeam1,
              gameOrMatchPoints: 1,
            });
          });

          it("should be GamePointTeam2 at 0/9 - 0/10 - 1 game point", () => {
            expect(
              getMatchWinStatus(
                normal11,
                {
                  games: 0,
                  points: 9,
                },
                {
                  games: 0,
                  points: 10,
                },
              ),
            ).toEqual<MatchWinStatus>({
              matchWinState: MatchWinState.GamePointTeam2,
              gameOrMatchPoints: 1,
            });
          });
          it("should be GamePointTeam2 at 0/8 - 0/10 - 2 game points", () => {
            expect(
              getMatchWinStatus(
                normal11,
                {
                  games: 0,
                  points: 8,
                },
                {
                  games: 0,
                  points: 10,
                },
              ),
            ).toEqual<MatchWinStatus>({
              matchWinState: MatchWinState.GamePointTeam2,
              gameOrMatchPoints: 2,
            });
          });

          it("should be MatchPointTeam1 at 2/10 - 0/9", () => {
            expect(
              getMatchWinStatus(
                normal11,
                {
                  games: 2,
                  points: 10,
                },
                {
                  games: 0,
                  points: 9,
                },
              ).matchWinState,
            ).toBe(MatchWinState.MatchPointTeam1);
          });

          it("should be MatchPointTeam2 at 0/9 - 2/10", () => {
            expect(
              getMatchWinStatus(
                normal11,
                {
                  games: 0,
                  points: 9,
                },
                {
                  games: 2,
                  points: 10,
                },
              ).matchWinState,
            ).toBe(MatchWinState.MatchPointTeam2);
          });

          it("should be Team1Won at 3/0 - 0/0", () => {
            expect(
              getMatchWinStatus(
                normal11,
                {
                  games: 3,
                  points: 0,
                },
                {
                  games: 0,
                  points: 0,
                },
              ).matchWinState,
            ).toBe(MatchWinState.Team1Won);
          });

          it("should be Team2Won at 0/0 - 3/0", () => {
            expect(
              getMatchWinStatus(
                normal11,
                {
                  games: 0,
                  points: 0,
                },
                {
                  games: 3,
                  points: 0,
                },
              ).matchWinState,
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
              getMatchWinStatus(
                hardBatBestOf3Options,
                {
                  games: 0,
                  points: 11,
                },
                {
                  games: 0,
                  points: 0,
                },
              ).matchWinState,
            ).toBe(MatchWinState.NotWon);
          });

          it("should be GamePointTeam1 at 0/14 - 0/13", () => {
            expect(
              getMatchWinStatus(
                hardBatBestOf3Options,
                {
                  games: 0,
                  points: 14,
                },
                {
                  games: 0,
                  points: 13,
                },
              ),
            ).toEqual<MatchWinStatus>({
              matchWinState: MatchWinState.GamePointTeam1,
              gameOrMatchPoints: 2,
            });
          });

          it("should be GamePointTeam2 at 0/0 - 0/14", () => {
            expect(
              getMatchWinStatus(
                hardBatBestOf3Options,
                {
                  games: 0,
                  points: 0,
                },
                {
                  games: 0,
                  points: 14,
                },
              ).matchWinState,
            ).toBe(MatchWinState.GamePointTeam2);
          });

          it("should be GamePointTeam1 & GamePointTeam2 at 0/14 - 0/14", () => {
            expect(
              getMatchWinStatus(
                hardBatBestOf3Options,
                {
                  games: 0,
                  points: 14,
                },
                {
                  games: 0,
                  points: 14,
                },
              ),
            ).toEqual<MatchWinStatus>({
              matchWinState:
                MatchWinState.GamePointTeam1 + MatchWinState.GamePointTeam2,
              gameOrMatchPoints: 1,
            });
          });

          it("should be MatchPointTeam1 & GamePointTeam2 at 1/14 - 0/14", () => {
            expect(
              getMatchWinStatus(
                hardBatBestOf3Options,
                {
                  games: 1,
                  points: 14,
                },
                {
                  games: 0,
                  points: 14,
                },
              ).matchWinState,
            ).toBe(
              MatchWinState.MatchPointTeam1 + MatchWinState.GamePointTeam2,
            );
          });

          it("should be MatchPointTeam2 & GamePointTeam1 at 0/14 - 1/14", () => {
            expect(
              getMatchWinStatus(
                hardBatBestOf3Options,
                {
                  games: 0,
                  points: 14,
                },
                {
                  games: 1,
                  points: 14,
                },
              ).matchWinState,
            ).toBe(
              MatchWinState.MatchPointTeam2 + MatchWinState.GamePointTeam1,
            );
          });

          it("should be MatchPointTeam1 & MatchPointTeam2 at 1/14 - 1/14", () => {
            const matchWinState = getMatchWinStatus(
              hardBatBestOf3Options,
              {
                games: 1,
                points: 14,
              },
              {
                games: 1,
                points: 14,
              },
            );

            expect(matchWinState.matchWinState).toBe(
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
            const matchState = scorePoints(umpire, false, 9);

            expect(matchState.matchWinState).toBe(MatchWinState.NotWon);
          });

          it("should be NotWon at 1/0 - 0/0", () => {
            const umpire = getNormalSinglesBestOf5Umpire();
            const matchState = scoreGames(umpire, true, 1);

            expect(matchState.matchWinState).toBe(MatchWinState.NotWon);
          });

          it("should be NotWon at 0/10 - 0/10", () => {
            const umpire = getNormalSinglesBestOf5Umpire();
            scorePoints(umpire, true, 10);
            const matchState = scorePoints(umpire, false, 10);

            expect(matchState.matchWinState).toBe(MatchWinState.NotWon);
          });

          it("should be NotWon at 0/11 - 0/11", () => {
            const umpire = getNormalSinglesBestOf5Umpire();
            scorePoints(umpire, true, 10);
            scorePoints(umpire, false, 10);
            umpire.pointScored(true);
            const matchState = umpire.pointScored(false);

            expect(matchState.matchWinState).toBe(MatchWinState.NotWon);
          });

          it("should be GamePointTeam1 at 0/10 - 0/9", () => {
            const umpire = getNormalSinglesBestOf5Umpire();
            scorePoints(umpire, true, 10);
            const matchState = scorePoints(umpire, false, 9);

            expect(matchState.matchWinState).toBe(MatchWinState.GamePointTeam1);
          });

          it("should be GamePointTeam2 at 0/9 - 0/10", () => {
            const umpire = getNormalSinglesBestOf5Umpire();
            scorePoints(umpire, true, 9);
            const matchState = scorePoints(umpire, false, 10);

            expect(matchState.matchWinState).toBe(MatchWinState.GamePointTeam2);
          });

          it("should be GamePointTeam2 at 0/12 - 0/13", () => {
            const umpire = getNormalSinglesBestOf5Umpire();
            oneThenOtherScores(umpire, 12);
            const matchState = umpire.pointScored(false);

            expect(matchState.matchWinState).toBe(MatchWinState.GamePointTeam2);
          });

          it("should be MatchPointTeam1 at 2/10 - 2/0", () => {
            const umpire = getNormalSinglesBestOf5Umpire();
            umpire.setServer("Team1Player1");
            scoreGames(umpire, true, 2);
            scoreGames(umpire, false, 2);
            const matchState = scorePoints(umpire, true, 10);

            expect(matchState.matchWinState).toBe(
              MatchWinState.MatchPointTeam1,
            );
          });

          it("should be MatchPointTeam2 at 0/0 - 2/10", () => {
            const umpire = getNormalSinglesBestOf5Umpire();
            umpire.setServer("Team1Player1");
            scoreGames(umpire, false, 2);
            const matchState = scorePoints(umpire, false, 10);

            expect(matchState.matchWinState).toBe(
              MatchWinState.MatchPointTeam2,
            );
          });

          it("should be Team1Won at 3/0 - 0/0", () => {
            const umpire = getNormalSinglesBestOf5Umpire();
            umpire.setServer("Team1Player1");
            const matchState = scoreGames(umpire, true, 3);

            expect(matchState.matchWinState).toBe(MatchWinState.Team1Won);
          });

          it("should be Team2Won at 0/0 - 3/0", () => {
            const umpire = getNormalSinglesBestOf5Umpire();
            umpire.setServer("Team1Player1");
            const matchState = scoreGames(umpire, false, 3);

            expect(matchState.matchWinState).toBe(MatchWinState.Team2Won);
          });
        });
        describe("not clear by 2", () => {
          it("should be NotWon at 0/11 - 0/0", () => {
            const bestOf = 3;
            const umpire = getHardbatSinglesUmpire(bestOf);
            const matchState = scorePoints(umpire, true, 11);

            expect(matchState.matchWinState).toBe(MatchWinState.NotWon);
          });

          it("should be GamePointTeam1 at 0/14 - 0/0", () => {
            const bestOf = 3;
            const umpire = getHardbatSinglesUmpire(bestOf);
            const matchState = scorePoints(umpire, true, 14);

            expect(matchState.matchWinState).toBe(MatchWinState.GamePointTeam1);
          });

          it("should be GamePointTeam2 at 0/0 - 0/14", () => {
            const bestOf = 3;
            const umpire = getHardbatSinglesUmpire(bestOf);
            const matchState = scorePoints(umpire, false, 14);

            expect(matchState.matchWinState).toBe(MatchWinState.GamePointTeam2);
          });

          it("should be GamePointTeam1 & GamePointTeam2 at 0/14 - 0/14", () => {
            const bestOf = 3;
            const umpire = getHardbatSinglesUmpire(bestOf);
            scorePoints(umpire, false, 14);
            const matchState = scorePoints(umpire, true, 14);

            expect(matchState.matchWinState).toBe(
              MatchWinState.GamePointTeam1 + MatchWinState.GamePointTeam2,
            );
          });

          it("should be MatchPointTeam1 & GamePointTeam2 at 1/14 - 0/14", () => {
            const bestOf = 3;
            const umpire = getHardbatSinglesUmpire(bestOf);
            scorePoints(umpire, true, 15);
            scorePoints(umpire, true, 14);
            const matchState = scorePoints(umpire, false, 14);

            expect(matchState.matchWinState).toBe(
              MatchWinState.MatchPointTeam1 + MatchWinState.GamePointTeam2,
            );
          });

          it("should be MatchPointTeam2 & GamePointTeam1 at 0/14 - 1/14", () => {
            const bestOf = 3;
            const umpire = getHardbatSinglesUmpire(bestOf);
            scorePoints(umpire, false, 15);
            scorePoints(umpire, true, 14);
            const matchState = scorePoints(umpire, false, 14);

            expect(matchState.matchWinState).toBe(
              MatchWinState.MatchPointTeam2 + MatchWinState.GamePointTeam1,
            );
          });

          it("should be MatchPointTeam1 & MatchPointTeam2 at 1/14 - 1/14", () => {
            const bestOf = 3;
            const umpire = getHardbatSinglesUmpire(bestOf);
            scorePoints(umpire, false, 15);
            scorePoints(umpire, true, 15);
            scorePoints(umpire, true, 14);
            const matchState = scorePoints(umpire, false, 14);

            expect(matchState.matchWinState).toBe(
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
      expect(umpire.switchEnds().team1Left).toBe(false);
    });

    it("should switch ends after game", () => {
      const umpire = getNormalSinglesBestOf5Umpire();
      [...Array(10)].forEach(() => {
        const matchState = umpire.pointScored(true);
        expect(matchState.team1Left).toBe(true);
      });

      const matchState = umpire.pointScored(true);
      expect(matchState.team1Left).toBe(false);
    });

    const team1Ends = () => {
      const umpire = getNormalSinglesBestOf5Umpire();
      let matchState = scoreGames(umpire, true, 2);
      expect(matchState.team1Left).toBe(true);
      matchState = scoreGames(umpire, false, 2);
      expect(matchState.team1Left).toBe(true);
      scorePoints(umpire, true, 5);
      return umpire;
    };
    const expectEndsInDecider = (team1Left: boolean) =>
      expect(team1Left).toBe(false);

    it("should switch ends in the middle of the last game", () => {
      const umpire = team1Ends();
      const matchState = umpire.getMatchState();
      expect(matchState.isEnds).toBe(true);
      expectEndsInDecider(matchState.team1Left);
    });

    it("should not switch ends again when the ends team scores again", () => {
      const umpire = team1Ends();
      const matchState = umpire.pointScored(true);
      expectEndsInDecider(matchState.team1Left);
      expect(matchState.isEnds).toBe(false);
    });

    it("should not switch ends again when the other team scores", () => {
      const umpire = team1Ends();
      const matchState = umpire.pointScored(false);
      expectEndsInDecider(matchState.team1Left);
    });

    it("should not switch ends again when other team scores ends score", () => {
      const umpire = team1Ends();
      let matchState = umpire.pointScored(true);
      expectEndsInDecider(matchState.team1Left);
      matchState = scorePoints(umpire, false, 5);
      expectEndsInDecider(matchState.team1Left);
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
            bestOf: 3,
          },
          false,
        );

        scorePoints(umpire, true, 21);
        const matchState = scorePoints(umpire, false, 11);

        expect(matchState.team1Left).toBe(true);
        return umpire;
      };

      const shouldSwitchEnds = (isTeam1: boolean, pointsToMidway: number) => {
        const umpire = oneGameEach();
        let matchState = scorePoints(umpire, isTeam1, pointsToMidway - 1);
        expect(matchState.team1Left).toBe(true);
        matchState = scorePoints(umpire, isTeam1, 1);
        expect(matchState.team1Left).toBe(false);
      };

      shouldSwitchEnds(true, 10);
      shouldSwitchEnds(false, 5);
    });

    it("should not switch ends when the match is won", () => {
      const umpire = getNormalSinglesBestOf5Umpire();
      const matchState = scoreGames(umpire, true, 3);

      expect(matchState.team1Left).toBe(true);
    });
  });

  describe("serving", () => {
    test("shiftInCycle", () => {
      expect(shiftInCycle(0, 2, 1)).toBe(1);
      expect(shiftInCycle(0, 2, 2)).toBe(0);
      expect(shiftInCycle(1, 2, 1)).toBe(0);
      expect(shiftInCycle(1, 2, 2)).toBe(1);
    });
    interface ExpectedServerReceiver {
      expectedServer: Player;
      expectedReceiver: Player;
    }
    describe("getInitialServerReceiverForGame function", () => {
      interface GetInitialServerReceiverForGameTest
        extends ExpectedServerReceiver {
        description: string;
        initialServersDoublesReceiver: InitialServersDoublesReceiver;
        gameNumber: number;
      }
      const getInitialServerReceiverForGameTests: GetInitialServerReceiverForGameTest[] =
        [
          // singles
          {
            gameNumber: 1,
            initialServersDoublesReceiver: {
              firstDoublesReceiver: undefined,
              gameInitialServers: ["Team1Player1"],
            },
            expectedServer: "Team1Player1",
            expectedReceiver: "Team2Player1",
            description: "singles game 1 - Team1Player1 serves game 1",
          },
          {
            gameNumber: 1,
            initialServersDoublesReceiver: {
              firstDoublesReceiver: undefined,
              gameInitialServers: ["Team2Player1"],
            },
            expectedServer: "Team2Player1",
            expectedReceiver: "Team1Player1",
            description: "singles game 1 - Team1Player2 serves game 1",
          },
          {
            gameNumber: 2,
            initialServersDoublesReceiver: {
              firstDoublesReceiver: undefined,
              gameInitialServers: ["Team1Player1"],
            },
            expectedServer: "Team2Player1",
            expectedReceiver: "Team1Player1",
            description: "singles game 2 - Team1Player1 serves game 1",
          },
          {
            gameNumber: 2,
            initialServersDoublesReceiver: {
              firstDoublesReceiver: undefined,
              gameInitialServers: ["Team2Player1"],
            },
            expectedServer: "Team1Player1",
            expectedReceiver: "Team2Player1",
            description: "singles game 2 - Team1Player2 serves game 1",
          },
          {
            gameNumber: 3,
            initialServersDoublesReceiver: {
              firstDoublesReceiver: undefined,
              gameInitialServers: ["Team1Player1"],
            },
            expectedServer: "Team1Player1",
            expectedReceiver: "Team2Player1",
            description: "singles game 3 - Team1Player1 serves game 1",
          },
          {
            gameNumber: 3,
            initialServersDoublesReceiver: {
              firstDoublesReceiver: undefined,
              gameInitialServers: ["Team2Player1"],
            },
            expectedServer: "Team2Player1",
            expectedReceiver: "Team1Player1",
            description: "singles game 3 - Team1Player2 serves game 1",
          },
          // doubles first game
          {
            gameNumber: 1,
            initialServersDoublesReceiver: {
              gameInitialServers: ["Team1Player1"],
              firstDoublesReceiver: "Team2Player1",
            },
            expectedServer: "Team1Player1",
            expectedReceiver: "Team2Player1",
            description:
              "doubles game 1 - Team1Player1 serves to first receiver",
          },
          {
            gameNumber: 1,
            initialServersDoublesReceiver: {
              gameInitialServers: ["Team2Player2"],
              firstDoublesReceiver: "Team1Player2",
            },
            expectedServer: "Team2Player2",
            expectedReceiver: "Team1Player2",
            description:
              "doubles game 1 - Team2Player2 serves to first receiver",
          },
          // even game
          {
            gameNumber: 2,
            initialServersDoublesReceiver: {
              gameInitialServers: ["Team1Player1", "Team2Player1"],
              firstDoublesReceiver: "Team2Player1",
            },
            expectedServer: "Team2Player1",
            expectedReceiver: "Team1Player1",
            description:
              "doubles game 2 - Team1Player1 => Team2Player1, Team2Player1 =>  Team1Player1",
          },
          {
            gameNumber: 2,
            initialServersDoublesReceiver: {
              gameInitialServers: ["Team1Player1", "Team2Player2"],
              firstDoublesReceiver: "Team2Player1",
            },
            expectedServer: "Team2Player2",
            expectedReceiver: "Team1Player2",
            description:
              "doubles game 2 - Team1Player1 => Team2Player1, Team2Player2 => Team1Player2",
          },
          // other first receiver
          {
            gameNumber: 2,
            initialServersDoublesReceiver: {
              gameInitialServers: ["Team1Player1", "Team2Player1"],
              firstDoublesReceiver: "Team2Player2",
            },
            expectedServer: "Team2Player1",
            expectedReceiver: "Team1Player2",
            description:
              "doubles game 2 - Team1Player1 => Team2Player2, Team2Player1 => Team1Player2",
          },

          // other team player as first server
          {
            gameNumber: 2,
            initialServersDoublesReceiver: {
              gameInitialServers: ["Team1Player2", "Team2Player1"],
              firstDoublesReceiver: "Team2Player2",
            },
            expectedServer: "Team2Player1",
            expectedReceiver: "Team1Player1",
            description:
              "doubles game 2 - Team1Player2 => Team2Player2, Team2Player2 => Team1Player1",
          },
          {
            gameNumber: 2,
            initialServersDoublesReceiver: {
              gameInitialServers: ["Team1Player2", "Team2Player2"],
              firstDoublesReceiver: "Team2Player2",
            },
            expectedServer: "Team2Player2",
            expectedReceiver: "Team1Player2",
            description:
              "doubles game 2 - Team1Player2 => Team2Player2, Team2Player2 => Team1Player2",
          },
          // odd game - back to original cycle
          {
            gameNumber: 3,
            initialServersDoublesReceiver: {
              gameInitialServers: [
                "Team1Player1",
                "Team2Player2",
                "Team1Player1",
              ],
              firstDoublesReceiver: "Team2Player2",
            },
            expectedServer: "Team1Player1",
            expectedReceiver: "Team2Player2",
            description:
              "doubles game 2 - Team1Player2 => Team2Player2,.. Team1Player1 => Team2Player2",
          },
          {
            gameNumber: 3,
            initialServersDoublesReceiver: {
              gameInitialServers: [
                "Team1Player1",
                "Team2Player2",
                "Team1Player2",
              ],
              firstDoublesReceiver: "Team2Player2",
            },
            expectedServer: "Team1Player2",
            expectedReceiver: "Team2Player1",
            description:
              "doubles game 2 - Team1Player2 => Team2Player2,.. Team1Player2 => Team2Player1",
          },
        ];
      it.each(getInitialServerReceiverForGameTests)(
        "should return the correct initial server and receiver - $description",
        ({
          initialServersDoublesReceiver,
          gameNumber: ganeNumber,
          expectedServer,
          expectedReceiver,
        }) => {
          const { server, receiver } = getInitialServerReceiverForGame(
            initialServersDoublesReceiver,
            ganeNumber,
          );
          expect(server).toBe(expectedServer);
          expect(receiver).toBe(expectedReceiver);
        },
      );
    });

    describe("getDoublesServiceCycle function", () => {
      interface GetDoublesServiceCycleTest {
        initialServer: Player;
        initialReceiver: Player;
        expectedCycle: ServerReceiver[];
      }
      const getDoublesServiceCycleTests: GetDoublesServiceCycleTest[] = [
        {
          initialServer: "Team1Player1",
          initialReceiver: "Team2Player1",
          expectedCycle: [
            {
              server: "Team1Player1",
              receiver: "Team2Player1",
            },
            {
              server: "Team2Player1",
              receiver: "Team1Player2",
            },
            {
              server: "Team1Player2",
              receiver: "Team2Player2",
            },
            {
              server: "Team2Player2",
              receiver: "Team1Player1",
            },
          ],
        },
        {
          initialServer: "Team2Player2",
          initialReceiver: "Team1Player1",
          expectedCycle: [
            {
              server: "Team2Player2",
              receiver: "Team1Player1",
            },
            {
              server: "Team1Player1",
              receiver: "Team2Player1",
            },
            {
              server: "Team2Player1",
              receiver: "Team1Player2",
            },
            {
              server: "Team1Player2",
              receiver: "Team2Player2",
            },
          ],
        },
      ];
      it.each(getDoublesServiceCycleTests)(
        "should return the correct service cycle - $initialServer, $initialReceiver",
        ({ initialServer, initialReceiver, expectedCycle }) => {
          const cycle = getDoublesServiceCycle(initialServer, initialReceiver);
          expect(cycle).toEqual(expectedCycle);
        },
      );
    });

    describe("getServerReceiver function", () => {
      interface ServerReceiverTest
        extends ServingState,
          ExpectedServerReceiver {
        description: string;
      }
      const tests: ServerReceiverTest[] = [
        {
          initialServer: "Team1Player1",
          initialReceiver: "Team2Player1",
          doublesEndsPoints: undefined, // singles
          alternateServesAt: 10,
          numServes: 2,
          pointsWon: 0,
          remainingServesAtStartOfGame: 2,
          team1Points: 0,
          team2Points: 0,
          expectedServer: "Team1Player1",
          expectedReceiver: "Team2Player1",
          description: "Normal singles - no score",
        },
        {
          initialServer: "Team2Player1",
          initialReceiver: "Team1Player1",
          doublesEndsPoints: undefined, // singles
          alternateServesAt: 10,
          numServes: 2,
          pointsWon: 0,
          remainingServesAtStartOfGame: 2,
          team1Points: 0,
          team2Points: 0,
          expectedServer: "Team2Player1",
          expectedReceiver: "Team1Player1",
          description: "Normal singles ( team2 first) - no score",
        },
        {
          initialServer: "Team1Player1",
          initialReceiver: "Team2Player1",
          doublesEndsPoints: undefined, // singles
          alternateServesAt: 10,
          numServes: 2,
          pointsWon: 1,
          remainingServesAtStartOfGame: 2,
          team1Points: 1,
          team2Points: 0,
          expectedServer: "Team1Player1",
          expectedReceiver: "Team2Player1",
          description: "Normal singles - point scored",
        },
        {
          initialServer: "Team1Player1",
          initialReceiver: "Team2Player1",
          doublesEndsPoints: undefined, // singles
          alternateServesAt: 10,
          numServes: 2,
          pointsWon: 2,
          remainingServesAtStartOfGame: 2,
          team1Points: 2,
          team2Points: 0,
          expectedServer: "Team2Player1",
          expectedReceiver: "Team1Player1",
          description: "Normal singles - 2 points scored - alternate",
        },
        {
          initialServer: "Team1Player1",
          initialReceiver: "Team2Player1",
          doublesEndsPoints: undefined, // singles
          alternateServesAt: 10,
          numServes: 2,
          pointsWon: 3,
          remainingServesAtStartOfGame: 2,
          team1Points: 2,
          team2Points: 1,
          expectedServer: "Team2Player1",
          expectedReceiver: "Team1Player1",
          description: "Normal singles - 3 points scored",
        },
        {
          initialServer: "Team1Player1",
          initialReceiver: "Team2Player1",
          doublesEndsPoints: undefined, // singles
          alternateServesAt: 10,
          numServes: 2,
          pointsWon: 4,
          remainingServesAtStartOfGame: 2,
          team1Points: 2,
          team2Points: 2,
          expectedServer: "Team1Player1",
          expectedReceiver: "Team2Player1",
          description: "Normal singles - 4 points scored - original server",
        },
        // 5 points scored
        {
          initialServer: "Team1Player1",
          initialReceiver: "Team2Player1",
          doublesEndsPoints: undefined, // singles
          alternateServesAt: 30,
          numServes: 5,
          pointsWon: 2,
          remainingServesAtStartOfGame: 5,
          team1Points: 0,
          team2Points: 2,
          expectedServer: "Team1Player1",
          expectedReceiver: "Team2Player1",
          description: "5 serves - 2 points scored - no change",
        },
        {
          initialServer: "Team1Player1",
          initialReceiver: "Team2Player1",
          doublesEndsPoints: undefined, // singles
          alternateServesAt: 30,
          numServes: 5,
          pointsWon: 5,
          remainingServesAtStartOfGame: 5,
          team1Points: 0,
          team2Points: 5,
          expectedServer: "Team2Player1",
          expectedReceiver: "Team1Player1",
          description: "5 serves - 5 points scored - alternate",
        },
        {
          initialServer: "Team1Player1",
          initialReceiver: "Team2Player1",
          doublesEndsPoints: undefined, // singles
          alternateServesAt: 30,
          numServes: 5,
          pointsWon: 10,
          remainingServesAtStartOfGame: 5,
          team1Points: 0,
          team2Points: 10,
          expectedServer: "Team1Player1",
          expectedReceiver: "Team2Player1",
          description: "5 serves - 10 points scored - original server",
        },
        // alternating singles
        {
          initialServer: "Team1Player1",
          initialReceiver: "Team2Player1",
          doublesEndsPoints: undefined, // singles
          alternateServesAt: 10,
          numServes: 2,
          pointsWon: 19,
          remainingServesAtStartOfGame: 2,
          team1Points: 10,
          team2Points: 9,
          expectedServer: "Team2Player1",
          expectedReceiver: "Team1Player1",
          description: "Normal singles - 10 - 9 ( not alternating )",
        },
        {
          initialServer: "Team1Player1",
          initialReceiver: "Team2Player1",
          doublesEndsPoints: undefined, // singles
          alternateServesAt: 10,
          numServes: 2,
          pointsWon: 20,
          remainingServesAtStartOfGame: 2,
          team1Points: 10,
          team2Points: 10,
          expectedServer: "Team1Player1",
          expectedReceiver: "Team2Player1",
          description:
            "Normal singles - 10 - 10 baseline ( multiple of 4, original )",
        },
        {
          initialServer: "Team1Player1",
          initialReceiver: "Team2Player1",
          doublesEndsPoints: undefined, // singles
          alternateServesAt: 10,
          numServes: 2,
          pointsWon: 21,
          remainingServesAtStartOfGame: 2,
          team1Points: 10,
          team2Points: 11,
          expectedServer: "Team2Player1",
          expectedReceiver: "Team1Player1",
          description: "Normal singles - 11 - 10 switch",
        },
        {
          initialServer: "Team1Player1",
          initialReceiver: "Team2Player1",
          doublesEndsPoints: undefined, // singles
          alternateServesAt: 10,
          numServes: 2,
          pointsWon: 22,
          remainingServesAtStartOfGame: 2,
          team1Points: 11,
          team2Points: 11,
          expectedServer: "Team1Player1",
          expectedReceiver: "Team2Player1",
          description: "Normal singles - 11 - 11 original",
        },
        // remaining serves at start of game
        {
          initialServer: "Team1Player1",
          initialReceiver: "Team2Player1",
          doublesEndsPoints: undefined, // singles
          alternateServesAt: 10,
          numServes: 2,
          pointsWon: 0,
          remainingServesAtStartOfGame: 1,
          team1Points: 1,
          team2Points: 0,
          expectedServer: "Team1Player1",
          expectedReceiver: "Team2Player1",
          description: "Normal singles - no score - 1 remaining",
        },
        {
          initialServer: "Team1Player1",
          initialReceiver: "Team2Player1",
          doublesEndsPoints: undefined, // singles
          alternateServesAt: 10,
          numServes: 2,
          pointsWon: 1,
          remainingServesAtStartOfGame: 1,
          team1Points: 2,
          team2Points: 0,
          expectedServer: "Team2Player1",
          expectedReceiver: "Team1Player1",
          description: "Normal singles - one point - 1 remaining - switch",
        },
        {
          initialServer: "Team1Player1",
          initialReceiver: "Team2Player1",
          doublesEndsPoints: undefined, // singles
          alternateServesAt: 10,
          numServes: 2,
          pointsWon: 2,
          remainingServesAtStartOfGame: 1,
          team1Points: 3,
          team2Points: 0,
          expectedServer: "Team2Player1",
          expectedReceiver: "Team1Player1",
          description: "Normal singles - two points - 1 remaining - last serve",
        },
        {
          initialServer: "Team1Player1",
          initialReceiver: "Team2Player1",
          doublesEndsPoints: undefined, // singles
          alternateServesAt: 10,
          numServes: 2,
          pointsWon: 3,
          remainingServesAtStartOfGame: 1,
          team1Points: 3,
          team2Points: 0,
          expectedServer: "Team1Player1",
          expectedReceiver: "Team2Player1",
          description:
            "Normal singles - three points - 1 remaining - back to original",
        },
        // doubles
        {
          initialServer: "Team2Player2",
          initialReceiver: "Team1Player1",
          doublesEndsPoints: "NotEnds",
          alternateServesAt: 10,
          numServes: 2,
          pointsWon: 0,
          remainingServesAtStartOfGame: 2,
          team1Points: 0,
          team2Points: 0,
          expectedServer: "Team2Player2",
          expectedReceiver: "Team1Player1",
          description: "Normal doubles - no score",
        },
        {
          initialServer: "Team2Player2",
          initialReceiver: "Team1Player1",
          doublesEndsPoints: "NotEnds",
          alternateServesAt: 10,
          numServes: 2,
          pointsWon: 1,
          remainingServesAtStartOfGame: 2,
          team1Points: 1,
          team2Points: 0,
          expectedServer: "Team2Player2",
          expectedReceiver: "Team1Player1",
          description: "Normal doubles - point scored",
        },
        {
          initialServer: "Team2Player2",
          initialReceiver: "Team1Player1",
          doublesEndsPoints: "NotEnds",
          alternateServesAt: 10,
          numServes: 2,
          pointsWon: 2,
          remainingServesAtStartOfGame: 2,
          team1Points: 2,
          team2Points: 0,
          expectedServer: "Team1Player1",
          expectedReceiver: "Team2Player1",
          description: "Normal doubles - first service change",
        },
        {
          initialServer: "Team2Player2",
          initialReceiver: "Team1Player1",
          doublesEndsPoints: "NotEnds",
          alternateServesAt: 10,
          numServes: 2,
          pointsWon: 3,
          remainingServesAtStartOfGame: 2,
          team1Points: 3,
          team2Points: 0,
          expectedServer: "Team1Player1",
          expectedReceiver: "Team2Player1",
          description: "Normal doubles - 3 points scored",
        },
        // doubles ends
        {
          initialServer: "Team1Player1",
          initialReceiver: "Team2Player1",
          doublesEndsPoints: 8,
          alternateServesAt: 10,
          numServes: 2,
          pointsWon: 8,
          remainingServesAtStartOfGame: 2,
          team1Points: 5,
          team2Points: 3,
          expectedServer: "Team1Player1",
          expectedReceiver: "Team2Player2",
          description: "Normal doubles - at ends at 8",
        },
        {
          initialServer: "Team1Player1",
          initialReceiver: "Team2Player1",
          doublesEndsPoints: 8,
          alternateServesAt: 10,
          numServes: 2,
          pointsWon: 9,
          remainingServesAtStartOfGame: 2,
          team1Points: 5,
          team2Points: 4,
          expectedServer: "Team1Player1",
          expectedReceiver: "Team2Player2",
          description: "Normal doubles - ends at 8, points won 9",
        },
        {
          initialServer: "Team1Player1",
          initialReceiver: "Team2Player1",
          doublesEndsPoints: 8,
          alternateServesAt: 10,
          numServes: 2,
          pointsWon: 10,
          remainingServesAtStartOfGame: 2,
          team1Points: 5,
          team2Points: 5,
          expectedServer: "Team2Player2",
          expectedReceiver: "Team1Player2",
          description: "Normal doubles - ends at 8, points won 10",
        },
        {
          initialServer: "Team1Player1",
          initialReceiver: "Team2Player1",
          doublesEndsPoints: 8,
          alternateServesAt: 10,
          numServes: 2,
          pointsWon: 11,
          remainingServesAtStartOfGame: 2,
          team1Points: 5,
          team2Points: 6,
          expectedServer: "Team2Player2",
          expectedReceiver: "Team1Player2",
          description: "Normal doubles - ends at 8, points won 11",
        },

        {
          initialServer: "Team1Player1",
          initialReceiver: "Team2Player1",
          doublesEndsPoints: 11,
          alternateServesAt: 10,
          numServes: 2,
          pointsWon: 11,
          remainingServesAtStartOfGame: 2,
          team1Points: 8,
          team2Points: 3,
          expectedServer: "Team2Player1",
          expectedReceiver: "Team1Player1",
          description: "Normal doubles - at ends at 11",
        },
        {
          initialServer: "Team1Player1",
          initialReceiver: "Team2Player1",
          doublesEndsPoints: 5,
          alternateServesAt: 10,
          numServes: 2,
          pointsWon: 5,
          remainingServesAtStartOfGame: 2,
          team1Points: 5,
          team2Points: 0,
          expectedServer: "Team1Player2",
          expectedReceiver: "Team2Player1",
          description: "Normal doubles - at ends at 5",
        },
        {
          initialServer: "Team1Player1",
          initialReceiver: "Team2Player1",
          doublesEndsPoints: 5,
          alternateServesAt: 10,
          numServes: 2,
          pointsWon: 6,
          remainingServesAtStartOfGame: 2,
          team1Points: 5,
          team2Points: 0,
          expectedServer: "Team2Player1",
          expectedReceiver: "Team1Player1",
          description: "Normal doubles - ends at 5, points 6",
        },
        {
          initialServer: "Team1Player1",
          initialReceiver: "Team2Player1",
          doublesEndsPoints: 7,
          alternateServesAt: 10,
          numServes: 2,
          pointsWon: 7,
          remainingServesAtStartOfGame: 2,
          team1Points: 5,
          team2Points: 2,
          expectedServer: "Team2Player2",
          expectedReceiver: "Team1Player2",
          description: "Normal doubles - at ends at 7",
        },
      ];
      it.each(tests)("$description", (testOptions) => {
        const { expectedReceiver, expectedServer, ...servingState } =
          testOptions;
        const serverReceiver = getServerReceiver(servingState);
        expect(serverReceiver.server).toBe(expectedServer);
        expect(serverReceiver.receiver).toBe(expectedReceiver);
      });
    });

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
              bestOf: 5,
            },
            false,
          );
          expect(umpire.getMatchState().remainingServes).toBe(
            expectedRemainingServes,
          );
        },
      );

      it("should have undefined server and receiver", () => {
        const matchState = getAnUmpire().getMatchState();
        expect(matchState.server).toBeUndefined();
        expect(matchState.receiver).toBeUndefined();
      });

      it("should initialize available servers and receivers for singles", () => {
        const umpire = getNormalSinglesBestOf5Umpire();
        const serviceReceiverChoice =
          umpire.getMatchState().serverReceiverChoice;
        expect(serviceReceiverChoice.servers).toEqual(singlesPlayers);
        expect(serviceReceiverChoice.firstGameDoublesReceivers).toEqual([]);
      });

      it("should initialize available servers and receivers for doubles", () => {
        const umpire = getNormalDoublesBestOf5Umpire();
        const serviceReceiverChoice =
          umpire.getMatchState().serverReceiverChoice;
        expect(serviceReceiverChoice.servers).toEqual(doublesPlayers);
        expect(serviceReceiverChoice.firstGameDoublesReceivers).toHaveLength(0);
      });
    });
    describe("initial setting server", () => {
      describe("when singles", () => {
        const serverReceivers: ServerReceiver[] = [
          { server: "Team1Player1", receiver: "Team2Player1" },
          { server: "Team2Player1", receiver: "Team1Player1" },
        ];

        it.each(serverReceivers)(
          "should set the server and receiver %p",
          (serverReceiver) => {
            const umpire = getNormalSinglesBestOf5Umpire();
            const matchState = umpire.setServer(serverReceiver.server);
            const serviceReceiverChoice = matchState.serverReceiverChoice;
            expect(serviceReceiverChoice.servers).toHaveLength(0);
            expect(
              serviceReceiverChoice.firstGameDoublesReceivers,
            ).toHaveLength(0);
            expect(matchState.server).toEqual(serverReceiver.server);
            expect(matchState.receiver).toEqual(serverReceiver.receiver);
          },
        );
      });
      describe("when doubles", () => {
        interface ServerAvailableReceivers {
          server: Player;
          availableReceivers: Team;
        }
        const team1: Team = ["Team1Player1", "Team1Player2"];
        const team2: Team = ["Team2Player1", "Team2Player2"];
        const serverAvailableReceiversTests: ServerAvailableReceivers[] = [
          {
            server: "Team1Player1",
            availableReceivers: team2,
          },
          {
            server: "Team1Player2",
            availableReceivers: team2,
          },
          {
            server: "Team2Player1",
            availableReceivers: team1,
          },
          {
            server: "Team2Player2",
            availableReceivers: team1,
          },
        ];

        it.each(serverAvailableReceiversTests)(
          "should set the server and available receivers $server",
          (serverAvailableReceivers) => {
            const umpire = getNormalDoublesBestOf5Umpire();
            const matchState = umpire.setServer(
              serverAvailableReceivers.server,
            );
            const serviceReceiverChoice = matchState.serverReceiverChoice;
            expect(serviceReceiverChoice.servers).toHaveLength(0);
            expect(serviceReceiverChoice.firstGameDoublesReceivers).toEqual(
              serverAvailableReceivers.availableReceivers,
            );
            expect(matchState.server).toEqual(serverAvailableReceivers.server);
            expect(matchState.receiver).toBeUndefined();
          },
        );
      });
    });

    describe("initial setting receiver", () => {
      it("should set receiver if available receiver doubles", () => {
        const umpire = getNormalDoublesBestOf5Umpire();
        umpire.setServer("Team1Player1");

        const matchState = umpire.setFirstGameDoublesReceiver("Team2Player1");
        expect(matchState.receiver).toEqual<Player>("Team2Player1");
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
      matchState: MatchState,
      expectedServer: Player,
      expectedReceiver: Player,
    ) => {
      expect(matchState.server).toBe(expectedServer);
      expect(matchState.receiver).toBe(expectedReceiver);
    };
    const expectSinglesServerReceiver = (
      matchState: MatchState,
      team1Serving: boolean,
    ) => {
      expectServerReceiver(
        matchState,
        team1Serving ? "Team1Player1" : "Team2Player1",
        team1Serving ? "Team2Player1" : "Team1Player1",
      );
    };

    describe("midgame", () => {
      it("should decrement remaining serves", () => {
        const umpire = getAnUmpire();
        const matchState = umpire.pointScored(true);
        expect(matchState.remainingServes).toBe(1);
      });

      it.each([2, 5])(
        "should reset remaining serves after last remaining serve - numServes %p",
        (numServes: number) => {
          const umpire = new Umpire(
            {
              clearBy2: true,
              upTo: 11,
              numServes,
              team1StartGameScore: 0,
              team2StartGameScore: 0,
              bestOf: 5,
            },
            false,
          );

          umpire.setServer("Team1Player1");

          const matchState = scorePoints(umpire, true, numServes);

          expect(matchState.remainingServes).toBe(numServes);
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
            bestOf: 5,
          },
          false,
        );

        umpire.setServer("Team1Player1");

        let matchState = scorePoints(umpire, true, 10);
        expect(matchState.remainingServes).toBe(2);
        matchState = scorePoints(umpire, false, 10);
        expect(matchState.remainingServes).toBe(1);
      });

      it.each([2, 5])(
        "should switch server / receiver in singles - after serving all serves ( %p )",
        (numServes) => {
          const umpire = new Umpire(
            {
              clearBy2: true,
              upTo: 11,
              numServes,
              team1StartGameScore: 0,
              team2StartGameScore: 0,
              bestOf: 5,
            },
            false,
          );

          const expectInitial = () => {
            expectSinglesServerReceiver(umpire.getMatchState(), true);
          };
          umpire.setServer("Team1Player1");
          expectInitial();
          scorePoints(umpire, true, 1);
          expectInitial();
          const matchState = scorePoints(umpire, true, numServes - 1);

          expectSinglesServerReceiver(matchState, false);
        },
      );

      it("should switch server / receiver on each point in normal singles from 10-10", () => {
        const umpire = getNormalSinglesBestOf5Umpire();
        umpire.setServer("Team1Player1");
        expectSinglesServerReceiver(umpire.getMatchState(), true);
        scorePoints(umpire, true, 10);
        scorePoints(umpire, false, 10);
        expectSinglesServerReceiver(umpire.getMatchState(), true); // multiple of 4 !
        scorePoints(umpire, true, 1);
        expectSinglesServerReceiver(umpire.getMatchState(), false);
        scorePoints(umpire, false, 1);
        expectSinglesServerReceiver(umpire.getMatchState(), true);
      });

      it("previous receiver shall become the server and the partner of the previous server shall become the receiver.", () => {
        const umpire = getNormalDoublesBestOf5Umpire();
        umpire.setServer("Team1Player1");
        umpire.setFirstGameDoublesReceiver("Team2Player1");

        let matchState = scorePoints(umpire, true, 2);
        expect(matchState.server).toBe("Team2Player1");
        expect(matchState.receiver).toBe("Team1Player2");

        matchState = scorePoints(umpire, true, 2);
        expect(matchState.server).toBe("Team1Player2");
        expect(matchState.receiver).toBe("Team2Player2");

        matchState = scorePoints(umpire, true, 2);
        expect(matchState.server).toBe("Team2Player2");
        expect(matchState.receiver).toBe("Team1Player1");

        // cycle begins
        matchState = scorePoints(umpire, true, 2);
        expect(matchState.server).toBe("Team1Player1");
        expect(matchState.receiver).toBe("Team2Player1");
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
          "should switch the initial server receiver after 1 game for singles - Team1 first %p",
          (team1ServeFirst) => {
            const umpire = getNormalSinglesBestOf5Umpire();
            let matchState = umpire.setServer(
              team1ServeFirst ? "Team1Player1" : "Team2Player1",
            );
            expectSinglesServerReceiver(matchState, team1ServeFirst);
            matchState = scoreGames(umpire, true, 1);

            const serviceReceiverChoice = matchState.serverReceiverChoice;
            expect(serviceReceiverChoice.servers).toHaveLength(0);
            expect(
              serviceReceiverChoice.firstGameDoublesReceivers,
            ).toHaveLength(0);

            expectSinglesServerReceiver(matchState, !team1ServeFirst);
          },
        );

        it.each([true, false])(
          "should revert back to the initial server receiver after 2 games for singles - Team1 serves first %p",
          (team1ServeFirst) => {
            const umpire = getNormalSinglesBestOf5Umpire();
            let matchState = umpire.setServer(
              team1ServeFirst ? "Team1Player1" : "Team2Player1",
            );
            expectSinglesServerReceiver(matchState, team1ServeFirst);
            matchState = scoreGames(umpire, true, 2);
            const serviceReceiverChoice = matchState.serverReceiverChoice;
            expect(serviceReceiverChoice.servers).toHaveLength(0);
            expect(
              serviceReceiverChoice.firstGameDoublesReceivers,
            ).toHaveLength(0);

            expectSinglesServerReceiver(matchState, team1ServeFirst);
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
                bestOf: 5,
              },
              false,
            );

            const matchState = scoreGames(
              umpire,
              true,
              1,
              31 - team1StartGameScore,
            );

            expect(matchState.remainingServes).toBe(expectedRemainingServes);
          },
        );
      });

      describe("doubles", () => {
        it("should set the server and receiver to undefined", () => {
          const umpire = scoreFirstDoublesGame("Team1Player1", "Team2Player1");
          const matchState = umpire.getMatchState();
          expect(matchState.server).toBeUndefined();
          expect(matchState.receiver).toBeUndefined();
        });

        it("should set the availableServers to the players in the team that did not serve at the beginning of the previous game", () => {
          const umpire = scoreFirstDoublesGame("Team1Player1", "Team2Player1");
          const serviceReceiverChoice =
            umpire.getMatchState().serverReceiverChoice;
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
          const matchState = umpire.setServer(nextServer);
          expect(matchState.receiver).toBe(expectedNextReceiver);
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
          const matchState = umpire.setServer(nextServer);
          expect(matchState.receiver).toBe(expectedNextReceiver);
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
      const umpire = getNormalDoublesBestOf5Umpire();
      umpire.setServer("Team1Player1");
      umpire.setFirstGameDoublesReceiver("Team2Player1");
      scoreGames(umpire, true, 1);
      umpire.setServer("Team2Player1");
      scoreGames(umpire, true, 1);
      umpire.setServer("Team1Player1");
      const matchState = scoreGames(umpire, true, 1);

      const serviceReceiverChoice = matchState.serverReceiverChoice;
      expect(serviceReceiverChoice.servers).toHaveLength(0);
      expect(serviceReceiverChoice.firstGameDoublesReceivers).toHaveLength(0);

      expect(matchState.server).toBeUndefined();
      expect(matchState.receiver).toBeUndefined();
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
        const matchState = scorePoints(umpire, true, 4);
        const currentReceiver = matchState.receiver;
        const receiver = scorePoints(umpire, true, 1).receiver;
        expect(receiver).not.toBe(currentReceiver);
        expect(receiver).toBe(expectedReceiver);
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
      // Team1Player2 => Team2Player2  scoring at ends
      // Team2Player2 => Team1Player1
      umpire.setServer("Team1Player1");
      let matchState = scorePoints(umpire, true, 4);
      expectServerReceiver(matchState, "Team1Player2", "Team2Player2"); //1st serve

      matchState = scorePoints(umpire, true, 1);
      // cycle changes
      // Team1Player2 => Team2Player1
      // Team2Player1 => Team1Player1
      // Team1Player1 => Team2Player2
      // Team2Player2 => Team1Player2
      expectServerReceiver(matchState, "Team1Player2", "Team2Player1"); //2nd serve - switched

      matchState = scorePoints(umpire, true, 1);
      expectServerReceiver(matchState, "Team2Player1", "Team1Player1"); //FAILING

      matchState = scorePoints(umpire, false, 2);
      expectServerReceiver(matchState, "Team1Player1", "Team2Player2");

      matchState = scorePoints(umpire, false, 2);
      expectServerReceiver(matchState, "Team2Player2", "Team1Player2");
    });
  });

  describe("undoPoint", () => {
    describe("canUndoPoint", () => {
      it("cannot undo at the beginning", () => {
        expect(getAnUmpire().getMatchState().canUndoPoint).toBe(false);
      });
      it("cann undo when point has been scored", () => {
        const umpire = getAnUmpire();
        const matchState = umpire.pointScored(true);
        expect(matchState.canUndoPoint).toBe(true);
      });
      it("can undo at the beginning of the second game", () => {
        const umpire = getAnUmpire(3);
        const matchState = scoreGames(umpire, true, 1);
        expect(matchState.canUndoPoint).toBe(true);
      });
    });
    describe("scoring", () => {
      it.each([true, false])(
        "should reduce pointsWon by one when not start of a game - Team2 scores last %p",
        (team2ScoresLast) => {
          const umpire = getAnUmpire();
          scorePoints(umpire, team2ScoresLast, 3);
          scorePoints(umpire, !team2ScoresLast, 2);

          const matchState = umpire.undoPoint();
          expect(matchState.team1Score.points).toBe(!team2ScoresLast ? 1 : 3);
          expect(matchState.team2Score.points).toBe(team2ScoresLast ? 1 : 3);
        },
      );

      it("should remove from point history when not start of game", () => {
        const umpire = getAnUmpire();
        scorePoints(umpire, true, 3);
        scorePoints(umpire, false, 2);

        const matchState = umpire.undoPoint();

        expect(matchState.pointHistory).toHaveLength(1);
        const points = matchState.pointHistory[0].map(
          (point) => point.team1WonPoint,
        );
        expect(points).toStrictEqual([true, true, true, false]);
      });

      it("should have correct MatchWinState - from GamePointTeam1", () => {
        const umpire = getNormalSinglesBestOf5Umpire();
        let matchState = scorePoints(umpire, true, 10);

        expect(matchState.matchWinState).toBe(MatchWinState.GamePointTeam1);

        matchState = umpire.undoPoint();

        expect(matchState.matchWinState).toBe(MatchWinState.NotWon);
      });

      it("should reduce gamesWon by one when start of a game - team1 scores last", () => {
        const umpire = getNormalSinglesBestOf5Umpire();
        scorePoints(umpire, true, 10);
        scorePoints(umpire, false, 1);
        let matchState = scorePoints(umpire, true, 1);
        expect(matchState.completedGameScores).toHaveLength(1);
        expect(matchState.pointHistory).toHaveLength(2);

        matchState = umpire.undoPoint();

        expect(matchState.team1Score).toEqual<TeamScore>({
          games: 0,
          points: 10,
        });
        expect(matchState.team2Score).toEqual<TeamScore>({
          games: 0,
          points: 1,
        });
        expect(matchState.completedGameScores).toHaveLength(0);
        expect(matchState.pointHistory).toHaveLength(1);
      });

      it("should reduce gamesWon by one when start of a game - team2 scores last", () => {
        const umpire = getNormalSinglesBestOf5Umpire();
        scorePoints(umpire, false, 10);
        scorePoints(umpire, true, 1);
        scorePoints(umpire, false, 1);

        const matchState = umpire.undoPoint();

        expect(matchState.team2Score).toEqual<TeamScore>({
          games: 0,
          points: 10,
        });
        expect(matchState.team1Score).toEqual<TeamScore>({
          games: 0,
          points: 1,
        });
        expect(matchState.completedGameScores).toHaveLength(0);
      });
    });

    it("should suggest server when undo game winning point in doubles and then win game", () => {
      const umpire = getNormalDoublesBestOf5Umpire();
      umpire.setServer("Team1Player1");
      umpire.setFirstGameDoublesReceiver("Team2Player1");
      scoreGames(umpire, true, 1);
      umpire.setServer("Team2Player1");
      let matchState = umpire.undoPoint();

      expect(matchState.server).toBeDefined();
      expect(matchState.receiver).toBeDefined();
      expect(matchState.serverReceiverChoice.servers).toHaveLength(0);

      matchState = umpire.pointScored(true);
      expect(matchState.server).toBeUndefined();
      expect(matchState.receiver).toBeUndefined();
      expect(matchState.serverReceiverChoice.servers).toEqual([
        "Team2Player1",
        "Team2Player2",
      ]);
    });

    it.each([true, false])(
      "should have server receiver when undo singles game winning point",
      (team1ServesFirst) => {
        const umpire = getNormalSinglesBestOf5Umpire();
        const server: SinglesPlayer = team1ServesFirst
          ? "Team1Player1"
          : "Team2Player1";
        const receiver: SinglesPlayer = !team1ServesFirst
          ? "Team1Player1"
          : "Team2Player1";
        umpire.setServer(server);
        scoreGames(umpire, true, 1);

        const matchState = umpire.undoPoint();
        expect(matchState.server).toBe<SinglesPlayer>(receiver);
        expect(matchState.receiver).toBe<SinglesPlayer>(server);
        expect(matchState.serverReceiverChoice.servers).toHaveLength(0);
      },
    );

    interface UndoPointDoublesServerReceiverTest {
      firstServer: Player;
      firstReceiver: Player;
    }
    const undoPointDoublesServerReceiverTests: UndoPointDoublesServerReceiverTest[] =
      [
        {
          firstServer: "Team1Player1",
          firstReceiver: "Team2Player1",
        },
        {
          firstServer: "Team1Player1",
          firstReceiver: "Team2Player2",
        },
        {
          firstServer: "Team1Player2",
          firstReceiver: "Team2Player1",
        },
        {
          firstServer: "Team1Player2",
          firstReceiver: "Team2Player2",
        },

        {
          firstServer: "Team2Player1",
          firstReceiver: "Team1Player1",
        },
        {
          firstServer: "Team2Player1",
          firstReceiver: "Team1Player2",
        },
        {
          firstServer: "Team2Player2",
          firstReceiver: "Team1Player1",
        },
        {
          firstServer: "Team2Player2",
          firstReceiver: "Team1Player2",
        },
      ];
    it.each(undoPointDoublesServerReceiverTests)(
      "should have server receiver when undo doubles game winning point",
      (undoPointDoublesServerReceiverTest) => {
        const umpire = getNormalDoublesBestOf5Umpire();
        umpire.setServer(undoPointDoublesServerReceiverTest.firstServer);
        umpire.setFirstGameDoublesReceiver(
          undoPointDoublesServerReceiverTest.firstReceiver,
        );
        scoreGames(umpire, true, 1);

        const matchState = umpire.undoPoint();
        expect(matchState.server).toBe<Player>(
          undoPointDoublesServerReceiverTest.firstReceiver,
        );
        expect(matchState.receiver).toBe<Player>(
          getDoublesPartner(undoPointDoublesServerReceiverTest.firstServer),
        );
        expect(matchState.serverReceiverChoice.servers).toHaveLength(0);
        expect(
          matchState.serverReceiverChoice.firstGameDoublesReceivers,
        ).toHaveLength(0);
      },
    );

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
          expect(umpire.getMatchState().team1Left).toBe(team1Left);
          let matchState = scoreGames(umpire, true, 1);
          expect(matchState.team1Left).toBe(!team1Left);

          matchState = umpire.undoPoint();
          expect(matchState.team1Left).toBe(team1Left);
        },
      );
      it("should switch ends if have just switched ends in the decider", () => {
        const umpire = getNormalSinglesBestOf5Umpire();
        scoreGames(umpire, true, 2);
        let matchState = scoreGames(umpire, false, 2);
        expect(matchState.team1Left).toBe(true);
        matchState = scorePoints(umpire, true, 4);
        expect(matchState.team1Left).toBe(true);
        matchState = umpire.pointScored(true);
        expect(matchState.team1Left).toBe(false);

        matchState = umpire.undoPoint();
        expect(matchState.team1Left).toBe(true);
      });
      it("should not switch ends after have switched ends in the decider", () => {
        const umpire = getNormalSinglesBestOf5Umpire();
        scoreGames(umpire, true, 2);
        let matchState = scoreGames(umpire, false, 2);
        expect(matchState.team1Left).toBe(true);
        matchState = scorePoints(umpire, true, 6);

        expect(matchState.team1Left).toBe(false);

        matchState = umpire.undoPoint();
        expect(matchState.team1Left).toBe(false);
      });
    });
  });

  describe("SaveState should be json serializable", () => {
    it("should serialize and deserialize - initial state", () => {
      const umpire = getAnUmpire();
      const saveState = umpire.getSaveState();
      const json = JSON.stringify(saveState);
      const deserialized = JSON.parse(json);
      expect(deserialized).toEqual(saveState);
    });

    it("should serialize and deserialize - after setting server", () => {
      const umpire = getAnUmpire();
      umpire.setServer("Team1Player1");
      const saveState = umpire.getSaveState();
      const json = JSON.stringify(saveState);
      const deserialized = JSON.parse(json);
      expect(deserialized).toEqual(saveState);
    });

    it("should serialize and deserialize - after scoring point", () => {
      const umpire = getAnUmpire();
      umpire.setServer("Team1Player1");
      umpire.pointScored(true);
      const saveState = umpire.getSaveState();
      const json = JSON.stringify(saveState);
      const deserialized = JSON.parse(json);
      expect(deserialized).toEqual(saveState);
    });
  });
});
