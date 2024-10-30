/**
 * @jest-environment jsdom
 */
import { render, within } from "@testing-library/react";
import {
  openMenuClickMenuItem,
  openMenuExpectMenuItemDisabled,
} from "../test-helpers/mui/menu";
import createEmulatorTests from "./createEmulatorTests";
import {
  LeagueMatchView,
  gameMenuButtonAriaLabel,
} from "../src/teamMatches/league/play/league-match-view/LeagueMatchView";
import {
  SelectedPlayers,
  SetupDoubles,
  SetupMatch,
  allPlayersSelected,
  defaultAwayPlayerNames,
  defaultHomePlayerNames,
  getMatchSetupThatSetsDefaultPlayersThatAreSelected,
  noPlayersSelected,
  setUpDatabaseWithDefaultPlayersThatAreSelected,
  setupDatabase,
} from "./setupDatabase";
import { unselectedPlayerCellColor } from "../src/teamMatches/league/play/league-match-view/scoresheet/ui/getPlayerCell";
import {
  leagueMatchPlayersPositionDisplays,
  leagueMatchTeamsPlayersPositionDisplay,
} from "../src/teamMatches/league/play/format/singlesLeagueMatchPlayers";
import {
  TextDecorationLine,
  expectNotSingleTextDecorationLine,
  expectSingleTextDecorationLine,
} from "../test-helpers/testing-library/expectations";
import {
  DbMatch,
  getTeamConcedeOrForfeitKey,
} from "../src/firebase/rtb/match/dbMatch";
import { GameScore, Player } from "../src/umpire";

import { getLast } from "../src/helpers/getLast";
import { ServerReceiver } from "../src/umpire/commonTypes";
import { getInitials } from "../src/umpireView/helpers";
import {
  scoreGames,
  scoreGamesWon,
  scorePoints,
} from "../src/umpire/umpireHelpers";
import {
  GameScoreTeamCells,
  findAllGameRows,
  findAllOrderCells,
  findGameMenuButton,
  findGameRow,
  findGameWinnerAndGamesWonCell,
  findLeagueMatchResultCell,
  getAllGameScoreTeamCells,
  getGameWinner,
  getGamesWon,
  getPlayerCell,
  getTeamGameWon,
  getTeamMatchScore,
  getTeamPlayerSpans,
} from "./LeagueMatchScoresheetSelectors";
import {
  concededOrForfeitedColor,
  gamePointColor,
  matchPointColor,
  matchWonColor,
  normalColor,
  notLeadingColor,
  unassailableColor,
  winColor,
  winningMatchColor,
} from "../src/teamMatches/league/play/league-match-view/scoresheet/ui/colors";
import {
  updateMatchViaUmpire,
  matchScoreGameScores,
  matchScorePoints,
  matchScoreGamesWon,
  matchWinGame,
} from "./matchScoringHelpers";

// mocking due to import.meta.url
jest.mock(
  "../src/umpireView/dialogs/serverReceiver/Tosser/ClickKingTosser",
  () => {
    return {
      ClickKingTosser: () => <div data-testid="tosser"></div>,
    };
  },
);

jest.mock("../src/teamMatches/league/play/LeagueMatchScoreboard", () => {
  return {
    LeagueMatchScoreboard: () => (
      <div data-testid="leaguematchscoreboard"></div>
    ),
  };
});

const { createMaylandsComps, database } = createEmulatorTests();

