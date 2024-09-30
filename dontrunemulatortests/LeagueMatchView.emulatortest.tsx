/**
 * @jest-environment jsdom
 */
import {
  LeagueMatchSelection,
  LeagueMatchSelectionProps,
} from "../src/teamMatches/league/play/league-match-selection/LeagueMatchSelection";
import {
  screen,
  render,
  waitFor,
  within,
  fireEvent,
} from "@testing-library/react";
import {
  clearOptions,
  openAutocompleteAndGetOptions,
  selectNthOption,
} from "../test-helpers/mui/autocomplete";
import {
  awayPlayersMatchIndicesAndDisplay,
  homePlayersMatchIndicesAndDisplay,
  leagueMatchPlayersPositionDisplays,
} from "../src/teamMatches/league/play/format/singlesLeagueMatchPlayers";
import {
  findPlayerCombo,
  findScoresheetSection,
} from "../__tests__/leagueMatchViewSelectors";
import { fillArrayWithIndices } from "../src/helpers/fillArray";
import { getPlayerComboInputs } from "../__tests__/leagueMatchViewSelectors";
import { findDoublesCombo } from "../__tests__/leagueMatchViewSelectors";
import { openPlayerAutocompleteAndGetOptions } from "../__tests__/leagueMatchViewSelectors";
import { MatchAndKey } from "../src/teamMatches/league/db-hooks/useLeagueMatchAndMatches";
import createEmulatorTests from "../__tests__/createEmulatorTests";
import {
  TeamPlayerIds,
  allPlayersSelected,
  defaultAwayPlayerNames,
  defaultHomePlayerNames,
  defaultHomeTeamName,
  defaultTestClubSetups,
  getMatchSetupThatSetsDefaultPlayersThatAreSelected,
  lowerRankedDefaultHomePlayerNames,
  lowerRankedHomeTeamName,
  setUpDatabaseWithDefaultPlayersThatAreSelected,
  setupDatabase,
} from "../__tests__/setupDatabase";

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

function createApp(
  leagueMatchId: string,
  renderScoresheet: LeagueMatchSelectionProps["renderScoresheet"] = () => null,
) {
  return createMaylandsComps(
    <LeagueMatchSelection
      leagueMatchId={leagueMatchId}
      renderScoresheet={renderScoresheet}
    />,
  );
}

