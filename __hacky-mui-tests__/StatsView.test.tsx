/**
 * @jest-environment jsdom
 */

import { act, render } from "@testing-library/react";
import { StatsView } from "../src/statsViews/StatsView";
import { PointState } from "../src/umpire";
import { GameScoreLineChartProps } from "../src/statsViews/GameScoreLineChart";
// https://github.com/mui/mui-x/issues/11568  @mui/x-charts does not work with jest
let gameScoreLineChartProps: GameScoreLineChartProps;
jest.mock("../src/statsViews/GameScoreLineChart/index", () => {
  return {
    GameScoreLineChart: function (props: GameScoreLineChartProps) {
      gameScoreLineChartProps = props;
      return <div>GameScoreLineChart</div>;
    },
  };
});

describe("StatsView", () => {
  describe("LineChart", () => {
    describe("marks", () => {
      describe("showMark", () => {
        interface ShowMarkTest {
          team1WonPoint: boolean;
          isTeam1: boolean;
          expectedShowMark: boolean;
        }
        const showMarkTests: ShowMarkTest[] = [
          { team1WonPoint: true, isTeam1: true, expectedShowMark: true },
          { team1WonPoint: true, isTeam1: false, expectedShowMark: false },
          { team1WonPoint: false, isTeam1: true, expectedShowMark: false },
          { team1WonPoint: false, isTeam1: false, expectedShowMark: true },
        ];
        it.each(showMarkTests)(
          "should render a mark for the team that wins the point",
          (showMarkTest) => {
            render(
              <StatsView
                gamePoint={10}
                matchWon={false}
                team1StartScore={0}
                team2StartScore={0}
                upTo={11}
                team1Label="Team 1"
                team2Label="Team 2"
                team1Left={true}
                gameScores={[]}
                currentGameScore={{ team1Points: 1, team2Points: 1 }}
                pointHistory={[[]]}
              />,
            );
            const showMark = gameScoreLineChartProps.mark.showMark(
              showMarkTest.isTeam1,
              {
                pointState: PointState.Default,
                team1Points: 1,
                team2Points: 0,
                team1WonPoint: showMarkTest.team1WonPoint,
              },
              1,
            );
            expect(showMark).toBe(showMarkTest.expectedShowMark);
          },
        );
        it("should not render a mark for 0 position", () => {
          render(
            <StatsView
              gamePoint={10}
              matchWon={false}
              team1StartScore={0}
              team2StartScore={0}
              upTo={11}
              team1Label="Team 1"
              team2Label="Team 2"
              team1Left={true}
              gameScores={[]}
              currentGameScore={{ team1Points: 1, team2Points: 1 }}
              pointHistory={[[]]}
            />,
          );
          const showMark = gameScoreLineChartProps.mark.showMark(
            true,
            {
              pointState: PointState.Default,
              team1Points: 0,
              team2Points: 0,
              team1WonPoint: true,
            },
            0,
          );
          expect(showMark).toBe(false);
        });
      });
      describe("shape", () => {
        it.each([PointState.Team1Won, PointState.Team2Won])(
          "should render a star if the match is won",
          (winPointState) => {
            render(
              <StatsView
                gamePoint={10}
                matchWon={true}
                team1StartScore={0}
                team2StartScore={0}
                upTo={11}
                team1Label="Team 1"
                team2Label="Team 2"
                team1Left={true}
                gameScores={[{ team1Points: 11, team2Points: 0 }]}
                currentGameScore={{ team1Points: 0, team2Points: 0 }}
                pointHistory={[[]]}
              />,
            );
            const shape = gameScoreLineChartProps.mark.getShape(
              true,
              {
                pointState: winPointState,
                team1Points: 1,
                team2Points: 0,
                team1WonPoint: true,
              },
              1,
            );
            expect(shape).toBe<typeof shape>("star");
          },
        );

        it.each([PointState.GameWonTeam1, PointState.GameWonTeam2])(
          "should render a diamond if the game is won",
          (winPointState) => {
            render(
              <StatsView
                gamePoint={10}
                matchWon={false}
                team1StartScore={0}
                team2StartScore={0}
                upTo={11}
                team1Label="Team 1"
                team2Label="Team 2"
                team1Left={true}
                gameScores={[]}
                currentGameScore={{ team1Points: 11, team2Points: 0 }}
                pointHistory={[[]]}
              />,
            );
            const shape = gameScoreLineChartProps.mark.getShape(
              true,
              {
                pointState: winPointState,
                team1Points: 1,
                team2Points: 0,
                team1WonPoint: true,
              },
              1,
            );
            expect(shape).toBe<typeof shape>("diamond");
          },
        );

        it("should render a circle if the mark is for team1 and not a game/match won state", () => {
          render(
            <StatsView
              gamePoint={10}
              matchWon={true}
              team1StartScore={0}
              team2StartScore={0}
              upTo={11}
              team1Label="Team 1"
              team2Label="Team 2"
              team1Left={true}
              gameScores={[]}
              currentGameScore={{ team1Points: 1, team2Points: 1 }}
              pointHistory={[[]]}
            />,
          );
          const shape = gameScoreLineChartProps.mark.getShape(
            true,
            {
              pointState: PointState.Default,
              team1Points: 1,
              team2Points: 0,
              team1WonPoint: true,
            },
            1,
          );
          expect(shape).toBe<typeof shape>("circle");
        });

        it("should render a square if the mark is for team2 and not a game/match won state", () => {
          act(() => {
            render(
              <StatsView
                gamePoint={10}
                matchWon={true}
                team1StartScore={0}
                team2StartScore={0}
                upTo={11}
                team1Label="Team 1"
                team2Label="Team 2"
                team1Left={true}
                gameScores={[]}
                currentGameScore={{ team1Points: 1, team2Points: 1 }}
                pointHistory={[[]]}
              />,
            );
          });

          const shape = gameScoreLineChartProps.mark.getShape(
            false,
            {
              pointState: PointState.Default,
              team1Points: 1,
              team2Points: 0,
              team1WonPoint: false,
            },
            1,
          );
          expect(shape).toBe<typeof shape>("square");
        });
      });
      describe("color", () => {
        it.each([PointState.Team1Won, PointState.Team2Won])(
          "should be white when match won",
          (winPointState) => {
            render(
              <StatsView
                gamePoint={10}
                matchWon={true}
                team1StartScore={0}
                team2StartScore={0}
                upTo={11}
                team1Label="Team 1"
                team2Label="Team 2"
                team1Left={true}
                gameScores={[{ team1Points: 11, team2Points: 0 }]}
                currentGameScore={{ team1Points: 0, team2Points: 0 }}
                pointHistory={[[]]}
              />,
            );
            const color = gameScoreLineChartProps.mark.getColor(
              true,
              {
                team1Points: 11,
                team2Points: 0,
                team1WonPoint: true,
                pointState: winPointState,
              },
              1,
            );
            expect(color).toBe<typeof color>("white");
          },
        );

        it.each([PointState.GameWonTeam1, PointState.GameWonTeam2])(
          "should be white when game won",
          (winPointState) => {
            render(
              <StatsView
                gamePoint={10}
                matchWon={true}
                team1StartScore={0}
                team2StartScore={0}
                upTo={11}
                team1Label="Team 1"
                team2Label="Team 2"
                team1Left={true}
                gameScores={[]}
                currentGameScore={{ team1Points: 0, team2Points: 0 }}
                pointHistory={[[]]}
              />,
            );
            const color = gameScoreLineChartProps.mark.getColor(
              true,
              {
                team1Points: 11,
                team2Points: 0,
                team1WonPoint: true,
                pointState: winPointState,
              },
              1,
            );
            expect(color).toBe<typeof color>("white");
          },
        );

        // point number is important and the point history
        it("should be green if saved game point at mark point", () => {
          render(
            <StatsView
              gamePoint={10}
              matchWon={false}
              team1StartScore={0}
              team2StartScore={0}
              upTo={11}
              team1Label="Team 1"
              team2Label="Team 2"
              team1Left={true}
              gameScores={[]}
              currentGameScore={{ team1Points: 1, team2Points: 1 }}
              pointHistory={[
                [
                  {
                    date: new Date(),
                    team1Points: 1,
                    team2Points: 0,
                    team1WonPoint: true,
                    pointState: PointState.GamePointTeam1,
                    server: "Team1Player1",
                    receiver: "Team2Player1",
                    gameOrMatchPoints: 2,
                  },
                  {
                    date: new Date(),
                    team1Points: 1,
                    team2Points: 1,
                    team1WonPoint: false,
                    pointState: PointState.Deuce,
                    server: "Team1Player1",
                    receiver: "Team2Player1",
                  },
                ],
              ]}
            />,
          );
          const color = gameScoreLineChartProps.mark.getColor(
            // not used
            true,
            // not used
            {
              team1Points: 1,
              team2Points: 0,
              team1WonPoint: true,
              pointState: PointState.Default,
            },
            2,
          );
          expect(color).toBe<typeof color>("green");
        });

        it("should be yellow if saved match point at mark point", () => {
          render(
            <StatsView
              gamePoint={10}
              matchWon={false}
              team1StartScore={0}
              team2StartScore={0}
              upTo={11}
              team1Label="Team 1"
              team2Label="Team 2"
              team1Left={true}
              gameScores={[]}
              currentGameScore={{ team1Points: 1, team2Points: 1 }}
              pointHistory={[
                [
                  {
                    date: new Date(),
                    team1Points: 1,
                    team2Points: 0,
                    team1WonPoint: true,
                    pointState: PointState.MatchPointTeam1,
                    server: "Team1Player1",
                    receiver: "Team2Player1",
                    gameOrMatchPoints: 2,
                  },
                  {
                    date: new Date(),
                    team1Points: 1,
                    team2Points: 1,
                    team1WonPoint: false,
                    pointState:
                      PointState.MatchPointTeam1 + PointState.MatchPointTeam2,
                    server: "Team1Player1",
                    receiver: "Team2Player1",
                  },
                ],
              ]}
            />,
          );
          const color = gameScoreLineChartProps.mark.getColor(
            // not used
            true,
            // not used
            {
              team1Points: 1,
              team2Points: 0,
              team1WonPoint: true,
              pointState:
                PointState.MatchPointTeam1 + PointState.MatchPointTeam2,
            },
            2,
          );
          expect(color).toBe<typeof color>("yellow");
        });

        it.each([PointState.GamePointTeam1, PointState.GamePointTeam2])(
          "should be orange if game point at the mark point",
          (gamePointPointState) => {
            render(
              <StatsView
                gamePoint={10}
                matchWon={false}
                team1StartScore={0}
                team2StartScore={0}
                upTo={11}
                team1Label="Team 1"
                team2Label="Team 2"
                team1Left={true}
                gameScores={[]}
                currentGameScore={{ team1Points: 1, team2Points: 1 }}
                pointHistory={[
                  [
                    {
                      date: new Date(),
                      team1Points: 1,
                      team2Points: 0,
                      team1WonPoint: true,
                      pointState: PointState.Default,
                      server: "Team1Player1",
                      receiver: "Team2Player1",
                      gameOrMatchPoints: 2,
                    },
                    {
                      date: new Date(),
                      team1Points: 1,
                      team2Points: 1,
                      team1WonPoint: false,
                      pointState: PointState.GamePointTeam1,
                      server: "Team1Player1",
                      receiver: "Team2Player1",
                    },
                  ],
                ]}
              />,
            );
            const color = gameScoreLineChartProps.mark.getColor(
              // not used
              true,
              // not used
              {
                team1Points: 1,
                team2Points: 0,
                team1WonPoint: true,
                pointState: gamePointPointState,
              },
              2,
            );
            expect(color).toBe<typeof color>("orange");
          },
        );

        it.each([PointState.MatchPointTeam1, PointState.MatchPointTeam2])(
          "should be red if match point at the mark point",
          (matchPointPointState) => {
            render(
              <StatsView
                gamePoint={10}
                matchWon={false}
                team1StartScore={0}
                team2StartScore={0}
                upTo={11}
                team1Label="Team 1"
                team2Label="Team 2"
                team1Left={true}
                gameScores={[]}
                currentGameScore={{ team1Points: 1, team2Points: 1 }}
                pointHistory={[
                  [
                    {
                      date: new Date(),
                      team1Points: 1,
                      team2Points: 0,
                      team1WonPoint: true,
                      pointState: PointState.Default,
                      server: "Team1Player1",
                      receiver: "Team2Player1",
                      gameOrMatchPoints: 2,
                    },
                    {
                      date: new Date(),
                      team1Points: 2,
                      team2Points: 0,
                      team1WonPoint: true,
                      pointState: matchPointPointState,
                      server: "Team1Player1",
                      receiver: "Team2Player1",
                    },
                  ],
                ]}
              />,
            );
            const color = gameScoreLineChartProps.mark.getColor(
              // not used
              true,
              // not used
              {
                team1Points: 1,
                team2Points: 1,
                team1WonPoint: true,
                pointState: matchPointPointState,
              },
              2,
            );
            expect(color).toBe<typeof color>("red");
          },
        );

        it("should be undefined and default if not a save point or game/match point", () => {
          render(
            <StatsView
              gamePoint={10}
              matchWon={false}
              team1StartScore={0}
              team2StartScore={0}
              upTo={11}
              team1Label="Team 1"
              team2Label="Team 2"
              team1Left={true}
              gameScores={[]}
              currentGameScore={{ team1Points: 1, team2Points: 0 }}
              pointHistory={[
                [
                  {
                    date: new Date(),
                    team1Points: 1,
                    team2Points: 0,
                    team1WonPoint: true,
                    pointState: PointState.Default,
                    server: "Team1Player1",
                    receiver: "Team2Player1",
                  },
                ],
              ]}
            />,
          );
          const color = gameScoreLineChartProps.mark.getColor(
            true,
            {
              team1Points: 11,
              team2Points: 0,
              team1WonPoint: true,
              pointState: PointState.Default,
            },
            1,
          );
          expect(color).toBeUndefined();
        });

        it("should colour different marks differently when appropriate", () => {
          render(
            <StatsView
              gamePoint={10}
              matchWon={false}
              team1StartScore={0}
              team2StartScore={0}
              upTo={11}
              team1Label="Team 1"
              team2Label="Team 2"
              team1Left={true}
              gameScores={[]}
              currentGameScore={{ team1Points: 1, team2Points: 1 }}
              pointHistory={[
                [
                  {
                    date: new Date(),
                    team1Points: 1,
                    team2Points: 0,
                    team1WonPoint: true,
                    pointState: PointState.GamePointTeam1,
                    server: "Team1Player1",
                    receiver: "Team2Player1",
                    gameOrMatchPoints: 2,
                  },
                  {
                    date: new Date(),
                    team1Points: 1,
                    team2Points: 1,
                    team1WonPoint: false,
                    pointState: PointState.Default,
                    server: "Team1Player1",
                    receiver: "Team2Player1",
                  },
                ],
              ]}
            />,
          );
          const mark1color = gameScoreLineChartProps.mark.getColor(
            // not used
            true,
            {
              team1Points: 1,
              team2Points: 0,
              team1WonPoint: true,
              pointState: PointState.GamePointTeam1,
            },
            1,
          );
          expect(mark1color).toBe<typeof mark1color>("orange");
          const mark2color = gameScoreLineChartProps.mark.getColor(
            // not used
            true,
            {
              team1Points: 2,
              team2Points: 0,
              team1WonPoint: true,
              pointState: PointState.Default,
            },
            2,
          );
          expect(mark2color).toBe<typeof mark2color>("green");
        });
      });
    });
  });
});
