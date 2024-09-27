/**
 * @jest-environment jsdom
 */
import { render, within } from "@testing-library/react";
import createEmulatorTests from "./createEmulatorTests";
import {
  LeagueMatchView,
  getScoresheetGameRowAriaLabel,
  scoresheetLeagueMatchResultsRowAriaLabel as scoresheetLeagueMatchResultRowAriaLabel,
  scoresheetTableAriaLabel,
} from "../src/teamMatches/league/play/league-match-view/LeagueMatchView";
import {
  SetupDoubles,
  allPlayersSelected,
  defaultAwayPlayerNames,
  defaultHomePlayerNames,
  getMatchSetupThatSetsDefaultPlayersThatAreSelected,
  noPlayerSelected,
  setUpDatabaseWithDefaultPlayersThatAreSelected,
  setupDatabase,
} from "./setupDatabase";
import { findScoresheetSection } from "./leagueMatchViewSelectors";
import { fillArray } from "../src/helpers/fillArray";
import {
  doublesPlayerAriaLabel,
  getScoresheetGamePlayerCellAriaLabel,
  unselectedPlayerCellColor,
} from "../src/teamMatches/league/play/league-match-view/scoresheet/ui/getPlayerCell";
import {
  leagueMatchPlayersPositionDisplays,
  leagueMatchTeamsPlayersPositionDisplay,
} from "../src/teamMatches/league/play/format/singlesLeagueMatchPlayers";
import {
  TextDecorationLine,
  expectNotSingleTextDecorationLine,
  expectSingleTextDecorationLine,
} from "../test-helpers/testing-library/expectations";
import { DbMatch } from "../src/firebase/rtb/match/dbMatch";
import { GameScore, Player, SaveState, Umpire } from "../src/umpire";
import {
  dbMatchSaveStateToSaveState,
  saveStateToDbMatchSaveState,
} from "../src/firebase/rtb/match/conversion";
import { getLast } from "../src/helpers/getLast";
import { ServerReceiver } from "../src/umpire/commonTypes";
import { getInitials } from "../src/umpireView/helpers";
import {
  getGameScoreCellAriaLabel,
  getGameScoreCellTeamAriaLabel,
} from "../src/teamMatches/league/play/league-match-view/scoresheet/ui/getGameScoreCell";
import { scorePoints } from "./umpireScoringHelpers";

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

const findScoresheetTable = async () => {
  const scoresheetSection = await findScoresheetSection();
  return within(scoresheetSection).getByLabelText<HTMLTableElement>(
    scoresheetTableAriaLabel,
  );
};
const findAllGameRows = async () => {
  const scoresheetTable = await findScoresheetTable();
  return fillArray(10, (i) => {
    return findGameRowWithin(scoresheetTable, i);
  });
};

const findGameRowWithin = (
  scoresheetTable: HTMLTableElement,
  index: number,
) => {
  return within(scoresheetTable).getByLabelText<HTMLTableRowElement>(
    getScoresheetGameRowAriaLabel(index + 1),
  );
};

const findFirstGameRow = async () => {
  const scoresheetTable = await findScoresheetTable();
  return findGameRowWithin(scoresheetTable, 0);
};

const findLeagueMatchResultRow = async () => {
  const scoresheetTable = await findScoresheetTable();
  within(scoresheetTable).findByLabelText<HTMLTableRowElement>(
    scoresheetLeagueMatchResultRowAriaLabel,
  );
};

const updateDbMatchWithSaveState = (match: DbMatch, saveState: SaveState) => {
  const dbMatchSaveState = saveStateToDbMatchSaveState(saveState);
  for (const key in dbMatchSaveState) {
    match[key] = dbMatchSaveState[key];
  }
};

const updateMatchViaUmpire = (
  match: DbMatch,
  umpireUpdate: (umpire: Umpire) => void,
) => {
  const umpire = new Umpire(dbMatchSaveStateToSaveState(match));
  umpireUpdate(umpire);
  const saveState = umpire.getSaveState();
  updateDbMatchWithSaveState(match, saveState);
};

