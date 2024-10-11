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
import { MatchWinState } from "../src/umpire/matchWinState";
import * as matchers from "@testing-library/jest-dom/matchers";
import { expect as jestExpect } from "@jest/globals";
import { MatchState, Player, TeamScores } from "../src/umpire";
import { Team } from "../src/umpire/playersHelpers";
import { ServerReceiverChoice } from "../src/umpire/availableServerReceiverChoice";

// mocking due to import.meta.url
jest.mock(
  "../src/umpireView/dialogs/serverReceiver/Tosser/ClickKingTosser",
  () => {
    return {
      ClickKingTosser: () => <div data-testid="tosser"></div>,
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
            team1Player2Name: undefined,
            team2Player2Name: undefined,
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
                completedGameScores: [],
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
                completedGameScores: [],
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
              team1Player2Name={undefined}
              team2Player2Name={undefined}
              matchState={{
                canUndoPoint: false,
                isEnds: false,
                remainingServes: 0,
                matchWinState: MatchWinState.NotWon,
                server: undefined,
                receiver: undefined,
                completedGameScores: [],
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
      it("should have choose server receiver button enabled when server requires choosing", () => {
        const { getByRole } = render(
          <UmpireView
            autoShowServerReceiverChooser={false}
            team1Player1Name="T1P1"
            team2Player1Name="T2P1"
            team1Player2Name={undefined}
            team2Player2Name={undefined}
            matchState={{
              canUndoPoint: false,
              isEnds: false,
              remainingServes: 0,
              matchWinState: MatchWinState.NotWon,
              server: undefined,
              receiver: undefined,
              completedGameScores: [],
              team1Left: true,
              team1Score: { points: 0, games: 0 },
              team2Score: { points: 0, games: 0 },
              pointHistory: [],
              canResetServerReceiver: false,
              serverReceiverChoice: {
                servers: ["Team1Player1", "Team2Player1"],
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
            }}
          />,
        );

        const setServerReceiverButton = getByRole("button", {
          name: "Set server and receiver",
        });
        expect(setServerReceiverButton).toBeEnabled();
      });

      it("should have choose server receiver button enabled when chosen and canResetServerReceiver is true", () => {
        const { getByRole } = render(
          <UmpireView
            autoShowServerReceiverChooser={false}
            team1Player1Name="T1P1"
            team2Player1Name="T2P1"
            team1Player2Name={undefined}
            team2Player2Name={undefined}
            matchState={{
              canUndoPoint: false,
              isEnds: false,
              remainingServes: 0,
              matchWinState: MatchWinState.NotWon,
              server: "Team1Player1",
              receiver: "Team2Player2",
              completedGameScores: [],
              team1Left: true,
              team1Score: { points: 0, games: 0 },
              team2Score: { points: 0, games: 0 },
              pointHistory: [],
              canResetServerReceiver: true,
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
              resetServerReceiver() {},
              setFirstGameDoublesReceiver() {},
              setServer() {},
              switchEnds() {},
              undoPoint() {},
            }}
          />,
        );

        const setServerReceiverButton = getByRole("button", {
          name: "Set server and receiver",
        });
        expect(setServerReceiverButton).toBeEnabled();
      });
      it("should have choose server receiver button disabled when chosen and canResetServerReceiver is false", () => {
        const { getByRole } = render(
          <UmpireView
            autoShowServerReceiverChooser={false}
            team1Player1Name="T1P1"
            team2Player1Name="T2P1"
            team1Player2Name={undefined}
            team2Player2Name={undefined}
            matchState={{
              canUndoPoint: false,
              isEnds: false,
              remainingServes: 0,
              matchWinState: MatchWinState.NotWon,
              server: "Team1Player1",
              receiver: "Team2Player2",
              completedGameScores: [],
              team1Left: true,
              team1Score: { points: 1, games: 0 },
              team2Score: { points: 0, games: 0 },
              pointHistory: [],
              canResetServerReceiver: false,
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
              resetServerReceiver() {},
              setFirstGameDoublesReceiver() {},
              setServer() {},
              switchEnds() {},
              undoPoint() {},
            }}
          />,
        );

        const setServerReceiverButton = getByRole("button", {
          name: "Set server and receiver",
        });
        expect(setServerReceiverButton).toBeDisabled();
      });
      it("should show the server dialog when server to choose and clicked", async () => {
        const user = userEvent.setup();
        const { getByRole } = render(
          <UmpireView
            autoShowServerReceiverChooser={false}
            team1Player1Name="T1P1"
            team2Player1Name="T2P1"
            team1Player2Name={undefined}
            team2Player2Name={undefined}
            matchState={{
              canUndoPoint: false,
              isEnds: false,
              remainingServes: 0,
              matchWinState: MatchWinState.NotWon,
              server: "Team1Player1",
              receiver: "Team2Player2",
              completedGameScores: [],
              team1Left: true,
              team1Score: { points: 1, games: 0 },
              team2Score: { points: 0, games: 0 },
              pointHistory: [],
              canResetServerReceiver: false,
              serverReceiverChoice: {
                servers: ["Team1Player1", "Team2Player1"],
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
            }}
          />,
        );

        const setServerReceiverButton = getByRole("button", {
          name: "Set server and receiver",
        });
        await user.click(setServerReceiverButton);
        const chooseServerDialog = getByRole("dialog", {
          name: "Choose server",
        });
        expect(chooseServerDialog).toBeInTheDocument();
      });

      it("should resetServerReceiver when canResetServerReceiver and clicked", async () => {
        const user = userEvent.setup();
        const resetServerReceiver = jest.fn();
        const { getByRole } = render(
          <UmpireView
            autoShowServerReceiverChooser={false}
            team1Player1Name="T1P1"
            team2Player1Name="T2P1"
            team1Player2Name={undefined}
            team2Player2Name={undefined}
            matchState={{
              canUndoPoint: false,
              isEnds: false,
              remainingServes: 0,
              matchWinState: MatchWinState.NotWon,
              server: "Team1Player1",
              receiver: "Team2Player2",
              completedGameScores: [],
              team1Left: true,
              team1Score: { points: 0, games: 0 },
              team2Score: { points: 0, games: 0 },
              pointHistory: [],
              canResetServerReceiver: true,
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

        const setServerReceiverButton = getByRole("button", {
          name: "Set server and receiver",
        });
        await user.click(setServerReceiverButton);

        expect(resetServerReceiver).toHaveBeenCalled();
      });
      it("should show the server dialog when MatchState changes after canResetServerReceiver and clicked", async () => {
        const user = userEvent.setup();
        const { getByRole, rerender } = render(
          <UmpireView
            autoShowServerReceiverChooser={false}
            team1Player1Name="T1P1"
            team2Player1Name="T2P1"
            team1Player2Name={undefined}
            team2Player2Name={undefined}
            matchState={{
              canUndoPoint: false,
              isEnds: false,
              remainingServes: 0,
              matchWinState: MatchWinState.NotWon,
              server: "Team1Player1",
              receiver: "Team2Player2",
              completedGameScores: [],
              team1Left: true,
              team1Score: { points: 0, games: 0 },
              team2Score: { points: 0, games: 0 },
              pointHistory: [],
              canResetServerReceiver: true,
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
              resetServerReceiver() {},
              setFirstGameDoublesReceiver() {},
              setServer() {},
              switchEnds() {},
              undoPoint() {},
            }}
          />,
        );

        const setServerReceiverButton = getByRole("button", {
          name: "Set server and receiver",
        });
        await user.click(setServerReceiverButton);

        rerender(
          <UmpireView
            autoShowServerReceiverChooser={false}
            team1Player1Name="T1P1"
            team2Player1Name="T2P1"
            team1Player2Name={undefined}
            team2Player2Name={undefined}
            matchState={{
              canUndoPoint: false,
              isEnds: false,
              remainingServes: 0,
              matchWinState: MatchWinState.NotWon,
              server: "Team1Player1",
              receiver: "Team2Player2",
              completedGameScores: [],
              team1Left: true,
              team1Score: { points: 0, games: 0 },
              team2Score: { points: 0, games: 0 },
              pointHistory: [],
              canResetServerReceiver: false,
              serverReceiverChoice: {
                servers: ["Team1Player1", "Team2Player1"],
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
            }}
          />,
        );

        const chooseServerDialog = getByRole("dialog", {
          name: "Choose server",
        });
        expect(chooseServerDialog).toBeInTheDocument();
      });

      it("should show the receiver dialog when there are receivers to choose", () => {
        const { getByRole } = render(
          <UmpireView
            autoShowServerReceiverChooser={false}
            team1Player1Name="T1P1"
            team1Player2Name="T1P2"
            team2Player1Name="T2P1"
            team2Player2Name="T2P2"
            matchState={{
              canUndoPoint: false,
              isEnds: false,
              remainingServes: 0,
              matchWinState: MatchWinState.NotWon,
              server: "Team1Player1",
              receiver: "Team2Player2",
              completedGameScores: [],
              team1Left: true,
              team1Score: { points: 0, games: 0 },
              team2Score: { points: 0, games: 0 },
              pointHistory: [],
              canResetServerReceiver: false,
              serverReceiverChoice: {
                servers: [],
                firstGameDoublesReceivers: ["Team2Player1", "Team2Player2"],
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
            }}
          />,
        );
        const chooseReceiverDialog = getByRole("dialog", {
          name: "Choose receiver",
        });
        expect(chooseReceiverDialog).toBeInTheDocument();
      });
    });
    describe("click king tosser", () => {
      const renderGetTosser = (
        serverReceiverChoice: ServerReceiverChoice,
        gameScores: MatchState["completedGameScores"],
        dialogAriaLabel: string,
      ) => {
        const isDoubles =
          serverReceiverChoice.firstGameDoublesReceivers.length > 0;
        const { getByRole } = render(
          <UmpireView
            team1Player1Name="T1P1"
            team2Player1Name="T2P2"
            team1Player2Name={isDoubles ? "T1P2" : undefined}
            team2Player2Name={isDoubles ? "T2P2" : undefined}
            autoShowServerReceiverChooser={true}
            matchState={{
              canUndoPoint: false,
              isEnds: false,
              remainingServes: 0,
              matchWinState: MatchWinState.NotWon,
              server: undefined,
              receiver: undefined,
              completedGameScores: gameScores,
              team1Left: true,
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
              pointScored() {},
              resetServerReceiver() {},
              setFirstGameDoublesReceiver() {},
              setServer() {},
              switchEnds() {},
              undoPoint() {},
            }}
          />,
        );

        const dialog = getByRole("dialog", { name: dialogAriaLabel });
        return within(dialog).queryByTestId("tosser");
      };
      it("should not show tosser when choosing first doubles receivers", () => {
        const tosser = renderGetTosser(
          {
            servers: [],
            firstGameDoublesReceivers: ["Team1Player1", "Team1Player2"],
          },
          [],
          "Choose receiver",
        );
        expect(tosser).toBeNull();
      });
      it("should show tosser when choosing servers and is the first game", () => {
        const tosser = renderGetTosser(
          {
            servers: ["Team1Player1", "Team2Player1"],
            firstGameDoublesReceivers: [],
          },
          [],
          "Choose server",
        );
        expect(tosser).toBeInTheDocument();
      });
      it("should not show tosser when choosing servers and is not the first game", () => {
        const tosser = renderGetTosser(
          {
            servers: ["Team1Player1", "Team2Player1"],
            firstGameDoublesReceivers: [],
          },
          [{ team1Points: 11, team2Points: 0 }],
          "Choose server",
        );
        expect(tosser).toBeNull();
      });
    });
  });
  describe("points", () => {
    describe("point scoring", () => {
      type ScoreTestState = Pick<MatchState, "matchWinState" | "team1Left">;
      const renderPointButtons = (
        scoreTestState: ScoreTestState,
        serverReceiverChoice: ServerReceiverChoice,
        autoShowServerReceiverChooser = true,
        pointScored: ControllableUmpire["pointScored"] = jest.fn(),
      ) => {
        const { queryByRole } = render(
          <UmpireView
            team1Player1Name="T1P1"
            team1Player2Name="T1P2"
            team2Player1Name="T2P1"
            team2Player2Name="T2P2"
            autoShowServerReceiverChooser={autoShowServerReceiverChooser}
            matchState={{
              canUndoPoint: false,
              isEnds: false,
              remainingServes: 0,
              matchWinState: scoreTestState.matchWinState,
              server: undefined,
              receiver: undefined,
              completedGameScores: [],
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
        const scoreLeftButton = queryByRole("button", { name: "Score left" })!;
        const scoreRightButton = queryByRole("button", {
          name: "Score right",
        })!;
        return { scoreLeftButton, scoreRightButton };
      };

      it.each([true, false])(
        "should not be possible to score a point if server requires choosing - auto %p",
        (autoShowServerReceiverChooser) => {
          const buttons = renderPointButtons(
            {
              matchWinState: MatchWinState.NotWon,
              team1Left: true,
            },
            {
              servers: ["Team1Player1", "Team2Player1"],
              firstGameDoublesReceivers: [],
            },
            autoShowServerReceiverChooser,
          );
          if (autoShowServerReceiverChooser) {
            expect(buttons.scoreLeftButton).toBeNull();
            expect(buttons.scoreRightButton).toBeNull();
          } else {
            expect(buttons.scoreLeftButton).toBeDisabled();
            expect(buttons.scoreRightButton).toBeDisabled();
          }
        },
      );

      it.each([true, false])(
        "should not be possible to score a point if doubles receiver requires choosing - %p",
        (autoShowServerReceiverChooser) => {
          const buttons = renderPointButtons(
            {
              matchWinState: MatchWinState.NotWon,
              team1Left: true,
            },
            {
              servers: [],
              firstGameDoublesReceivers: ["Team1Player1", "Team1Player2"],
            },
            autoShowServerReceiverChooser,
          );
          expect(buttons.scoreLeftButton).toBeNull();
          expect(buttons.scoreRightButton).toBeNull();
        },
      );

      it.each([
        MatchWinState.GamePointTeam1,
        MatchWinState.GamePointTeam2,
        MatchWinState.MatchPointTeam1,
        MatchWinState.MatchPointTeam2,
        MatchWinState.NotWon,
        MatchWinState.Team1Won,
        MatchWinState.Team2Won,
      ])(
        "should not be possible to score a point if match won",
        (matchWinState) => {
          const buttons = renderPointButtons(
            { matchWinState, team1Left: true },
            {
              servers: [],
              firstGameDoublesReceivers: [],
            },
          );
          if (
            matchWinState === MatchWinState.Team1Won ||
            matchWinState === MatchWinState.Team2Won
          ) {
            expect(buttons.scoreLeftButton).toBeDisabled();
            expect(buttons.scoreRightButton).toBeDisabled();
          } else {
            expect(buttons.scoreLeftButton).toBeEnabled();
            expect(buttons.scoreRightButton).toBeEnabled();
          }
        },
      );
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
            true,
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
    describe("undo point", () => {
      const renderUndoPointButton = (
        canUndoPoint: boolean,
        undoPoint = jest.fn(),
      ) => {
        const { getByRole } = render(
          <UmpireView
            team1Player1Name="T1P1"
            team1Player2Name="T1P2"
            team2Player1Name="T2P1"
            team2Player2Name="T2P2"
            autoShowServerReceiverChooser={false}
            matchState={{
              canUndoPoint,
              isEnds: false,
              remainingServes: 0,
              matchWinState: MatchWinState.NotWon,
              server: undefined,
              receiver: undefined,
              completedGameScores: [],
              team1Left: true,
              team1Score: { points: 0, games: 0 },
              team2Score: { points: 0, games: 0 },
              pointHistory: [],
              canResetServerReceiver: false,
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
              resetServerReceiver() {},
              setFirstGameDoublesReceiver() {},
              setServer() {},
              switchEnds() {},
              undoPoint,
            }}
          />,
        );

        return getByRole("button", { name: "Undo point" });
      };
      it.each([true, false])(
        "should be enabled based on the match state",
        (enabled) => {
          const undoPointButton = renderUndoPointButton(enabled);
          if (enabled) {
            expect(undoPointButton).toBeEnabled();
          } else {
            expect(undoPointButton).toBeDisabled();
          }
        },
      );
      it("should undoPoint when clicked", async () => {
        const user = userEvent.setup();
        const undoPoint = jest.fn();
        const undoPointButton = renderUndoPointButton(true, undoPoint);
        await user.click(undoPointButton);

        expect(undoPoint).toHaveBeenCalled();
      });
    });
  });
  describe("MatchView", () => {
    describe("MatchScore", () => {
      const renderMatchScore = (teamScores: TeamScores, team1Left = true) => {
        const { getByRole } = render(
          <UmpireView
            team1Player1Name="T1P1"
            team1Player2Name="T1P2"
            team2Player1Name="T2P1"
            team2Player2Name="T2P2"
            autoShowServerReceiverChooser={false}
            matchState={{
              canUndoPoint: false,
              isEnds: false,
              remainingServes: 0,
              matchWinState: MatchWinState.NotWon,
              server: undefined,
              receiver: undefined,
              completedGameScores: [],
              team1Left,
              ...teamScores,
              pointHistory: [],
              canResetServerReceiver: false,
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
              resetServerReceiver() {},
              setFirstGameDoublesReceiver() {},
              setServer() {},
              switchEnds() {},
              undoPoint() {},
            }}
          />,
        );

        /*
          <section> elements should have an internal browser role of section until you give them an accessible name; in which case, they implicitly have the role region:
        */
        const matchScore = getByRole("region", { name: "Match score" });
        const leftTeamScore = within(matchScore).getByRole("region", {
          name: "Left team",
        });
        const rightTeamScore = within(matchScore).getByRole("region", {
          name: "Right team",
        });
        const leftGames = within(leftTeamScore).getByLabelText("Games");
        const leftPoints = within(leftTeamScore).getByLabelText("Points");
        const rightGames = within(rightTeamScore).getByLabelText("Games");
        const rightPoints = within(rightTeamScore).getByLabelText("Points");

        return {
          matchScore,
          leftTeamScore,
          rightTeamScore,
          leftGames,
          leftPoints,
          rightGames,
          rightPoints,
        };
      };
      xit("should have the left score on the left and the right score on the right", () => {});
      xit("should have game point then set point for left", () => {});
      xit("should have set point then game point for right", () => {});
      xit("should display points larger than sets", () => {});
      xit("should have italic games and points if team won", () => {});

      // these colours are the same
      xit("should color games differently when team is at match point", () => {});
      xit("should color points differently when team is at match point or game point", () => {});

      xit("should move negative point indicator to the right when right", () => {});
      it.each([true, false])(
        "should show the scores from MatchState - team1 left %p",
        (team1Left) => {
          const teamScores = {
            team1Score: { points: 1, games: 2 },
            team2Score: { points: 2, games: 1 },
          };
          const { leftGames, leftPoints, rightGames, rightPoints } =
            renderMatchScore(teamScores, team1Left);

          const expectedLeftGames = team1Left ? "2" : "1";
          const expectedLeftPoints = team1Left ? "1" : "2";
          const expectedRightGames = team1Left ? "1" : "2";
          const expectedRightPoints = team1Left ? "2" : "1";

          expect(leftGames).toHaveTextContent(expectedLeftGames);
          expect(leftPoints).toHaveTextContent(expectedLeftPoints);
          expect(rightGames).toHaveTextContent(expectedRightGames);
          expect(rightPoints).toHaveTextContent(expectedRightPoints);
        },
      );
    });
    describe("Teams", () => {
      interface RenderTeamOptions {
        team1Left: boolean;
        server: Player | undefined;
        receiver: Player | undefined;
        remainingServes: number;
        serverReceiverTop?: boolean;
      }
      const team1Player1Name = "T1P1";
      const team1Player2Name = "T1P2";
      const team2Player1Name = "T2P1";
      const team2Player2Name = "T2P2";
      const renderTeams = (
        renderTeamOptions: RenderTeamOptions = {
          server: "Team1Player1",
          receiver: "Team2Player1",
          team1Left: true,
          remainingServes: 2,
        },
      ) => {
        const {
          server,
          receiver,
          team1Left,
          serverReceiverTop,
          remainingServes,
        } = renderTeamOptions;
        const { getByRole } = render(
          <UmpireView
            serverReceiverTop={serverReceiverTop}
            team1Player1Name={team1Player1Name}
            team1Player2Name={team1Player2Name}
            team2Player1Name={team2Player1Name}
            team2Player2Name={team2Player2Name}
            autoShowServerReceiverChooser={false}
            matchState={{
              canUndoPoint: false,
              isEnds: false,
              remainingServes,
              matchWinState: MatchWinState.NotWon,
              server,
              receiver,
              completedGameScores: [],
              team1Left,
              team1Score: { points: 0, games: 0 },
              team2Score: { points: 0, games: 0 },
              pointHistory: [],
              canResetServerReceiver: false,
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
              resetServerReceiver() {},
              setFirstGameDoublesReceiver() {},
              setServer() {},
              switchEnds() {},
              undoPoint() {},
            }}
          />,
        );
        const teams = getByRole("region", { name: "Teams" });
        const leftTeam = within(teams).getByRole("region", {
          name: "Left team",
        });
        const rightTeam = within(teams).getByRole("region", {
          name: "Right team",
        });
        return {
          teams: getByRole("region", { name: "Teams" }),
          leftTeam,
          rightTeam,
        };
      };
      it("should have a teams region with left teams and right teams", () => {
        const { teams, leftTeam, rightTeam } = renderTeams();
        expect(teams).toBeInTheDocument();
        expect(leftTeam).toBeInTheDocument();
        expect(rightTeam).toBeInTheDocument();
      });

      interface PlayerServiceInfoTest extends RenderTeamOptions {
        expectedLeftPlayerTopInfo: string;
        expectedLeftPlayerBottomInfo: string;
        expectedRightPlayerTopInfo: string;
        expectedRightPlayerBottomInfo: string;

        team1Left: boolean;
        server: Player | undefined;
        receiver: Player | undefined;
        serverReceiverTop?: boolean;

        testDescription: string;
      }
      const playerServiceInfoTests: PlayerServiceInfoTest[] = [
        {
          expectedLeftPlayerTopInfo: `(2)${team1Player1Name}`,
          expectedLeftPlayerBottomInfo: team1Player2Name,
          expectedRightPlayerTopInfo: `(R)${team2Player2Name}`,
          expectedRightPlayerBottomInfo: team2Player1Name,
          server: "Team1Player1",
          receiver: "Team2Player2",
          team1Left: true,
          remainingServes: 2,
          testDescription: "show server/receiver top when server receiver top",
          serverReceiverTop: true,
        },
        {
          expectedLeftPlayerTopInfo: `(2)${team1Player1Name}`,
          expectedLeftPlayerBottomInfo: team1Player2Name,
          expectedRightPlayerTopInfo: team2Player1Name,
          expectedRightPlayerBottomInfo: `(R)${team2Player2Name}`,
          server: "Team1Player1",
          receiver: "Team2Player2",
          team1Left: true,
          remainingServes: 2,
          testDescription:
            "show server/receiver in order when server receiver is not top",
          serverReceiverTop: false,
        },
        {
          expectedLeftPlayerTopInfo: `(1)${team1Player1Name}`,
          expectedLeftPlayerBottomInfo: team1Player2Name,
          expectedRightPlayerTopInfo: `(R)${team2Player2Name}`,
          expectedRightPlayerBottomInfo: team2Player1Name,
          server: "Team1Player1",
          receiver: "Team2Player2",
          team1Left: true,
          remainingServes: 1,
          testDescription: "show 1 remaining serve",
          serverReceiverTop: true,
        },
        {
          expectedLeftPlayerTopInfo: `(R)${team1Player1Name}`,
          expectedLeftPlayerBottomInfo: team1Player2Name,
          expectedRightPlayerTopInfo: `(1)${team2Player2Name}`,
          expectedRightPlayerBottomInfo: team2Player1Name,
          server: "Team2Player2",
          receiver: "Team1Player1",
          team1Left: true,
          remainingServes: 1,
          testDescription: "should work with right team serving",
          serverReceiverTop: true,
        },
        {
          expectedLeftPlayerTopInfo: `(1)${team2Player2Name}`,
          expectedLeftPlayerBottomInfo: team2Player1Name,
          expectedRightPlayerTopInfo: `(R)${team1Player1Name}`,
          expectedRightPlayerBottomInfo: team1Player2Name,
          server: "Team2Player2",
          receiver: "Team1Player1",
          team1Left: false,
          remainingServes: 1,
          testDescription: "should work with team1 on the right",
          serverReceiverTop: true,
        },
        {
          expectedLeftPlayerTopInfo: `(1)${team2Player2Name}`,
          expectedLeftPlayerBottomInfo: team2Player1Name,
          expectedRightPlayerTopInfo: `(R)${team1Player1Name}`,
          expectedRightPlayerBottomInfo: team1Player2Name,
          server: "Team2Player2",
          receiver: "Team1Player1",
          team1Left: false,
          remainingServes: 1,
          testDescription: "should deault serverReceiverTop true",
        },
        {
          expectedLeftPlayerTopInfo: team1Player1Name,
          expectedLeftPlayerBottomInfo: team1Player2Name,
          expectedRightPlayerTopInfo: team2Player1Name,
          expectedRightPlayerBottomInfo: team2Player2Name,
          server: undefined,
          receiver: undefined,
          team1Left: true,
          remainingServes: 2,
          testDescription: "should work when there is no server / receiver",
          serverReceiverTop: false,
        },
      ];
      it.each(playerServiceInfoTests)(
        "should $testDescription",
        (playerServiceInfoTest) => {
          const {
            expectedLeftPlayerTopInfo,
            expectedLeftPlayerBottomInfo,
            expectedRightPlayerTopInfo,
            expectedRightPlayerBottomInfo,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            testDescription,
            ...renderTeamOptions
          } = playerServiceInfoTest;

          const { leftTeam, rightTeam } = renderTeams(renderTeamOptions);
          const leftPlayerTopInfo = leftTeam.children[0].textContent;
          expect(expectedLeftPlayerTopInfo).toBe(leftPlayerTopInfo);
          const leftPlayerBottomInfo = leftTeam.children[1].textContent;
          expect(expectedLeftPlayerBottomInfo).toBe(leftPlayerBottomInfo);
          const rightPlayerTopInfo = rightTeam.children[0].textContent;
          expect(expectedRightPlayerTopInfo).toBe(rightPlayerTopInfo);
          const rightPlayerBottomInfo = rightTeam.children[1].textContent;
          expect(expectedRightPlayerBottomInfo).toBe(rightPlayerBottomInfo);
        },
      );
    });
  });
  describe("EndsDialog", () => {
    it("should display the ends dialog with message Ends ! when MatchState.isEnds is true and singles", () => {
      const { getByRole } = render(
        <UmpireView
          team1Player1Name="T1P1"
          team2Player1Name="T2P1"
          team1Player2Name={undefined}
          team2Player2Name={undefined}
          autoShowServerReceiverChooser={false}
          matchState={{
            canUndoPoint: true,
            isEnds: true,
            remainingServes: 0,
            matchWinState: MatchWinState.NotWon,
            server: undefined,
            receiver: undefined,
            completedGameScores: [],
            team1Left: true,
            team1Score: { points: 0, games: 0 },
            team2Score: { points: 0, games: 0 },
            pointHistory: [],
            canResetServerReceiver: false,
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
            resetServerReceiver() {},
            setFirstGameDoublesReceiver() {},
            setServer() {},
            switchEnds() {},
            undoPoint() {},
          }}
        />,
      );
      const endsDialog = getByRole("dialog");
      expect(endsDialog).toHaveTextContent("Ends !");
    });

    it("should display the ends dialog with message Ends ! Switch receivers when MatchState.isEnds is true and doubles", () => {
      const { getByRole } = render(
        <UmpireView
          team1Player1Name="T1P1"
          team1Player2Name="T1P2"
          team2Player1Name="T2P1"
          team2Player2Name="T2P2"
          autoShowServerReceiverChooser={false}
          matchState={{
            canUndoPoint: true,
            isEnds: true,
            remainingServes: 0,
            matchWinState: MatchWinState.NotWon,
            server: undefined,
            receiver: undefined,
            completedGameScores: [],
            team1Left: true,
            team1Score: { points: 0, games: 0 },
            team2Score: { points: 0, games: 0 },
            pointHistory: [],
            canResetServerReceiver: false,
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
            resetServerReceiver() {},
            setFirstGameDoublesReceiver() {},
            setServer() {},
            switchEnds() {},
            undoPoint() {},
          }}
        />,
      );
      const endsDialog = getByRole("dialog");
      expect(endsDialog).toHaveTextContent("Ends ! Switch receivers");
    });
    it("should not display the ends dialog if not ends", () => {
      const { queryByRole } = render(
        <UmpireView
          team1Player1Name="T1P1"
          team2Player1Name="T2P1"
          team1Player2Name={undefined}
          team2Player2Name={undefined}
          autoShowServerReceiverChooser={false}
          matchState={{
            canUndoPoint: true,
            isEnds: false,
            remainingServes: 0,
            matchWinState: MatchWinState.NotWon,
            server: undefined,
            receiver: undefined,
            completedGameScores: [],
            team1Left: true,
            team1Score: { points: 0, games: 0 },
            team2Score: { points: 0, games: 0 },
            pointHistory: [],
            canResetServerReceiver: false,
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
            resetServerReceiver() {},
            setFirstGameDoublesReceiver() {},
            setServer() {},
            switchEnds() {},
            undoPoint() {},
          }}
        />,
      );
      const endsDialog = queryByRole("dialog");
      expect(endsDialog).toBeNull();
    });
  });
});
