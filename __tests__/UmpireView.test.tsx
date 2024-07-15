/**
 * @jest-environment jsdom
 */
import { render, RenderResult, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ControllableUmpire,
  DoublesPlayerNames,
  PlayerNames,
  UmpireView,
} from "../src/umpireView";
import { MatchWinState } from "../src/umpire/getMatchWinState";
import * as matchers from "@testing-library/jest-dom/matchers";
import { expect as jestExpect } from "@jest/globals";
import { MatchState, Player } from "../src/umpire";
import { Team } from "../src/umpire/playersHelpers";
import { ServerReceiverChoice } from "../src/umpire/availableServerReceiverChoice";

// mocking due to import.meta.url
jest.mock(
  "../src/umpireView/dialogs/serverReceiver/Tosser/ClickKingTosser",
  () => {
    return {
      ClickKingTosser: () => <div></div>,
    };
  },
);

jestExpect.extend(matchers);
const expect = jestExpect as unknown as jest.ExtendedExpect<typeof matchers>;

describe("<UmpireView/", () => {
  describe("choosing server / receiver", () => {
    describe("auto", () => {
      describe("server chooser", () => {
        const renderWithServers = (
          team1PlayerNames: string[],
          team2PlayerNames: string[],
          autoShowServerReceiverChooser = true,
          umpire: Partial<ControllableUmpire> = {},
        ) => {
          const servers: Player[] =
            team1PlayerNames.length === 1
              ? ["Team1Player1", "Team2Player1"]
              : [
                  "Team1Player1",
                  "Team1Player2",
                  "Team2Player1",
                  "Team2Player2",
                ];
          const playerNames: PlayerNames = {
            team1Player1Name: team1PlayerNames[0],
            team2Player1Name: team2PlayerNames[0],
          };
          if (team1PlayerNames.length === 2) {
            playerNames.team1Player2Name = team1PlayerNames[1];
            playerNames.team2Player2Name = team2PlayerNames[1];
          }
          return render(
            <UmpireView
              {...playerNames}
              autoShowServerReceiverChooser={autoShowServerReceiverChooser}
              matchState={{
                canUndoPoint: false,
                isEnds: false,
                remainingServes: 0,
                matchWinState: MatchWinState.NotWon,
                server: undefined,
                receiver: undefined,
                gameScores: [],
                team1Left: true,
                team1Score: { points: 0, games: 0 },
                team2Score: { points: 0, games: 0 },
                pointHistory: [],
                canResetServerReceiver: false,
                serverReceiverChoice: {
                  servers,
                  firstGameDoublesReceivers: [],
                },
              }}
              rules={{
                bestOf: 1,
                upTo: 1,
                clearBy2: false,
                numServes: 1,
                team1EndsAt: 1,
                team2EndsAt: 1,
              }}
              umpire={{
                pointScored() {},
                resetServerReceiver() {},
                setFirstGameDoublesReceiver() {},
                setServer() {},
                switchEnds() {},
                undoPoint() {},
                ...umpire,
              }}
            />,
          );
        };
        const getChooseServerDialog = (
          getByRole: RenderResult["getByRole"],
        ) => {
          return getByRole("dialog", { name: "Choose server" });
        };

        it("should render choose server dialog when server is required to be chosen", () => {
          const { getByRole } = renderWithServers(["T1P1"], ["T2P2"]);
          expect(getChooseServerDialog(getByRole)).toBeInTheDocument();
        });
        it("should render a button for each server - singles", () => {
          const { getByRole } = renderWithServers(["T1P1"], ["T2P1"]);
          const chooseServerDialog = getChooseServerDialog(getByRole);
          const dialogButtons =
            within(chooseServerDialog).getAllByRole("button");
          const selectT1P1Button = within(chooseServerDialog).getByRole(
            "button",
            {
              name: "T1P1",
            },
          );
          const selectT2P1Button = within(chooseServerDialog).getByRole(
            "button",
            {
              name: "T2P1",
            },
          );
          expect(selectT1P1Button).toBeInTheDocument();
          expect(selectT2P1Button).toBeInTheDocument();
          expect(dialogButtons.length).toBe(2);
        });

        it("should render a button for each server - doubles", () => {
          const { getByRole } = renderWithServers(
            ["T1P1", "T1P2"],
            ["T2P1", "T2P2"],
          );
          const chooseServerDialog = getChooseServerDialog(getByRole);
          const dialogButtons =
            within(chooseServerDialog).getAllByRole("button");
          const selectT1P1Button = within(chooseServerDialog).getByRole(
            "button",
            {
              name: "T1P1",
            },
          );
          const selectT2P1Button = within(chooseServerDialog).getByRole(
            "button",
            {
              name: "T2P1",
            },
          );
          const selectT1P2Button = within(chooseServerDialog).getByRole(
            "button",
            {
              name: "T1P2",
            },
          );
          const selectT2P2Button = within(chooseServerDialog).getByRole(
            "button",
            {
              name: "T2P2",
            },
          );
          expect(selectT1P1Button).toBeInTheDocument();
          expect(selectT2P1Button).toBeInTheDocument();
          expect(selectT1P2Button).toBeInTheDocument();
          expect(selectT2P2Button).toBeInTheDocument();
          expect(dialogButtons.length).toBe(4);

          // todo - assert order
        });

        interface ServerChosenTest {
          playerName: string;
          expectedServer: Player;
        }
        const serverChosenTests: ServerChosenTest[] = [
          {
            playerName: "T1P1",
            expectedServer: "Team1Player1",
          },
          {
            playerName: "T1P2",
            expectedServer: "Team1Player2",
          },
          {
            playerName: "T2P1",
            expectedServer: "Team2Player1",
          },
          {
            playerName: "T2P2",
            expectedServer: "Team2Player2",
          },
        ];
        it.each(serverChosenTests)(
          "should setServer with chosen server when clicked - %p",
          async (serverChosenTest) => {
            const user = userEvent.setup();
            const setServer = jest.fn();
            const { getByRole } = renderWithServers(
              ["T1P1", "T1P2"],
              ["T2P1", "T2P2"],
              true,
              {
                setServer,
              },
            );
            const chooseServerDialog = getChooseServerDialog(getByRole);
            const selectServerButton = within(chooseServerDialog).getByRole(
              "button",
              {
                name: serverChosenTest.playerName,
              },
            );

            await user.click(selectServerButton);

            expect(setServer).toHaveBeenCalledWith<[Player]>(
              serverChosenTest.expectedServer,
            );
          },
        );
      });

      describe("first game doubles chooser", () => {
        const renderWithFirstGameDoublesReceiver = (
          doublesPlayerNames: DoublesPlayerNames,
          receivers: Team,
          autoShowServerReceiverChooser = true,
          umpire: Partial<ControllableUmpire> = {},
        ) => {
          return render(
            <UmpireView
              autoShowServerReceiverChooser={autoShowServerReceiverChooser}
              {...doublesPlayerNames}
              matchState={{
                canUndoPoint: false,
                isEnds: false,
                remainingServes: 0,
                matchWinState: MatchWinState.NotWon,
                server: undefined,
                receiver: undefined,
                gameScores: [],
                team1Left: true,
                team1Score: { points: 0, games: 0 },
                team2Score: { points: 0, games: 0 },
                pointHistory: [],
                canResetServerReceiver: false,
                serverReceiverChoice: {
                  servers: [],
                  firstGameDoublesReceivers: receivers,
                },
              }}
              rules={{
                bestOf: 1,
                upTo: 1,
                clearBy2: false,
                numServes: 1,
                team1EndsAt: 1,
                team2EndsAt: 1,
              }}
              umpire={{
                pointScored() {},
                resetServerReceiver() {},
                setFirstGameDoublesReceiver() {},
                setServer() {},
                switchEnds() {},
                undoPoint() {},
                ...umpire,
              }}
            />,
          );
        };

        const getChooseReceiverDialog = (
          getByRole: RenderResult["getByRole"],
        ) => {
          return getByRole("dialog", { name: "Choose receiver" });
        };
        it("should render choose receiver dialog when receiver is required to be chosen", () => {
          const { getByRole } = renderWithFirstGameDoublesReceiver(
            {
              team1Player1Name: "T1P1",
              team2Player1Name: "T2P1",
              team1Player2Name: "T1P2",
              team2Player2Name: "T2P2",
            },
            ["Team2Player1", "Team2Player2"],
          );
          expect(getChooseReceiverDialog(getByRole)).toBeInTheDocument();
        });

        it("should render a button for each receiver", () => {
          const { getByRole } = renderWithFirstGameDoublesReceiver(
            {
              team1Player1Name: "T1P1",
              team2Player1Name: "T2P1",
              team1Player2Name: "T1P2",
              team2Player2Name: "T2P2",
            },
            ["Team2Player1", "Team2Player2"],
          );
          const chooseReceiverDialog = getChooseReceiverDialog(getByRole);
          const dialogButtons =
            within(chooseReceiverDialog).getAllByRole("button");
          const selectReceiver1Button = within(chooseReceiverDialog).getByRole(
            "button",
            {
              name: "T2P1",
            },
          );
          const selectReceiver2Button = within(chooseReceiverDialog).getByRole(
            "button",
            {
              name: "T2P2",
            },
          );
          expect(selectReceiver1Button).toBeInTheDocument();
          expect(selectReceiver2Button).toBeInTheDocument();
          expect(dialogButtons.length).toBe(2);
        });

        interface ReceiverChosenTest {
          playerName: string;
          expectedReceiver: Player;
        }
        const receiverChosenTests: ReceiverChosenTest[] = [
          {
            playerName: "T2P1",
            expectedReceiver: "Team2Player1",
          },
          {
            playerName: "T2P2",
            expectedReceiver: "Team2Player2",
          },
        ];
        it.each(receiverChosenTests)(
          "should setFirstGameDoublesReceiver with chosen receiver when clicked",
          async (receiverChosenTest) => {
            const user = userEvent.setup();
            const setFirstGameDoublesReceiver = jest.fn();
            const { getByRole } = renderWithFirstGameDoublesReceiver(
              {
                team1Player1Name: "T1P1",
                team2Player1Name: "T2P1",
                team1Player2Name: "T1P2",
                team2Player2Name: "T2P2",
              },
              ["Team2Player1", "Team2Player2"],
              true,
              { setFirstGameDoublesReceiver },
            );
            const chooseReceiverDialog = getChooseReceiverDialog(getByRole);
            const selectReceiverButton = within(chooseReceiverDialog).getByRole(
              "button",
              {
                name: receiverChosenTest.playerName,
              },
            );

            await user.click(selectReceiverButton);

            expect(setFirstGameDoublesReceiver).toHaveBeenCalledWith<[Player]>(
              receiverChosenTest.expectedReceiver,
            );
          },
        );
      });

      describe("reset server / receiver button", () => {
        const renderResetServerReceiverButton = (
          canResetServerReceiver: boolean,
          resetServerReceiver: ControllableUmpire["resetServerReceiver"] = jest.fn(),
        ) => {
          const { getByRole } = render(
            <UmpireView
              autoShowServerReceiverChooser={true}
              team1Player1Name="T1P1"
              team2Player1Name="T2P1"
              matchState={{
                canUndoPoint: false,
                isEnds: false,
                remainingServes: 0,
                matchWinState: MatchWinState.NotWon,
                server: undefined,
                receiver: undefined,
                gameScores: [],
                team1Left: true,
                team1Score: { points: 0, games: 0 },
                team2Score: { points: 0, games: 0 },
                pointHistory: [],
                canResetServerReceiver,
                serverReceiverChoice: {
                  servers: [],
                  firstGameDoublesReceivers: [],
                },
              }}
              rules={{
                bestOf: 1,
                upTo: 1,
                clearBy2: false,
                numServes: 1,
                team1EndsAt: 1,
                team2EndsAt: 1,
              }}
              umpire={{
                pointScored() {},
                resetServerReceiver,
                setFirstGameDoublesReceiver() {},
                setServer() {},
                switchEnds() {},
                undoPoint() {},
              }}
            />,
          );

          return getByRole("button", {
            name: "Reset server and receiver",
          });
        };

        it.each([true, false])(
          "should be disabled if MatchState.canResetServerReceiver is false - %p",
          (canResetServerReceiver) => {
            const resetServerReceiverButton = renderResetServerReceiverButton(
              canResetServerReceiver,
            );
            if (canResetServerReceiver) {
              expect(resetServerReceiverButton).toBeEnabled();
            } else {
              expect(resetServerReceiverButton).toBeDisabled();
            }
          },
        );
        it("should call resetServerReceiver when clicked", async () => {
          const user = userEvent.setup();
          const resetServerReceiver = jest.fn();
          const resetServerReceiverButton = renderResetServerReceiverButton(
            true,
            resetServerReceiver,
          );
          await user.click(resetServerReceiverButton);
        });
      });
    });
    describe("button click", () => {
      it("should have choose server receiver button enabled when server requires choosing", () => {});
      it("should have choose server receiver button enabled when doubles receiver requires choosing", () => {});
      it("should have choose server receiver button enabled when chosen and canResetServerReceiver is true", () => {
        // Is this problematic.  Goind to need to call resetServerReceiver before showing the dialog.
      });
      it("should have choose server receiver button disabled when chosen and canResetServerReceiver is false", () => {});
      it("should show the server dialog when clicked", () => {});
    });
  });
  describe("point scoring", () => {
    type ScoreTestState = Pick<MatchState, "matchWinState" | "team1Left">;
    const renderPointButtons = (
      scoreTestState: ScoreTestState,
      serverReceiverChoice: ServerReceiverChoice,
      pointScored: ControllableUmpire["pointScored"] = jest.fn(),
    ) => {
      const { getByRole } = render(
        <UmpireView
          team1Player1Name="T1P1"
          team1Player2Name="T1P2"
          team2Player1Name="T2P1"
          team2Player2Name="T2P2"
          autoShowServerReceiverChooser={true}
          matchState={{
            canUndoPoint: false,
            isEnds: false,
            remainingServes: 0,
            matchWinState: scoreTestState.matchWinState,
            server: undefined,
            receiver: undefined,
            gameScores: [],
            team1Left: scoreTestState.team1Left,
            team1Score: { points: 0, games: 0 },
            team2Score: { points: 0, games: 0 },
            pointHistory: [],
            canResetServerReceiver: false,
            serverReceiverChoice,
          }}
          rules={{
            bestOf: 1,
            upTo: 1,
            clearBy2: false,
            numServes: 1,
            team1EndsAt: 1,
            team2EndsAt: 1,
          }}
          umpire={{
            pointScored,
            resetServerReceiver() {},
            setFirstGameDoublesReceiver() {},
            setServer() {},
            switchEnds() {},
            undoPoint() {},
          }}
        />,
      );
      const scoreLeftButton = getByRole("button", { name: "Score left" });
      const scoreRightButton = getByRole("button", { name: "Score right" });
      return { scoreLeftButton, scoreRightButton };
    };

    // this does not work with ServerReceiverChooser being displayed when auto
    /* it("should not be possible to score a point if server requires choosing", () => {
      const buttons = renderPointButtons(MatchWinState.Team1Won, {
        servers: ["Team1Player1", "Team2Player1"],
        firstGameDoublesReceivers: [],
      });
      expect(buttons.scoreLeftButton).toBeDisabled();
      expect(buttons.scoreRightButton).toBeDisabled();
    });
    it("should not be possible to score a point if doubles receiver requires choosing", () => {
      const buttons = renderPointButtons(MatchWinState.Team1Won, {
        servers: [],
        firstGameDoublesReceivers: ["Team1Player1", "Team1Player2"],
      });
      expect(buttons.scoreLeftButton).toBeDisabled();
      expect(buttons.scoreRightButton).toBeDisabled();
    }); */
    it("should not be possible to score a point if match won", () => {
      const buttons = renderPointButtons(
        { matchWinState: MatchWinState.Team1Won, team1Left: true },
        {
          servers: [],
          firstGameDoublesReceivers: [],
        },
      );
      expect(buttons.scoreLeftButton).toBeDisabled();
      expect(buttons.scoreRightButton).toBeDisabled();
    });
    interface PointScoredTest {
      leftScored: boolean;
      team1Left: boolean;
      expectedTeam1Scored: boolean;
    }
    const pointScoredTests: PointScoredTest[] = [
      {
        leftScored: true,
        team1Left: true,
        expectedTeam1Scored: true,
      },
      {
        leftScored: true,
        team1Left: false,
        expectedTeam1Scored: false,
      },
      {
        leftScored: false,
        team1Left: true,
        expectedTeam1Scored: false,
      },
      {
        leftScored: false,
        team1Left: false,
        expectedTeam1Scored: true,
      },
    ];
    it.each(pointScoredTests)(
      "should pointScored with the correct team",
      async (pointScoredTest) => {
        const user = userEvent.setup();
        const pointScored = jest.fn();
        const buttons = renderPointButtons(
          {
            matchWinState: MatchWinState.NotWon,
            team1Left: pointScoredTest.team1Left,
          },
          {
            servers: [],
            firstGameDoublesReceivers: [],
          },
          pointScored,
        );
        const scoreButton = pointScoredTest.leftScored
          ? buttons.scoreLeftButton
          : buttons.scoreRightButton;

        await user.click(scoreButton);

        expect(pointScored).toHaveBeenCalledWith(
          pointScoredTest.expectedTeam1Scored,
        );
      },
    );
  });
});