describe("render scoresheet", () => {
  beforeAll(() => {
    Object.defineProperty(window.screen, "orientation", {
      value: {
        type: "portrait-primary",
        addEventListener: () => {
          // do nothing
        },
        removeEventListener: () => {
          // do nothing
        },
      },
    });
  });
  function createApp(leagueMatchId: string) {
    return createMaylandsComps(
      <LeagueMatchView leagueMatchId={leagueMatchId} />,
    );
  }

  const expectScoreTextContent = (
    element: HTMLElement,
    homeGamesWon: number,
    awayGamesWon: number,
  ) => {
    expect(element).toHaveTextContent(`${homeGamesWon} - ${awayGamesWon}`);
  };

  describe("games", () => {
    it("should render scoresheet table with 10 game rows", async () => {
      const leagueMatchKey = await setupDatabase(database);
      render(createApp(leagueMatchKey));

      await findAllGameRows();
    });

    describe("player cells", () => {
      async function renderGetPlayerCells(leagueMatchKey: string) {
        render(createApp(leagueMatchKey));
        const gameRows = await findAllGameRows();
        return gameRows.map((gameRow) => {
          return {
            homePlayerCell: getPlayerCell(true, gameRow),
            awayPlayerCell: getPlayerCell(false, gameRow),
          };
        });
      }

      async function gamePlayersCellTest(
        homePlayersSelected: SelectedPlayers,
        awayPlayersSelected: SelectedPlayers,
        setupDoubles: SetupDoubles = () => {
          // do nothing
        },
      ) {
        const leagueMatchKey =
          await setUpDatabaseWithDefaultPlayersThatAreSelected(
            database,
            homePlayersSelected,
            awayPlayersSelected,
            setupDoubles,
          );
        return renderGetPlayerCells(leagueMatchKey);
      }

      async function singlesGamePlayersCellTest(
        homePlayersSelected: SelectedPlayers,
        awayPlayersSelected: SelectedPlayers,
      ) {
        const allGames = await gamePlayersCellTest(
          homePlayersSelected,
          awayPlayersSelected,
        );
        // take all except the last
        allGames.pop();
        return allGames;
      }

      async function doublesGamePlayersCellTest(
        homePlayersSelected: SelectedPlayers,
        awayPlayersSelected: SelectedPlayers,
        setupDoubles: SetupDoubles = () => {
          // do nothing
        },
      ) {
        const allGames = await gamePlayersCellTest(
          homePlayersSelected,
          awayPlayersSelected,
          setupDoubles,
        );
        return allGames.pop()!;
      }

      const expectHomeStrikethrough = (
        homePlayerCell: HTMLTableCellElement,
        awayPlayerCell: HTMLTableCellElement,
      ) => {
        expectSingleTextDecorationLine(
          homePlayerCell,
          TextDecorationLine.LineThrough,
        );
        expectNotSingleTextDecorationLine(
          awayPlayerCell,
          TextDecorationLine.LineThrough,
        );
      };

      describe("unselected", () => {
        function unselectedSinglesGamePlayersCellTest() {
          return singlesGamePlayersCellTest(
            noPlayersSelected,
            noPlayersSelected,
          );
        }
        function unselectedDoublesGamePlayersCellTest() {
          return doublesGamePlayersCellTest(
            noPlayersSelected,
            noPlayersSelected,
          );
        }

        describe("common styling", () => {
          describe("forfeited", () => {
            const setUpGetHomeForfeitedGameCells = async () => {
              const leagueMatchKey = await setupDatabase(
                database,
                getMatchSetupThatSetsDefaultPlayersThatAreSelected(
                  noPlayersSelected,
                  noPlayersSelected,
                  undefined,
                  (dbMatch, index) => {
                    if (index === 0) {
                      dbMatch.team1ConcedeOrForfeit = {
                        isConcede: false,
                      };
                    }
                  },
                ),
              );
              const cells = await renderGetPlayerCells(leagueMatchKey);
              return cells[0];
            };
            it("should style position identifiers in red if not forfeited", async () => {
              const { homePlayerCell, awayPlayerCell } =
                await setUpGetHomeForfeitedGameCells();
              expect(homePlayerCell).not.toHaveStyle({
                color: unselectedPlayerCellColor,
              });
              expect(awayPlayerCell).toHaveStyle({
                color: unselectedPlayerCellColor,
              });
            });
            it("should strikethrough if forfeited", async () => {
              const { homePlayerCell, awayPlayerCell } =
                await setUpGetHomeForfeitedGameCells();
              expectHomeStrikethrough(homePlayerCell, awayPlayerCell);
            });
          });
        });

        it("should render singles match player names with position identifiers", async () => {
          const cells = await unselectedSinglesGamePlayersCellTest();
          cells.forEach(({ homePlayerCell, awayPlayerCell }, i) => {
            const { homePositionDisplay, awayPositionDisplay } =
              leagueMatchPlayersPositionDisplays[i];
            expect(homePlayerCell.innerHTML).toBe(homePositionDisplay.display);
            expect(awayPlayerCell.innerHTML).toBe(awayPositionDisplay.display);
          });
        });

        it("should render doubles identifiers with a ?", async () => {
          const { homePlayerCell, awayPlayerCell } =
            await unselectedDoublesGamePlayersCellTest();
          expect(homePlayerCell.innerHTML).toBe("?");
          expect(awayPlayerCell.innerHTML).toBe("?");
        });
      });
      describe("selected", () => {
        describe("common styling", () => {
          it("should strikethrough if conceded", async () => {
            const leagueMatchKey = await setupDatabase(
              database,
              getMatchSetupThatSetsDefaultPlayersThatAreSelected(
                allPlayersSelected,
                allPlayersSelected,
                undefined,
                (dbMatch, index) => {
                  if (index === 0) {
                    dbMatch.team1ConcedeOrForfeit = {
                      isConcede: true,
                    };
                  }
                },
              ),
            );
            const cells = await renderGetPlayerCells(leagueMatchKey);
            const { homePlayerCell, awayPlayerCell } = cells[0];
            expectHomeStrikethrough(homePlayerCell, awayPlayerCell);
          });

          const setDoublesServerReceiver = (
            match: DbMatch,
            server: Player,
            receiver: Player,
          ) => {
            updateMatchViaUmpire(match, (umpire) => {
              umpire.setServer(server);
              umpire.setFirstGameDoublesReceiver(receiver);
            });
          };

          async function setUpServerReceiverDoublesGameCells(
            server: Player,
            receiver: Player,
          ) {
            const leagueMatchKey = await setupDatabase(
              database,
              getMatchSetupThatSetsDefaultPlayersThatAreSelected(
                allPlayersSelected,
                allPlayersSelected,
                (doublesMatch, homeTeamPlayerIds, awayTeamPlayerIds) => {
                  doublesMatch.team1Player1Id = homeTeamPlayerIds[0]!;
                  doublesMatch.team1Player2Id = homeTeamPlayerIds[1]!;
                  doublesMatch.team2Player1Id = awayTeamPlayerIds[0]!;
                  doublesMatch.team2Player2Id = awayTeamPlayerIds[1]!;
                  setDoublesServerReceiver(doublesMatch, server, receiver);
                },
              ),
            );
            const cells = await renderGetPlayerCells(leagueMatchKey);
            return getLast(cells);
          }

          const serverReceiverUnderlineOverlineTests: ServerReceiver[] = [
            {
              server: "Team1Player1",
              receiver: "Team2Player1",
            },
            {
              server: "Team1Player2",
              receiver: "Team2Player2",
            },
            {
              server: "Team2Player1",
              receiver: "Team1Player1",
            },
            {
              server: "Team2Player2",
              receiver: "Team1Player2",
            },
          ];
          it.each(serverReceiverUnderlineOverlineTests)(
            "should underline the server and overline the receiver - $server, $receiver",
            async (test) => {
              const cells = await setUpServerReceiverDoublesGameCells(
                test.server,
                test.receiver,
              );
              const { homePlayerCell, awayPlayerCell } = cells;
              const homePlayerSpans = getTeamPlayerSpans(homePlayerCell);
              const awayPlayerSpans = getTeamPlayerSpans(awayPlayerCell);
              const spanLookup = new Map<Player, HTMLElement>([
                ["Team1Player1", homePlayerSpans[0]],
                ["Team1Player2", homePlayerSpans[1]],
                ["Team2Player1", awayPlayerSpans[0]],
                ["Team2Player2", awayPlayerSpans[1]],
              ]);

              const server = spanLookup.get(test.server);
              const receiver = spanLookup.get(test.receiver);
              const notServerOrReceiver = [
                homePlayerSpans,
                awayPlayerSpans,
              ].flatMap((spans) =>
                spans.filter((span) => span !== server && span !== receiver),
              );
              expectSingleTextDecorationLine(
                server!,
                TextDecorationLine.Underline,
              );
              expectSingleTextDecorationLine(
                receiver!,
                TextDecorationLine.Overline,
              );
              notServerOrReceiver.forEach((span) => {
                expectSingleTextDecorationLine(span, TextDecorationLine.None);
              });
            },
          );
        });
        it("should render the singles player names with initials", async () => {
          const cells = await singlesGamePlayersCellTest(
            allPlayersSelected,
            allPlayersSelected,
          );
          cells.forEach(({ homePlayerCell, awayPlayerCell }, i) => {
            const { homePositionDisplay, awayPositionDisplay } =
              leagueMatchPlayersPositionDisplays[i];
            const homePlayerName =
              defaultHomePlayerNames[homePositionDisplay.position];
            const awayPlayerName =
              defaultAwayPlayerNames[awayPositionDisplay.position];
            expect(homePlayerCell.textContent).toBe(
              getInitials(homePlayerName),
            );
            expect(awayPlayerCell.textContent).toBe(
              getInitials(awayPlayerName),
            );
          });
        });
        type PlayerPosition = 0 | 1 | 2;
        interface DoublesPlayerNameTest {
          homePositions: PlayerPosition[];
          awayPositions: PlayerPosition[];
        }
        const doublesPlayerNameTests: DoublesPlayerNameTest[] = [
          {
            homePositions: [0, 1],
            awayPositions: [0, 1],
          },
          {
            homePositions: [1, 2],
            awayPositions: [1, 2],
          },
          {
            homePositions: [0, 2],
            awayPositions: [0, 2],
          },
        ];
        it.each(doublesPlayerNameTests)(
          "should render the doubles player names with player position displays $homePositions, $awayPositions",
          async ({ homePositions, awayPositions }) => {
            const { homePlayerCell, awayPlayerCell } =
              await doublesGamePlayersCellTest(
                allPlayersSelected,
                allPlayersSelected,
                (doublesMatch, homeTeamPlayerIds, awayTeamPlayerIds) => {
                  doublesMatch.team1Player1Id =
                    homeTeamPlayerIds[homePositions[0]]!;
                  doublesMatch.team1Player2Id =
                    homeTeamPlayerIds[homePositions[1]]!;
                  doublesMatch.team2Player1Id =
                    awayTeamPlayerIds[awayPositions[0]]!;
                  doublesMatch.team2Player2Id =
                    awayTeamPlayerIds[awayPositions[1]]!;
                },
              );

            const homePlayer1Display =
              leagueMatchTeamsPlayersPositionDisplay
                .homeTeamPlayersPositionDisplay[homePositions[0]];

            const homePlayer2Display =
              leagueMatchTeamsPlayersPositionDisplay
                .homeTeamPlayersPositionDisplay[homePositions[1]];

            const awayPlayer1Display =
              leagueMatchTeamsPlayersPositionDisplay
                .awayTeamPlayersPositionDisplay[awayPositions[0]];

            const awayPlayer2Display =
              leagueMatchTeamsPlayersPositionDisplay
                .awayTeamPlayersPositionDisplay[awayPositions[1]];

            expect(homePlayerCell.textContent).toBe(
              `${homePlayer1Display}${homePlayer2Display}`,
            );
            expect(awayPlayerCell.textContent).toBe(
              `${awayPlayer1Display}${awayPlayer2Display}`,
            );
          },
        );
      });
    });

    describe("game score cells", () => {
      async function setupGetFirstMatchGameScoreCells(
        setupFirstMatch: (firstMatch: DbMatch) => void = () => {
          // do nothing
        },
      ) {
        const leagueMatchKey = await setupDatabase(
          database,
          getMatchSetupThatSetsDefaultPlayersThatAreSelected(
            allPlayersSelected,
            allPlayersSelected,
            undefined,
            (dbMatch, index) => {
              if (index === 0) {
                setupFirstMatch(dbMatch);
              }
            },
          ),
        );

        render(createApp(leagueMatchKey));

        const firstGameRow = await findGameRow(0);
        return getAllGameScoreTeamCells(firstGameRow);
      }

      const expectScores = (
        gameScoreTeamCells: GameScoreTeamCells,
        expectedHome: string,
        expectedAway: string,
      ) => {
        const { homeTeamScoreCell, awayTeamScoreCell } = gameScoreTeamCells;
        expect(homeTeamScoreCell.textContent).toBe(expectedHome);
        expect(awayTeamScoreCell.textContent).toBe(expectedAway);
      };

      it("should show 0,0 for home and away when first game and no points scored and being umpired", async () => {
        const gameScoreTeamCells = await setupGetFirstMatchGameScoreCells(
          (firstMatch) => {
            firstMatch.umpired = true;
          },
        );
        expectScores(gameScoreTeamCells[0], "0", "0");
      });

      interface PreviousGamesAndCurrentGamesTest {
        gameScores: [GameScore, GameScore]; // previous game, current game
      }
      const previousGamesAndCurrentGamesTests: PreviousGamesAndCurrentGamesTest[] =
        [
          {
            gameScores: [
              { team1Points: 11, team2Points: 6 },
              { team1Points: 0, team2Points: 0 },
            ],
          },
          {
            gameScores: [
              { team1Points: 2, team2Points: 11 },
              { team1Points: 1, team2Points: 3 },
            ],
          },
        ];

      it.each(previousGamesAndCurrentGamesTests)(
        "should show game scores for previous games and current games",
        async (test) => {
          const gameScoreTeamCells = await setupGetFirstMatchGameScoreCells(
            (firstMatch) => {
              matchScoreGameScores(firstMatch, test.gameScores);
            },
          );
          test.gameScores.forEach((gameScore, i) => {
            expectScores(
              gameScoreTeamCells[i],
              gameScore.team1Points.toString(),
              gameScore.team2Points.toString(),
            );
          });
        },
      );

      describe("games scores displayed as dashes", () => {
        const expectDashScores = (gameScoreTeamCells: GameScoreTeamCells) => {
          const { homeTeamScoreCell, awayTeamScoreCell } = gameScoreTeamCells;
          expect(homeTeamScoreCell.textContent).toBe("-");
          expect(awayTeamScoreCell.textContent).toBe("-");
        };

        it("should show - for home and away when first game and no points scored and not umpired", async () => {
          const gameScoresTeamCells = await setupGetFirstMatchGameScoreCells();
          expectDashScores(gameScoresTeamCells[0]);
        });

        it("should show - for home and away when the match has not enetered that game number", async () => {
          const gameScoreCells = await setupGetFirstMatchGameScoreCells(
            (firstMatch) => {
              matchScorePoints(firstMatch, true);
            },
          );
          gameScoreCells
            .filter((_, i) => i !== 0)
            .forEach((gameScoreTeamCells) =>
              expectDashScores(gameScoreTeamCells),
            );
        });
      });

      describe("game score cells styling", () => {
        it("should color game score cell of the winner and not for the loser if game won", async () => {
          const gameScoreTeamCells = await setupGetFirstMatchGameScoreCells(
            (firstMatch) => {
              matchScoreGameScores(firstMatch, [
                { team1Points: 11, team2Points: 6 },
              ]);
            },
          );
          const { homeTeamScoreCell, awayTeamScoreCell } =
            gameScoreTeamCells[0];
          expect(homeTeamScoreCell).toHaveStyle({ color: winColor });
          expect(awayTeamScoreCell).toHaveStyle({ color: normalColor });
        });
        it("should color the game score cell if game point", async () => {
          const gameScoreTeamCells = await setupGetFirstMatchGameScoreCells(
            (firstMatch) => {
              matchScoreGameScores(firstMatch, [
                { team1Points: 10, team2Points: 6 },
              ]);
            },
          );
          const { homeTeamScoreCell, awayTeamScoreCell } =
            gameScoreTeamCells[0];
          expect(homeTeamScoreCell).toHaveStyle({ color: gamePointColor });
          expect(awayTeamScoreCell).toHaveStyle({ color: normalColor });
        });
        it("should color the game score cell if match point", async () => {
          const gameScoreTeamCells = await setupGetFirstMatchGameScoreCells(
            (firstMatch) => {
              matchScoreGameScores(firstMatch, [
                { team1Points: 11, team2Points: 6 },
                { team1Points: 11, team2Points: 6 },
                { team1Points: 10, team2Points: 6 },
              ]);
            },
          );
          const { homeTeamScoreCell, awayTeamScoreCell } =
            gameScoreTeamCells[2];
          expect(homeTeamScoreCell).toHaveStyle({ color: matchPointColor });
          expect(awayTeamScoreCell).toHaveStyle({ color: normalColor });
        });
      });
    });

    describe("winner and games won cell", () => {
      interface GameWinnerAndGamesWonCellTest {
        description: string;
        setupMatch?: (dbMatch: DbMatch) => void;
        isSingles?: boolean;
        expectation: (gameWinnerAndGamesWonCell: HTMLTableCellElement) => void;
        homePlayersSelected?: SelectedPlayers;
        awayPlayersSelected?: SelectedPlayers;
      }

      type GamesWon = 0 | 1 | 2 | 3;
      const expectWinnerAndGamesWon = (
        gameWinnerAndGamesWonCell: HTMLTableCellElement,
        winner: string,
        homeGamesWon: GamesWon,
        awayGamesWon: GamesWon,
      ) => {
        const gameWinnerElement = getGameWinner(gameWinnerAndGamesWonCell);
        expect(gameWinnerElement).toHaveTextContent(winner);

        const gamesWonElement = getGamesWon(gameWinnerAndGamesWonCell);
        expectScoreTextContent(gamesWonElement, homeGamesWon, awayGamesWon);
      };

      const expectGamesWonColor = (
        gameWinnerAndGamesWonCell: HTMLTableCellElement,
        isHome: boolean,
        expectedColor: string,
      ) => {
        const teamGamesWonElement = getTeamGameWon(
          isHome,
          gameWinnerAndGamesWonCell,
        );
        expect(teamGamesWonElement).toHaveStyle({ color: expectedColor });
      };

      const gameWinnerAndGamesWonCellTests: GameWinnerAndGamesWonCellTest[] = [
        // not won
        {
          description:
            "should show the game scores ( 0 - 0 ) when a point has been scored but no winner",
          setupMatch(dbMatch) {
            matchScorePoints(dbMatch, true);
          },
          expectation(gameWinnerAndGamesWonCell) {
            expectScoreTextContent(gameWinnerAndGamesWonCell, 0, 0);
          },
        },
        {
          description:
            "should show the game scores ( 2 - 1) when a point has been scored but no winner",
          setupMatch(dbMatch) {
            matchScoreGamesWon(dbMatch, 2, 1);
          },
          expectation(gameWinnerAndGamesWonCell) {
            expectScoreTextContent(gameWinnerAndGamesWonCell, 2, 1);
          },
        },
        {
          description:
            "should show 0 - 0 when no points scored but is being umpired",
          setupMatch(dbMatch) {
            dbMatch.umpired = true;
          },
          expectation(gameWinnerAndGamesWonCell) {
            expectScoreTextContent(gameWinnerAndGamesWonCell, 0, 0);
          },
        },
        {
          description:
            "should show no score when no points scored and is not being umpired",
          expectation(gameWinnerAndGamesWonCell) {
            expect(gameWinnerAndGamesWonCell).toBeEmptyDOMElement();
          },
        },
        // ------- concede
        {
          description:
            "should show 3 - 2 when away conceded at 2-2 with winner initials",
          setupMatch(dbMatch) {
            updateMatchViaUmpire(dbMatch, (umpire) => {
              umpire.setServer("Team1Player1");
              scoreGamesWon(umpire, 2, 2);
              dbMatch.team2ConcedeOrForfeit = {
                isConcede: true,
              };
            });
          },
          expectation(gameWinnerAndGamesWonCell) {
            expectWinnerAndGamesWon(
              gameWinnerAndGamesWonCell,
              getInitials(defaultHomePlayerNames[0]),
              3,
              2,
            );
          },
        },
        {
          description:
            "should show 1 - 3 when home conceded at 1-1 with winner initials",
          setupMatch(dbMatch) {
            updateMatchViaUmpire(dbMatch, (umpire) => {
              umpire.setServer("Team1Player1");
              scoreGamesWon(umpire, 1, 1);
              dbMatch.team1ConcedeOrForfeit = {
                isConcede: true,
              };
            });
          },
          expectation(gameWinnerAndGamesWonCell) {
            expectWinnerAndGamesWon(
              gameWinnerAndGamesWonCell,
              getInitials(defaultAwayPlayerNames[0]),
              1,
              3,
            );
          },
        },
        // ------- forfeit
        {
          description:
            "should show 3 - 0 when away forfeit with winner initials",
          awayPlayersSelected: [false, true, true],
          setupMatch(dbMatch) {
            dbMatch.team2ConcedeOrForfeit = {
              isConcede: false,
            };
          },
          expectation(gameWinnerAndGamesWonCell) {
            expectWinnerAndGamesWon(
              gameWinnerAndGamesWonCell,
              getInitials(defaultHomePlayerNames[0]),
              3,
              0,
            );
          },
        },
        {
          description:
            "should show 0 - 3 when home forfeit with winner initials",
          homePlayersSelected: [false, true, true],
          setupMatch(dbMatch) {
            dbMatch.team1ConcedeOrForfeit = {
              isConcede: false,
            };
          },
          expectation(gameWinnerAndGamesWonCell) {
            expectWinnerAndGamesWon(
              gameWinnerAndGamesWonCell,
              getInitials(defaultAwayPlayerNames[0]),
              0,
              3,
            );
          },
        },
        {
          description:
            "should show no score when home forfeit and away player not selected",
          homePlayersSelected: [false, true, true],
          awayPlayersSelected: noPlayersSelected,
          setupMatch(dbMatch) {
            dbMatch.team1ConcedeOrForfeit = {
              isConcede: false,
            };
          },
          expectation(gameWinnerAndGamesWonCell) {
            expect(gameWinnerAndGamesWonCell).toBeEmptyDOMElement();
          },
        },
        {
          description: "should show 0 - 0 when both forfeit",
          setupMatch(dbMatch) {
            dbMatch.team1ConcedeOrForfeit = {
              isConcede: false,
            };
            dbMatch.team2ConcedeOrForfeit = {
              isConcede: false,
            };
          },
          expectation(gameWinnerAndGamesWonCell) {
            expectScoreTextContent(gameWinnerAndGamesWonCell, 0, 0);
          },
        },
        //------- team wins
        {
          description:
            "should show show score and winner initials when home wins",
          setupMatch(dbMatch) {
            matchScoreGamesWon(dbMatch, 3, 1);
          },
          expectation(gameWinnerAndGamesWonCell) {
            expectWinnerAndGamesWon(
              gameWinnerAndGamesWonCell,
              getInitials(defaultHomePlayerNames[0]),
              3,
              1,
            );
          },
        },
        {
          description:
            "should show show score and winner initials when away wins",
          setupMatch(dbMatch) {
            matchScoreGamesWon(dbMatch, 2, 3);
          },
          expectation(gameWinnerAndGamesWonCell) {
            expectWinnerAndGamesWon(
              gameWinnerAndGamesWonCell,
              getInitials(defaultAwayPlayerNames[0]),
              2,
              3,
            );
          },
        },
        {
          description:
            "should show show score and A as winner when away wins doubles",
          isSingles: false,
          setupMatch(dbMatch) {
            dbMatch.team1Player1Id = defaultHomePlayerNames[0];
            dbMatch.team1Player2Id = defaultHomePlayerNames[1];
            dbMatch.team2Player1Id = defaultAwayPlayerNames[0];
            dbMatch.team2Player2Id = defaultAwayPlayerNames[1];
            updateMatchViaUmpire(dbMatch, (umpire) => {
              umpire.setServer("Team1Player1");
              umpire.setFirstGameDoublesReceiver("Team2Player1");
              scoreGames(umpire, false, 1);
              umpire.setServer("Team2Player1");
              scoreGames(umpire, false, 1);
              umpire.setServer("Team1Player1");
              scoreGames(umpire, false, 1);
            });
          },
          expectation(gameWinnerAndGamesWonCell) {
            expectWinnerAndGamesWon(gameWinnerAndGamesWonCell, "A", 0, 3);
          },
        },
        {
          description:
            "should show show score and H as winner when home wins doubles",
          isSingles: false,
          setupMatch(dbMatch) {
            dbMatch.team1Player1Id = defaultHomePlayerNames[0];
            dbMatch.team1Player2Id = defaultHomePlayerNames[1];
            dbMatch.team2Player1Id = defaultAwayPlayerNames[0];
            dbMatch.team2Player2Id = defaultAwayPlayerNames[1];
            updateMatchViaUmpire(dbMatch, (umpire) => {
              umpire.setServer("Team1Player1");
              umpire.setFirstGameDoublesReceiver("Team2Player1");
              scoreGames(umpire, true, 1);
              umpire.setServer("Team2Player1");
              scoreGames(umpire, true, 1);
              umpire.setServer("Team1Player1");
              scoreGames(umpire, true, 1);
            });
          },
          expectation(gameWinnerAndGamesWonCell) {
            expectWinnerAndGamesWon(gameWinnerAndGamesWonCell, "H", 3, 0);
          },
        },
        // -------------------------------- styling
        {
          description: "should color the team score if have game point",
          setupMatch(dbMatch) {
            matchScorePoints(dbMatch, true, 10);
          },
          expectation(gameWinnerAndGamesWonCell) {
            expectGamesWonColor(
              gameWinnerAndGamesWonCell,
              true,
              gamePointColor,
            );
          },
        },
        {
          description: "should color the team score if have match point",
          setupMatch(dbMatch) {
            updateMatchViaUmpire(dbMatch, (umpire) => {
              umpire.setServer("Team1Player1");
              scoreGames(umpire, true, 2);
              scorePoints(umpire, true, 10);
            });
          },
          expectation(gameWinnerAndGamesWonCell) {
            expectGamesWonColor(
              gameWinnerAndGamesWonCell,
              true,
              matchPointColor,
            );
          },
        },
        {
          description:
            "should color the team score if won match ( without conceded / forfeit )",
          setupMatch(dbMatch) {
            matchWinGame(dbMatch, false);
          },
          expectation(gameWinnerAndGamesWonCell) {
            expectGamesWonColor(gameWinnerAndGamesWonCell, false, winColor);
          },
        },
        {
          description: "should color the team score if conceded",
          setupMatch(dbMatch) {
            dbMatch.team1ConcedeOrForfeit = {
              isConcede: true,
            };
          },
          expectation(gameWinnerAndGamesWonCell) {
            expectGamesWonColor(
              gameWinnerAndGamesWonCell,
              true,
              concededOrForfeitedColor,
            );
          },
        },
        {
          description: "should color the team score if forfeited",
          setupMatch(dbMatch) {
            dbMatch.team2ConcedeOrForfeit = {
              isConcede: false,
            };
          },
          expectation(gameWinnerAndGamesWonCell) {
            expectGamesWonColor(
              gameWinnerAndGamesWonCell,
              false,
              concededOrForfeitedColor,
            );
          },
        },
        {
          description:
            "should not color the team score if none of the previous states",
          setupMatch(dbMatch) {
            matchScorePoints(dbMatch, true);
          },
          expectation(gameWinnerAndGamesWonCell) {
            expectGamesWonColor(gameWinnerAndGamesWonCell, true, normalColor);
          },
        },
      ];
      it.each(gameWinnerAndGamesWonCellTests)(
        "$description",
        async ({
          setupMatch,
          expectation,
          homePlayersSelected = allPlayersSelected,
          awayPlayersSelected = allPlayersSelected,
          isSingles = true,
        }) => {
          const leagueMatchKey = await setupDatabase(
            database,
            getMatchSetupThatSetsDefaultPlayersThatAreSelected(
              homePlayersSelected,
              awayPlayersSelected,
              undefined,
              (match, index) => {
                if (isSingles) {
                  if (index === 0) {
                    setupMatch?.(match);
                  }
                } else {
                  if (index === 9) {
                    setupMatch?.(match);
                  }
                }
              },
            ),
          );
          render(createApp(leagueMatchKey));

          const gameWinnerAndGamesWonCell = await findGameWinnerAndGamesWonCell(
            isSingles ? 0 : 9,
          );
          expectation(gameWinnerAndGamesWonCell);
        },
      );
    });
  });

  it("should display cell with the order that match should be played in", async () => {
    const leagueMatchKey = await setupDatabase(database);
    render(createApp(leagueMatchKey));

    const allMatchOrderCells = await findAllOrderCells();
    allMatchOrderCells.forEach((matchOrderCell, i) => {
      expect(matchOrderCell).toHaveTextContent((i + 1).toString());
    });
  });

  describe("league match results row", () => {
    interface LeagueMatchResultRowTest {
      description: string;
      setupDoubles?: SetupDoubles;
      afterSetupMatch?: SetupMatch;
      expectation: (leagueMatchResultCell: HTMLTableCellElement) => void;
      homeSelectedPlayers?: SelectedPlayers;
      awaySelectedPlayers?: SelectedPlayers;
    }

    const expectTeamColor = (
      leagueMatchResultCell: HTMLTableCellElement,
      isHome: boolean,
      color: string,
    ) => {
      const teamMatchScore = getTeamMatchScore(isHome, leagueMatchResultCell);
      expect(teamMatchScore).toHaveStyle({ color });
    };
    const leagueMatchResultRowTests: LeagueMatchResultRowTest[] = [
      {
        description: "should have score 0 - 0 when no games have been played",
        expectation(leagueMatchResultCell) {
          expectScoreTextContent(leagueMatchResultCell, 0, 0);
        },
      },
      {
        description: "should have score 0 - 0 when game is in progress",
        afterSetupMatch(dbMatch, index) {
          if (index === 0) {
            matchScorePoints(dbMatch, true);
          }
        },
        expectation(leagueMatchResultCell) {
          expectScoreTextContent(leagueMatchResultCell, 0, 0);
        },
      },
      {
        description:
          "should have score 1 - 0 when single game has been won by the home team",
        afterSetupMatch(dbMatch, index) {
          if (index === 0) {
            matchWinGame(dbMatch, true);
          }
        },
        expectation(leagueMatchResultCell) {
          expectScoreTextContent(leagueMatchResultCell, 1, 0);
        },
      },
      {
        description:
          "should have score 0 - 1 when single game has been won by the away team",
        afterSetupMatch(dbMatch, index) {
          if (index === 0) {
            matchWinGame(dbMatch, false);
          }
        },
        expectation(leagueMatchResultCell) {
          expectScoreTextContent(leagueMatchResultCell, 0, 1);
        },
      },
      {
        description:
          "should have score 1 - 0 when away team conceded a game and opponent selected",
        afterSetupMatch(dbMatch, index) {
          if (index === 0) {
            dbMatch.team2ConcedeOrForfeit = {
              isConcede: true,
            };
          }
        },
        expectation(leagueMatchResultCell) {
          expectScoreTextContent(leagueMatchResultCell, 1, 0);
        },
      },
      {
        description:
          "should have score 0 - 0 when away team conceded a game and opponent not selected",
        homeSelectedPlayers: noPlayersSelected,
        afterSetupMatch(dbMatch, index) {
          if (index === 0) {
            dbMatch.team2ConcedeOrForfeit = {
              isConcede: true,
            };
          }
        },
        expectation(leagueMatchResultCell) {
          expectScoreTextContent(leagueMatchResultCell, 0, 0);
        },
      },
      {
        description: "should have score 0 - 1 when home team conceded a game",
        afterSetupMatch(dbMatch, index) {
          if (index === 0) {
            updateMatchViaUmpire(dbMatch, (umpire) => {
              umpire.setServer("Team1Player1");
              dbMatch.team1ConcedeOrForfeit = {
                isConcede: true,
              };
            });
          }
        },
        expectation(leagueMatchResultCell) {
          expectScoreTextContent(leagueMatchResultCell, 0, 1);
        },
      },
      // to be precise forfeited should not have all players selected
      {
        description: "should have score 1 - 0 when away team forfeit a game",
        afterSetupMatch(dbMatch, index) {
          if (index === 0) {
            dbMatch.team2ConcedeOrForfeit = {
              isConcede: false,
            };
          }
        },
        expectation(leagueMatchResultCell) {
          expectScoreTextContent(leagueMatchResultCell, 1, 0);
        },
      },
      {
        description: "should have score 0 - 1 when home team forfeit a game",
        afterSetupMatch(dbMatch, index) {
          if (index === 0) {
            dbMatch.team1ConcedeOrForfeit = {
              isConcede: false,
            };
          }
        },
        expectation(leagueMatchResultCell) {
          expectScoreTextContent(leagueMatchResultCell, 0, 1);
        },
      },
      {
        description: "should have score 0 - 0 when both teams concede a game",
        afterSetupMatch(dbMatch, index) {
          if (index === 0) {
            updateMatchViaUmpire(dbMatch, (umpire) => {
              umpire.setServer("Team1Player1");
              dbMatch.team1ConcedeOrForfeit = {
                isConcede: true,
              };
              dbMatch.team2ConcedeOrForfeit = {
                isConcede: true,
              };
            });
          }
        },
        expectation(leagueMatchResultCell) {
          expectScoreTextContent(leagueMatchResultCell, 0, 0);
        },
      },
      {
        description: "should have score 0 - 0 when both teams forfeit a game",
        afterSetupMatch(dbMatch, index) {
          if (index === 0) {
            dbMatch.team1ConcedeOrForfeit = {
              isConcede: false,
            };
            dbMatch.team2ConcedeOrForfeit = {
              isConcede: false,
            };
          }
        },
        expectation(leagueMatchResultCell) {
          expectScoreTextContent(leagueMatchResultCell, 0, 0);
        },
      },
      {
        description: "should sum each game",
        afterSetupMatch(dbMatch, index) {
          switch (index) {
            case 0:
            case 1:
            case 2:
              // home team win game
              matchWinGame(dbMatch, true);
              break;
            case 3:
            case 4:
              // away team win game
              matchWinGame(dbMatch, false);
              break;
          }
        },
        expectation(leagueMatchResultCell) {
          expectScoreTextContent(leagueMatchResultCell, 3, 2);
        },
      },
      // styling
      {
        description: "should use not leading color if the team is not winning",
        expectation(leagueMatchResultCell) {
          expectTeamColor(leagueMatchResultCell, true, notLeadingColor);
          expectTeamColor(leagueMatchResultCell, true, notLeadingColor);
        },
      },
      {
        description:
          "should use the match completed color for the winning team when all matches concluded",
        setupDoubles(doublesMatch) {
          doublesMatch.team1ConcedeOrForfeit = {
            isConcede: true,
          };
          doublesMatch.team1Player1Id = defaultHomePlayerNames[0];
          doublesMatch.team1Player2Id = defaultHomePlayerNames[1];
          doublesMatch.team2Player1Id = defaultAwayPlayerNames[0];
          doublesMatch.team2Player2Id = defaultAwayPlayerNames[1];
        },
        afterSetupMatch(dbMatch, index) {
          if (index !== 9) {
            // home team win game
            matchWinGame(dbMatch, true);
          }
        },
        expectation(leagueMatchResultCell) {
          expectTeamColor(leagueMatchResultCell, true, matchWonColor);
          expectTeamColor(leagueMatchResultCell, false, notLeadingColor);
        },
      },
      {
        description:
          "should use the unassailabble color for the winning team when has won the match with games to spare",
        afterSetupMatch(dbMatch, index) {
          if (index < 6) {
            // home team win game
            matchWinGame(dbMatch, true);
          }
        },
        expectation(leagueMatchResultCell) {
          expectTeamColor(leagueMatchResultCell, true, unassailableColor);
          expectTeamColor(leagueMatchResultCell, false, notLeadingColor);
        },
      },
      {
        description:
          "should use the winning color for the winning team when winning and not all matches concluded and not unassailable",
        afterSetupMatch(dbMatch, index) {
          if (index < 5) {
            // away team win game
            matchWinGame(dbMatch, false);
          }
        },
        expectation(leagueMatchResultCell) {
          expectTeamColor(leagueMatchResultCell, true, notLeadingColor);
          expectTeamColor(leagueMatchResultCell, false, winningMatchColor);
        },
      },
    ];
    it.each(leagueMatchResultRowTests)(
      "$description",
      async ({
        setupDoubles,
        afterSetupMatch,
        expectation,
        homeSelectedPlayers,
        awaySelectedPlayers,
      }) => {
        const leagueMatchKey = await setupDatabase(
          database,
          getMatchSetupThatSetsDefaultPlayersThatAreSelected(
            // for forfeited matches should not have all players selected - but ok for these tests
            homeSelectedPlayers ?? allPlayersSelected,
            awaySelectedPlayers ?? allPlayersSelected,
            setupDoubles,
            afterSetupMatch,
          ),
        );
        render(createApp(leagueMatchKey));

        const leagueMatchResultCell = await findLeagueMatchResultCell();
        expectation(leagueMatchResultCell);
      },
    );
  });

  describe("menu", () => {
    describe("enablement", () => {
      interface MenuItemEnablementTest {
        description: string;
        homePlayersSelected: SelectedPlayers;
        awayPlayersSelected: SelectedPlayers;
        isSingles?: boolean;
        setupMatch?: (dbMatch: DbMatch) => void;
        disabled: boolean;
        menuItemName: string;
      }

      const menuItemEnablementTests: MenuItemEnablementTest[] = [
        // umpire menu item
        {
          description:
            "should have disabled umpire menu item if all players have not been selected for singles",
          homePlayersSelected: noPlayersSelected,
          awayPlayersSelected: allPlayersSelected,
          disabled: true,
          menuItemName: "Umpire",
        },
        {
          description:
            "should have disabled umpire menu item if all players have not been selected for doubles",
          homePlayersSelected: noPlayersSelected,
          awayPlayersSelected: allPlayersSelected,
          isSingles: false,
          disabled: true,
          menuItemName: "Umpire",
        },
        ...[
          [true, true],
          [true, false],
          [false, true],
          [false, false],
        ].map(([homeTeam, conceded]) => {
          return {
            description: `should have disabled umpire menu item if ${homeTeam ? "home" : "away"} team has ${conceded ? "conceded" : "forfeited"}`,
            homePlayersSelected: allPlayersSelected,
            awayPlayersSelected: allPlayersSelected,
            disabled: true,
            menuItemName: "Umpire",
            setupMatch(dbMatch) {
              const key = getTeamConcedeOrForfeitKey(homeTeam);
              dbMatch[key] = {
                isConcede: conceded,
              };
            },
          };
        }),
        {
          description:
            "should have enabled umpire menu item when all players have been selected for singles and not conceded or forfeited",
          homePlayersSelected: allPlayersSelected,
          awayPlayersSelected: allPlayersSelected,
          disabled: false,
          menuItemName: "Umpire",
        },
        {
          description:
            "should have enabled umpire menu item when all players have been selected for doubles and not conceded or forfeited",
          homePlayersSelected: allPlayersSelected,
          awayPlayersSelected: allPlayersSelected,
          disabled: false,
          menuItemName: "Umpire",
          isSingles: false,
          setupMatch(dbMatch) {
            dbMatch.team1Player1Id = defaultHomePlayerNames[0];
            dbMatch.team1Player2Id = defaultHomePlayerNames[1];
            dbMatch.team2Player1Id = defaultAwayPlayerNames[0];
            dbMatch.team2Player2Id = defaultAwayPlayerNames[1];
          },
        },
        // concede menu items
        ...[true, false].flatMap((homeWins) => {
          return [true, false].map((homeConcededMenuItem) => {
            const test: MenuItemEnablementTest = {
              description: `should have disabled ${homeConcededMenuItem ? "Home" : "Away"} Concede menu item  if the match has been won by the ${homeWins ? "home" : "away"} team`,
              homePlayersSelected: allPlayersSelected,
              awayPlayersSelected: allPlayersSelected,
              disabled: true,
              menuItemName: `${homeConcededMenuItem ? "Home" : "Away"} Concede`,
              setupMatch(dbMatch) {
                matchWinGame(dbMatch, homeWins);
              },
            };
            return test;
          });
        }),
        ...[true, false].flatMap((homeForfeited) => {
          return [true, false].map((homeConcededMenuItem) => {
            const test: MenuItemEnablementTest = {
              description: `should have disabled ${homeConcededMenuItem ? "Home" : "Away"} Concede menu item if the match has been forfeited by the ${homeForfeited ? "home" : "away"} team`,
              homePlayersSelected: allPlayersSelected,
              awayPlayersSelected: allPlayersSelected,
              disabled: true,
              menuItemName: `${homeConcededMenuItem ? "Home" : "Away"} Concede`,
              setupMatch(dbMatch) {
                const key = getTeamConcedeOrForfeitKey(homeForfeited);
                dbMatch[key] = {
                  isConcede: false,
                };
              },
            };
            return test;
          });
        }),
        ...[true, false].map((homeConcededMenuItem) => {
          const test: MenuItemEnablementTest = {
            description: `should have disabled ${homeConcededMenuItem ? "Home" : "Away"} Concede menu item if not all players selected`,
            homePlayersSelected: noPlayersSelected,
            awayPlayersSelected: noPlayersSelected,
            disabled: true,
            menuItemName: `${homeConcededMenuItem ? "Home" : "Away"} Concede`,
          };
          return test;
        }),
        ...[true, false].map((homeConcededMenuItem) => {
          const test: MenuItemEnablementTest = {
            description: `should have enabled ${homeConcededMenuItem ? "Home" : "Away"} Concede menu item if ok to concede`,
            homePlayersSelected: allPlayersSelected,
            awayPlayersSelected: allPlayersSelected,
            disabled: false,
            menuItemName: `${homeConcededMenuItem ? "Home" : "Away"} Concede`,
          };
          return test;
        }),
        ...[true, false].map((homeConceded) => {
          const test: MenuItemEnablementTest = {
            description: `should have enabled Undo ${homeConceded ? "Home" : "Away"} Concede menu item if ${homeConceded ? "home" : "away"} team conceded`,
            homePlayersSelected: allPlayersSelected,
            awayPlayersSelected: allPlayersSelected,
            disabled: false,
            menuItemName: `Undo ${homeConceded ? "Home" : "Away"} Concede`,
            setupMatch(dbMatch) {
              const key = getTeamConcedeOrForfeitKey(homeConceded);
              dbMatch[key] = {
                isConcede: true,
              };
            },
          };
          return test;
        }),
      ];
      it.each(menuItemEnablementTests)(
        "$description",
        async ({
          homePlayersSelected,
          awayPlayersSelected,
          isSingles = true,
          setupMatch,
          disabled,
          menuItemName,
        }) => {
          const leagueMatchKey = await setupDatabase(
            database,
            getMatchSetupThatSetsDefaultPlayersThatAreSelected(
              homePlayersSelected,
              awayPlayersSelected,
              undefined,
              (dbMatch, index) => {
                if (index === 0) {
                  if (isSingles) {
                    setupMatch?.(dbMatch);
                  }
                }
                if (index === 9) {
                  if (!isSingles) {
                    setupMatch?.(dbMatch);
                  }
                }
              },
            ),
          );
          render(createApp(leagueMatchKey));

          const menuButton = await findGameMenuButton(isSingles ? 0 : 9);
          openMenuExpectMenuItemDisabled(menuButton, menuItemName, disabled);
        },
      );
    });

    describe("clicking concede / undo concede menu item", () => {
      interface ConcedeUnconcedeTest {
        description: string;
        homeTeam: boolean;
        initiallyConceded: boolean;
      }
      const concedeUnconcedeTests: ConcedeUnconcedeTest[] = [
        true,
        false,
      ].flatMap((homeTeam) => {
        return [true, false].map((initiallyConceded) => {
          return {
            description: `should ${initiallyConceded ? "undo" : "concede"} the ${homeTeam ? "home" : "away"} team`,
            homeTeam,
            initiallyConceded,
          };
        });
      });
      it.each(concedeUnconcedeTests)(
        "$description",
        async ({ homeTeam, initiallyConceded }) => {
          const getExpectedScore = (conceded) => {
            const concededTeam = homeTeam ? "home" : "away";
            const unconcededTeam = homeTeam ? "away" : "home";
            return {
              [concededTeam]: 0,
              [unconcededTeam]: conceded ? 1 : 0,
            };
          };
          const leagueMatchKey = await setupDatabase(
            database,
            getMatchSetupThatSetsDefaultPlayersThatAreSelected(
              allPlayersSelected,
              allPlayersSelected,
              undefined,
              (dbMatch, index) => {
                if (index === 0 && initiallyConceded) {
                  const key = getTeamConcedeOrForfeitKey(homeTeam);
                  dbMatch[key] = {
                    isConcede: true,
                  };
                }
              },
            ),
          );
          render(createApp(leagueMatchKey));

          const gameRow = await findGameRow(0);
          // before
          const expectedBeforeScore = getExpectedScore(initiallyConceded);
          let leagueMatchResultCell = await findLeagueMatchResultCell();
          expectScoreTextContent(
            leagueMatchResultCell,
            expectedBeforeScore.home,
            expectedBeforeScore.away,
          );

          const menuButton = within(gameRow).getByLabelText(
            gameMenuButtonAriaLabel,
          );
          const menuItemName = initiallyConceded
            ? `Undo ${homeTeam ? "Home" : "Away"} Concede`
            : `${homeTeam ? "Home" : "Away"} Concede`;
          openMenuClickMenuItem(menuButton, menuItemName);

          // after
          const expectedAfterScore = getExpectedScore(!initiallyConceded);
          leagueMatchResultCell = await findLeagueMatchResultCell();
          expectScoreTextContent(
            leagueMatchResultCell,
            expectedAfterScore.home,
            expectedAfterScore.away,
          );
        },
      );
    });
  });
});