describe("render scoresheet", () => {
  function createApp(leagueMatchId: string) {
    return createMaylandsComps(
      <LeagueMatchView leagueMatchId={leagueMatchId} />,
    );
  }
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
            homePlayerCell: within(
              gameRow,
            ).getByLabelText<HTMLTableCellElement>(
              getScoresheetGamePlayerCellAriaLabel(true),
            ),
            awayPlayerCell: within(
              gameRow,
            ).getByLabelText<HTMLTableCellElement>(
              getScoresheetGamePlayerCellAriaLabel(false),
            ),
          };
        });
      }

      async function gamePlayersCellTest(
        homePlayersSelected: boolean[],
        awayPlayersSelected: boolean[],
        setupDoubles: SetupDoubles = () => {},
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
        homePlayersSelected: boolean[],
        awayPlayersSelected: boolean[],
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
        homePlayersSelected: boolean[],
        awayPlayersSelected: boolean[],
        setupDoubles: SetupDoubles = () => {},
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
          return singlesGamePlayersCellTest(noPlayerSelected, noPlayerSelected);
        }
        function unselectedDoublesGamePlayersCellTest() {
          return doublesGamePlayersCellTest(noPlayerSelected, noPlayerSelected);
        }

        describe("common styling", () => {
          describe("forfeited", () => {
            const setUpGetHomeForefeitedGameCells = async () => {
              const leagueMatchKey = await setupDatabase(
                database,
                getMatchSetupThatSetsDefaultPlayersThatAreSelected(
                  noPlayerSelected,
                  noPlayerSelected,
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
                await setUpGetHomeForefeitedGameCells();
              expect(homePlayerCell).not.toHaveStyle({
                color: unselectedPlayerCellColor,
              });
              expect(awayPlayerCell).toHaveStyle({
                color: unselectedPlayerCellColor,
              });
            });
            it("should strikethrough if forfeited", async () => {
              const { homePlayerCell, awayPlayerCell } =
                await setUpGetHomeForefeitedGameCells();
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

          const getTeamPlayerSpans = (cell: HTMLTableCellElement) => {
            return within(cell).getAllByLabelText(doublesPlayerAriaLabel);
          };
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
      interface GameScoreTeamCells {
        homeTeamScoreCell: HTMLElement;
        awayTeamScoreCell: HTMLElement;
      }
      const getGameScoreTeamCells = (
        gameScoreCell: HTMLElement,
      ): GameScoreTeamCells => {
        const homeTeamScoreCell = within(gameScoreCell).getByLabelText(
          getGameScoreCellTeamAriaLabel(true),
        );
        const awayTeamScoreCell = within(gameScoreCell).getByLabelText(
          getGameScoreCellTeamAriaLabel(false),
        );
        return {
          homeTeamScoreCell,
          awayTeamScoreCell,
        };
      };

      async function setupGetFirstMatchGameScoreCells(
        setupFirstMatch: (firstMatch: DbMatch) => void = () => {},
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

        const firstGameRow = await findFirstGameRow();
        return fillArray(5, (i) =>
          getGameScoreTeamCells(
            within(firstGameRow).getByLabelText(getGameScoreCellAriaLabel(i)),
          ),
        );
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

      // team1 must win the first game !
      interface PreviousGamesAndCurrentGamesTest {
        gameScores: [GameScore, GameScore]; // previous game, current game
      }
      const previousGamesAndCurrentGamesTests: PreviousGamesAndCurrentGamesTest[] =
        [
          {
            gameScores: [
              { team1Points: 11, team2Points: 6 },
              { team1Points: 4, team2Points: 4 },
            ],
          },
        ];

      it.each(previousGamesAndCurrentGamesTests)(
        "should show game scores for previous games and current games",
        async (test) => {
          const gameScoreTeamCells = await setupGetFirstMatchGameScoreCells(
            (firstMatch) => {
              updateMatchViaUmpire(firstMatch, (umpire) => {
                umpire.setServer("Team1Player1");
                scorePoints(umpire, false, test.gameScores[0].team2Points);
                scorePoints(umpire, true, test.gameScores[0].team1Points);

                scorePoints(umpire, true, test.gameScores[1].team1Points);
                scorePoints(umpire, false, test.gameScores[1].team2Points);
              });
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
              updateMatchViaUmpire(firstMatch, (umpire) => {
                umpire.setServer("Team1Player1");
                umpire.pointScored(true);
              });
            },
          );
          gameScoreCells
            .filter((_, i) => i !== 0)
            .forEach((gameScoreTeamCells) =>
              expectDashScores(gameScoreTeamCells),
            );
        });
      });
    });
  });

  xit("should display cell with the order that match should be played in", () => {});
  it("should have a league match results row", async () => {
    const leagueMatchKey = await setupDatabase(database);
    render(createApp(leagueMatchKey));

    await findLeagueMatchResultRow();
  });
});