describe("<LeagueMatchView/>", () => {
  const defaultOrderedHomeAvailablePlayerNames = defaultHomePlayerNames
    .sort()
    .concat(lowerRankedDefaultHomePlayerNames)
    .sort();
  const defaultOrderedAwayAvailablePlayerNames = defaultAwayPlayerNames.sort();

  describe("match selection", () => {
    describe("players selection", () => {
      it("renders section for selecting players, one for each team with 3 combos", async () => {
        const leagueMatchKey = await setupDatabase(database);
        render(createApp(leagueMatchKey));

        const { homePlayerInputs, awayPlayerInputs } =
          await getPlayerComboInputs();
        expect(homePlayerInputs).toHaveLength(3);
        expect(awayPlayerInputs).toHaveLength(3);
      });

      it("should have no selected players if no players have been selected for matches", async () => {
        const leagueMatchKey = await setupDatabase(database);
        render(createApp(leagueMatchKey));

        const { homePlayerInputs, awayPlayerInputs } =
          await getPlayerComboInputs();
        homePlayerInputs.forEach((homePlayerInput) => {
          expect(homePlayerInput.value).toBe("");
        });
        awayPlayerInputs.forEach((awayPlayerInput) => {
          expect(awayPlayerInput.value).toBe("");
        });
      });

      it("should have selected players if players have been selected for matches", async () => {
        // value if from getOptionLabel - name property of AvailablePlayer

        const leagueMatchKey =
          await setUpDatabaseWithDefaultPlayersThatAreSelected(
            database,
            allPlayersSelected,
            allPlayersSelected,
          );
        render(createApp(leagueMatchKey));
        const { homePlayerInputs, awayPlayerInputs } =
          await getPlayerComboInputs();
        const expectInputs = (isHome: boolean) => {
          const expectedNames = isHome
            ? defaultHomePlayerNames
            : defaultAwayPlayerNames;
          const playerInputs = isHome ? homePlayerInputs : awayPlayerInputs;
          playerInputs.forEach((playerInput, i) => {
            expect(playerInput.value).toBe(expectedNames[i]);
          });
        };
        await waitFor(() => {
          expectInputs(true);
          expectInputs(false);
        });
      });

      describe("available players for selection, sorted by rank and name", () => {
        describe("no players selected", () => {
          interface SortedAvailabledPlayersTestBase {
            isHome: boolean;
            expectedPlayerNames: string[];
            description: string;
          }
          interface SortedAvailabledPlayersTest
            extends SortedAvailabledPlayersTestBase {
            playerIndex: number;
          }

          const sortedAvailabledPlayersTestsBase: SortedAvailabledPlayersTestBase[] =
            [
              {
                description: "includes lower ranked players",
                isHome: true,
                expectedPlayerNames: defaultOrderedHomeAvailablePlayerNames,
              },
              {
                description: "does not include higher ranked players",
                isHome: false,
                expectedPlayerNames: defaultOrderedAwayAvailablePlayerNames,
              },
            ];
          const sortedAvailabledPlayersTests: SortedAvailabledPlayersTest[] =
            fillArrayWithIndices(3).flatMap((playerIndex) => {
              return sortedAvailabledPlayersTestsBase.map(
                (sortedAvailabledPlayersTestBase) => {
                  return {
                    playerIndex,
                    ...sortedAvailabledPlayersTestBase,
                  };
                },
              );
            });
          it.each(sortedAvailabledPlayersTests)(
            `should have all available players for selection when no players selected - $isHome, $playerIndex, $description`,
            async ({ isHome, expectedPlayerNames }) => {
              const leagueMatchKey = await setupDatabase(database);
              render(createApp(leagueMatchKey));

              const optionDisplays = await openPlayerAutocompleteAndGetOptions(
                isHome,
                0,
              );

              expect(optionDisplays).toEqual(expectedPlayerNames);
            },
          );
        });

        it("should not have a selected player in the available players for selection for the other player selections", async () => {
          const leagueMatchKey =
            await setUpDatabaseWithDefaultPlayersThatAreSelected(
              database,
              [true, false, false],
              [true, false, false],
            );
          render(createApp(leagueMatchKey));

          const selectedOptionDisplays =
            await openPlayerAutocompleteAndGetOptions(true, 0);

          const notSelectedOptionDisplays =
            await openPlayerAutocompleteAndGetOptions(true, 1);

          const notIns = selectedOptionDisplays.filter(
            (selectedOptionDisplay) => {
              return !notSelectedOptionDisplays.includes(selectedOptionDisplay);
            },
          );
          expect(notIns).toEqual([defaultOrderedHomeAvailablePlayerNames[0]]);
        });

        describe("same club and friendly", () => {
          it("should have the same players available for selection", async () => {
            const friendlyLeagueMatchKey = await setupDatabase(
              database,
              undefined,
              defaultTestClubSetups,
              defaultHomeTeamName,
              lowerRankedHomeTeamName,
              true,
            );

            render(createApp(friendlyLeagueMatchKey));

            const optionDisplaysHome =
              await openPlayerAutocompleteAndGetOptions(true, 0);

            const optionDisplaysAway =
              await openPlayerAutocompleteAndGetOptions(false, 0);

            expect(optionDisplaysHome).toEqual(optionDisplaysAway);
            expect(optionDisplaysHome).toEqual(
              defaultOrderedHomeAvailablePlayerNames,
            );
          });
        });

        it("should not have a selected player in the available players for selection in the other team", async () => {
          const friendlyLeagueMatchKey = await setupDatabase(
            database,
            getMatchSetupThatSetsDefaultPlayersThatAreSelected(
              [true, false, false],
              [false, false, false],
            ),
            defaultTestClubSetups,
            defaultHomeTeamName,
            lowerRankedHomeTeamName,
            true,
          );

          render(createApp(friendlyLeagueMatchKey));

          const selectedOptionDisplays =
            await openPlayerAutocompleteAndGetOptions(true, 0);

          const notSelectedOptionDisplays =
            await openPlayerAutocompleteAndGetOptions(false, 0);

          const notIns = selectedOptionDisplays.filter(
            (selectedOptionDisplay) => {
              return !notSelectedOptionDisplays.includes(selectedOptionDisplay);
            },
          );
          expect(notIns).toEqual([defaultOrderedHomeAvailablePlayerNames[0]]);
        });
      });

      describe("selecting a player", () => {
        interface SelectPlayerTest {
          isHome: boolean;
          playerComboIndex: number;
          selectedPlayerIndex: number;
        }
        const selectPlayerTest: SelectPlayerTest[] = [
          {
            isHome: true,
            playerComboIndex: 0,
            selectedPlayerIndex: 1,
          },
          {
            isHome: true,
            playerComboIndex: 1,
            selectedPlayerIndex: 2,
          },
          {
            isHome: true,
            playerComboIndex: 2,
            selectedPlayerIndex: 1,
          },

          {
            isHome: false,
            playerComboIndex: 0,
            selectedPlayerIndex: 1,
          },
          {
            isHome: false,
            playerComboIndex: 1,
            selectedPlayerIndex: 2,
          },
          {
            isHome: false,
            playerComboIndex: 2,
            selectedPlayerIndex: 1,
          },
        ];
        it.each(selectPlayerTest)(
          "should add player to all of the player matches  - $isHome, $playerComboIndex, $selectedPlayerIndex",
          async ({ isHome, playerComboIndex, selectedPlayerIndex }) => {
            const leagueMatchKey = await setupDatabase(database);
            let renderCount = 0;
            let currentMatchAndKeys: MatchAndKey[] = [];
            render(
              createApp(leagueMatchKey, (matchAndKeys) => {
                currentMatchAndKeys = matchAndKeys;
                renderCount++;
                return null;
              }),
            );

            const playerCombo = await findPlayerCombo(isHome, playerComboIndex);
            selectNthOption(playerCombo, selectedPlayerIndex + 1);

            waitFor(() => renderCount === 2);

            const orderedAvailablePlayerNames = isHome
              ? defaultOrderedHomeAvailablePlayerNames
              : defaultOrderedAwayAvailablePlayerNames;
            const playerName = orderedAvailablePlayerNames[selectedPlayerIndex];
            const expectedPlayerId = playerName;
            const matchPlayerDetails = isHome
              ? homePlayersMatchIndicesAndDisplay
              : awayPlayersMatchIndicesAndDisplay;
            const matchIndices =
              matchPlayerDetails[playerComboIndex].matchIndices;
            currentMatchAndKeys.forEach(({ match }, index) => {
              if (index !== 9) {
                if (!matchIndices.includes(index)) {
                  expect(match.team1Player1Id).toBeUndefined();
                  expect(match.team2Player1Id).toBeUndefined();
                } else {
                  const playerId = isHome
                    ? match.team1Player1Id
                    : match.team2Player1Id;
                  const opponentId = isHome
                    ? match.team2Player1Id
                    : match.team1Player1Id;
                  expect(opponentId).toBeUndefined();
                  expect(playerId).toBe(expectedPlayerId);
                }
              }
            });
          },
        );

        // not necessary to show that this may add doubles option -  see test doubles selection / available options
      });
      describe("deselecting a player", () => {
        interface DeselectPlayerTest {
          isHome: boolean;
          playerComboIndex: number;
        }
        const deselectPlayerTests: DeselectPlayerTest[] = [
          {
            isHome: true,
            playerComboIndex: 0,
          },
          {
            isHome: true,
            playerComboIndex: 1,
          },
          {
            isHome: true,
            playerComboIndex: 2,
          },

          {
            isHome: false,
            playerComboIndex: 0,
          },
          {
            isHome: false,
            playerComboIndex: 1,
          },
          {
            isHome: false,
            playerComboIndex: 2,
          },
        ];
        it.each(deselectPlayerTests)(
          "should remove player from all of the player matches  - $isHome, $playerComboIndex",
          async ({ isHome, playerComboIndex }) => {
            const leagueMatchKey =
              await setUpDatabaseWithDefaultPlayersThatAreSelected(
                database,
                allPlayersSelected,
                allPlayersSelected,
              );

            let renderCount = 0;
            let currentMatchAndKeys: MatchAndKey[] = [];
            render(
              createApp(leagueMatchKey, (matchAndKeys) => {
                currentMatchAndKeys = matchAndKeys;
                renderCount++;
                return null;
              }),
            );

            const playerCombo = await findPlayerCombo(isHome, playerComboIndex);
            clearOptions(playerCombo);

            waitFor(() => renderCount === 2);
            currentMatchAndKeys.forEach(({ match }, index) => {
              if (index !== 9) {
                const { homePositionDisplay, awayPositionDisplay } =
                  leagueMatchPlayersPositionDisplays[index];
                const playerPosition = isHome
                  ? homePositionDisplay.position
                  : awayPositionDisplay.position;
                if (playerPosition === playerComboIndex) {
                  const playerId = isHome
                    ? match.team1Player1Id
                    : match.team2Player1Id;
                  const opponentId = isHome
                    ? match.team2Player1Id
                    : match.team1Player1Id;
                  expect(opponentId).toBeDefined();
                  expect(playerId).toBeUndefined();
                } else {
                  expect(match.team1Player1Id).toBeDefined();
                  expect(match.team2Player1Id).toBeDefined();
                }
              }
            });
          },
        );

        it.each(deselectPlayerTests)(
          "should remove team doubles players when a player is deselected - $isHome, $playerComboIndex",
          async ({ isHome, playerComboIndex }) => {
            const leagueMatchKey =
              await setUpDatabaseWithDefaultPlayersThatAreSelected(
                database,
                allPlayersSelected,
                allPlayersSelected,
                (doublesMatch, homeTeamPlayerIds, awayTeamPlayerIds) => {
                  const playerIds = isHome
                    ? homeTeamPlayerIds
                    : awayTeamPlayerIds;
                  const player1Id = playerIds[playerComboIndex]!;
                  const otherPlayerIds = playerIds.filter(
                    (_, i) => i !== playerComboIndex,
                  );
                  const player2Id = otherPlayerIds[0]!;
                  if (isHome) {
                    doublesMatch.team1Player1Id = player1Id;
                    doublesMatch.team1Player2Id = player2Id;
                  } else {
                    doublesMatch.team2Player1Id = player1Id;
                    doublesMatch.team2Player2Id = player2Id;
                  }
                },
              );

            let renderCount = 0;
            let currentMatchAndKeys: MatchAndKey[] = [];
            render(
              createApp(leagueMatchKey, (matchAndKeys) => {
                currentMatchAndKeys = matchAndKeys;
                renderCount++;
                return null;
              }),
            );

            const playerCombo = await findPlayerCombo(isHome, playerComboIndex);
            clearOptions(playerCombo);

            waitFor(() => renderCount === 2);
            currentMatchAndKeys.forEach(({ match }, index) => {
              if (index !== 9) {
                const { homePositionDisplay, awayPositionDisplay } =
                  leagueMatchPlayersPositionDisplays[index];
                const playerPosition = isHome
                  ? homePositionDisplay.position
                  : awayPositionDisplay.position;
                if (playerPosition === playerComboIndex) {
                  const playerId = isHome
                    ? match.team1Player1Id
                    : match.team2Player1Id;
                  const opponentId = isHome
                    ? match.team2Player1Id
                    : match.team1Player1Id;
                  expect(opponentId).toBeDefined();
                  expect(playerId).toBeUndefined();
                } else {
                  expect(match.team1Player1Id).toBeDefined();
                  expect(match.team2Player1Id).toBeDefined();
                }
              }
            });
          },
        );

        // not necessary to show that this will remove doubles option -  see test doubles selection / available options
      });
    });
    describe("doubles selection", () => {
      describe("selected", () => {
        interface SelectedPlayers {
          player1Index: number;
          player2Index: number;
          expectedValue: string;
        }
        interface DoublesSelectionTest {
          description: string;
          isHome: boolean;
          selectedPlayers?: SelectedPlayers;
        }
        const doublesSelectionTests: DoublesSelectionTest[] = [
          {
            description: "No selected players",
            isHome: true,
          },
          {
            description: "A and B",
            isHome: true,
            selectedPlayers: {
              player1Index: 0,
              player2Index: 1,
              expectedValue: `${defaultHomePlayerNames[0]} - ${defaultHomePlayerNames[1]}`,
            },
          },
          {
            description: "A and C",
            isHome: true,
            selectedPlayers: {
              player1Index: 0,
              player2Index: 2,
              expectedValue: `${defaultHomePlayerNames[0]} - ${defaultHomePlayerNames[2]}`,
            },
          },
          {
            description: "B and C",
            isHome: true,
            selectedPlayers: {
              player1Index: 1,
              player2Index: 2,
              expectedValue: `${defaultHomePlayerNames[1]} - ${defaultHomePlayerNames[2]}`,
            },
          },
          {
            description: "X and Y",
            isHome: false,
            selectedPlayers: {
              player1Index: 0,
              player2Index: 1,
              expectedValue: `${defaultAwayPlayerNames[0]} - ${defaultAwayPlayerNames[1]}`,
            },
          },
          {
            description: "X and Z",
            isHome: false,
            selectedPlayers: {
              player1Index: 0,
              player2Index: 2,
              expectedValue: `${defaultAwayPlayerNames[0]} - ${defaultAwayPlayerNames[2]}`,
            },
          },
          {
            description: "Y and Z",
            isHome: false,
            selectedPlayers: {
              player1Index: 1,
              player2Index: 2,
              expectedValue: `${defaultAwayPlayerNames[1]} - ${defaultAwayPlayerNames[2]}`,
            },
          },
        ];
        it.each(doublesSelectionTests)(
          "$description",
          async ({ isHome, selectedPlayers }) => {
            const leagueMatchKey =
              await setUpDatabaseWithDefaultPlayersThatAreSelected(
                database,
                allPlayersSelected,
                allPlayersSelected,
                (doublesMatch, homeTeamPlayerIds, awayTeamPlayerIds) => {
                  if (selectedPlayers !== undefined) {
                    if (isHome) {
                      doublesMatch.team1Player1Id =
                        homeTeamPlayerIds[selectedPlayers.player1Index]!;
                      doublesMatch.team1Player2Id =
                        homeTeamPlayerIds[selectedPlayers.player2Index]!;
                    } else {
                      doublesMatch.team2Player1Id =
                        awayTeamPlayerIds[selectedPlayers.player1Index]!;
                      doublesMatch.team2Player2Id =
                        awayTeamPlayerIds[selectedPlayers.player2Index]!;
                    }
                  }
                },
              );
            render(createApp(leagueMatchKey));

            const doublesCombo = await findDoublesCombo(isHome);
            expect(doublesCombo.value).toBe(
              selectedPlayers === undefined
                ? ""
                : selectedPlayers.expectedValue,
            );
          },
        );
      });

      describe("available options", () => {
        interface DoublesPlayersSelectionTest {
          description: string;
          isHome: boolean;
          selectedPlayers: boolean[];
          expectedOptions: string[];
        }
        const doublesPlayersSelectionTests: DoublesPlayersSelectionTest[] = [
          {
            description: "No selected home players",
            expectedOptions: [],
            isHome: true,
            selectedPlayers: [false, false, false],
          },
          {
            description: "Single selected home player",
            expectedOptions: [],
            isHome: true,
            selectedPlayers: [true, false, false],
          },
          {
            description: "A and B",
            expectedOptions: [
              `${defaultHomePlayerNames[0]} - ${defaultHomePlayerNames[1]}`,
            ],
            isHome: true,
            selectedPlayers: [true, true, false],
          },
          {
            description: "A and C",
            expectedOptions: [
              `${defaultHomePlayerNames[0]} - ${defaultHomePlayerNames[2]}`,
            ],
            isHome: true,
            selectedPlayers: [true, false, true],
          },
          {
            description: "B and C",
            expectedOptions: [
              `${defaultHomePlayerNames[1]} - ${defaultHomePlayerNames[2]}`,
            ],
            isHome: true,
            selectedPlayers: [false, true, true],
          },
          {
            description: "All home players selected",
            expectedOptions: [
              `${defaultHomePlayerNames[0]} - ${defaultHomePlayerNames[1]}`,
              `${defaultHomePlayerNames[0]} - ${defaultHomePlayerNames[2]}`,
              `${defaultHomePlayerNames[1]} - ${defaultHomePlayerNames[2]}`,
            ],
            isHome: true,
            selectedPlayers: allPlayersSelected,
          },

          // away
          {
            description: "No selected away players",
            expectedOptions: [],
            isHome: false,
            selectedPlayers: [false, false, false],
          },
          {
            description: "X and Y",
            expectedOptions: [
              `${defaultAwayPlayerNames[0]} - ${defaultAwayPlayerNames[1]}`,
            ],
            isHome: false,
            selectedPlayers: [true, true, false],
          },
          {
            description: "X and Z",
            expectedOptions: [
              `${defaultAwayPlayerNames[0]} - ${defaultAwayPlayerNames[2]}`,
            ],
            isHome: false,
            selectedPlayers: [true, false, true],
          },
          {
            description: "Y and Z",
            expectedOptions: [
              `${defaultAwayPlayerNames[1]} - ${defaultAwayPlayerNames[2]}`,
            ],
            isHome: false,
            selectedPlayers: [false, true, true],
          },
          {
            description: "All away players selected",
            expectedOptions: [
              `${defaultAwayPlayerNames[0]} - ${defaultAwayPlayerNames[1]}`,
              `${defaultAwayPlayerNames[0]} - ${defaultAwayPlayerNames[2]}`,
              `${defaultAwayPlayerNames[1]} - ${defaultAwayPlayerNames[2]}`,
            ],
            isHome: false,
            selectedPlayers: allPlayersSelected,
          },
        ];
        it.each(doublesPlayersSelectionTests)(
          `$description`,
          async ({ isHome, selectedPlayers, expectedOptions }) => {
            const homeSelectedPlayers = isHome
              ? selectedPlayers
              : [false, false, false];
            const awaySelectedPlayers = isHome
              ? [false, false, false]
              : selectedPlayers;
            const leagueMatchKey =
              await setUpDatabaseWithDefaultPlayersThatAreSelected(
                database,
                homeSelectedPlayers,
                awaySelectedPlayers,
              );
            render(createApp(leagueMatchKey));

            const doublesCombo = await findDoublesCombo(isHome);
            fireEvent.keyDown(doublesCombo, { key: "ArrowDown" });
            const listbox = screen.queryByRole("listbox");
            if (expectedOptions.length === 0) {
              expect(listbox).toBeNull();
            } else {
              const options = openAutocompleteAndGetOptions(doublesCombo).map(
                (li) => li.innerHTML,
              );
              expect(options).toEqual(expectedOptions);
            }
          },
        );
      });

      type ZeroOneTwo = 0 | 1 | 2;
      interface SelectDoublesTest {
        isHome: boolean;
        doublePairIndex: ZeroOneTwo;
        expectedPlayer1Position: ZeroOneTwo;
        expectedPlayer2Position: ZeroOneTwo;
      }
      describe("selecting a doubles pair", () => {
        /*
            const pairs: [number, number][] = [
            [0, 1],
            [0, 2],
            [1, 2],
      ];
        */
        const selectDoublesTests: SelectDoublesTest[] = [
          {
            isHome: true,
            doublePairIndex: 0,
            expectedPlayer1Position: 0,
            expectedPlayer2Position: 1,
          },
          {
            isHome: true,
            doublePairIndex: 1,
            expectedPlayer1Position: 0,
            expectedPlayer2Position: 2,
          },
          {
            isHome: true,
            doublePairIndex: 2,
            expectedPlayer1Position: 1,
            expectedPlayer2Position: 2,
          },

          {
            isHome: false,
            doublePairIndex: 0,
            expectedPlayer1Position: 0,
            expectedPlayer2Position: 1,
          },
          {
            isHome: false,
            doublePairIndex: 1,
            expectedPlayer1Position: 0,
            expectedPlayer2Position: 2,
          },
          {
            isHome: false,
            doublePairIndex: 2,
            expectedPlayer1Position: 1,
            expectedPlayer2Position: 2,
          },
        ];
        it.each(selectDoublesTests)(
          "should add players to doubles match - $isHome, $doublePairIndex",
          async ({
            isHome,
            doublePairIndex,
            expectedPlayer1Position,
            expectedPlayer2Position,
          }) => {
            let homeTeamPlayerIds: TeamPlayerIds = [
              undefined,
              undefined,
              undefined,
            ];
            let awayTeamPlayerIds: TeamPlayerIds = [
              undefined,
              undefined,
              undefined,
            ];
            const leagueMatchKey =
              await setUpDatabaseWithDefaultPlayersThatAreSelected(
                database,
                allPlayersSelected,
                allPlayersSelected,
                (_, homePlayerIds, awayPlayerIds) => {
                  homeTeamPlayerIds = homePlayerIds;
                  awayTeamPlayerIds = awayPlayerIds;
                },
              );

            let renderCount = 0;
            let currentMatchAndKeys: MatchAndKey[] = [];
            render(
              createApp(leagueMatchKey, (matchAndKeys) => {
                currentMatchAndKeys = matchAndKeys;
                renderCount++;
                return null;
              }),
            );

            const doublesCombo = await findDoublesCombo(isHome);
            selectNthOption(doublesCombo, doublePairIndex + 1);

            waitFor(() => renderCount === 2);

            const doublesMatch = currentMatchAndKeys[9].match;
            if (isHome) {
              expect(doublesMatch.team2Player1Id).toBeUndefined();
              expect(doublesMatch.team2Player2Id).toBeUndefined();
              expect(doublesMatch.team1Player1Id).toBe(
                homeTeamPlayerIds[expectedPlayer1Position],
              );
              expect(doublesMatch.team1Player2Id).toBe(
                homeTeamPlayerIds[expectedPlayer2Position],
              );
            } else {
              expect(doublesMatch.team1Player1Id).toBeUndefined();
              expect(doublesMatch.team1Player2Id).toBeUndefined();
              expect(doublesMatch.team2Player1Id).toBe(
                awayTeamPlayerIds[expectedPlayer1Position],
              );
              expect(doublesMatch.team2Player2Id).toBe(
                awayTeamPlayerIds[expectedPlayer2Position],
              );
            }
          },
        );
      });

      describe("deselecting a doubles pair", () => {
        it.each([true, false])(
          "should remove players from doubles match - $description",
          async (isHome) => {
            const leagueMatchKey =
              await setUpDatabaseWithDefaultPlayersThatAreSelected(
                database,
                allPlayersSelected,
                allPlayersSelected,
                (doublesMatch, homePlayerIds, awayPlayerIds) => {
                  if (isHome) {
                    doublesMatch.team1Player1Id = homePlayerIds[0]!;
                    doublesMatch.team1Player2Id = homePlayerIds[1]!;
                  } else {
                    doublesMatch.team2Player1Id = awayPlayerIds[0]!;
                    doublesMatch.team2Player2Id = awayPlayerIds[1]!;
                  }
                },
              );

            let renderCount = 0;
            let currentMatchAndKeys: MatchAndKey[] = [];
            render(
              createApp(leagueMatchKey, (matchAndKeys) => {
                currentMatchAndKeys = matchAndKeys;
                renderCount++;
                return null;
              }),
            );

            const doublesCombo = await findDoublesCombo(isHome);
            clearOptions(doublesCombo);

            waitFor(() => renderCount === 2);

            const doublesMatch = currentMatchAndKeys[9].match;

            expect(doublesMatch.team1Player1Id).toBeUndefined();
            expect(doublesMatch.team1Player2Id).toBeUndefined();
            expect(doublesMatch.team2Player1Id).toBeUndefined();
            expect(doublesMatch.team2Player2Id).toBeUndefined();
          },
        );
      });
    });
  });

  describe("scoresheet", () => {
    it("should show the scoresheet", async () => {
      const leagueMatchKey = await setupDatabase(database);
      render(
        createApp(leagueMatchKey, () => (
          <div data-testid="testscoreboard"></div>
        )),
      );

      const scoresheet = await findScoresheetSection();
      within(scoresheet).getByTestId("testscoreboard");
    });
  });
});
