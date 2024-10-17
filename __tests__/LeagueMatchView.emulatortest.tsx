/**
 * @jest-environment jsdom
 */
import {
  LeagueMatchSelection,
  LeagueMatchSelectionProps,
  livestreamDialogButtonAriaLabel,
  openForfeitDialogButtonAriaLabel,
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
} from "./leagueMatchViewSelectors";
import { fillArrayWithIndices } from "../src/helpers/fillArray";
import { getPlayerComboInputs } from "./leagueMatchViewSelectors";
import { findDoublesCombo } from "./leagueMatchViewSelectors";
import { openPlayerAutocompleteAndGetOptions } from "./leagueMatchViewSelectors";
import { MatchAndKey } from "../src/teamMatches/league/db-hooks/useLeagueMatchAndMatches";
import createEmulatorTests from "./createEmulatorTests";
import {
  SelectedPlayers,
  SetupDoubles,
  SetupMatch,
  TeamPlayerIds,
  allPlayersSelected,
  defaultAwayPlayerNames,
  defaultHomePlayerNames,
  defaultHomeTeamName,
  defaultTestClubSetups,
  getMatchSetupThatSetsDefaultPlayersThatAreSelected,
  lowerRankedDefaultHomePlayerNames,
  lowerRankedHomeTeamName,
  noPlayersSelected,
  setUpDatabaseWithDefaultPlayersThatAreSelected,
  setupDatabase,
} from "./setupDatabase";
import { getTeamForfeitButtonsContainerAriaLabel } from "../src/teamMatches/league/play/league-match-selection/getForfeitButtons";
import {
  ConcedeOrForfeit,
  getTeamConcedeOrForfeitKey,
} from "../src/firebase/rtb/match/dbMatch";
import { Livestreams } from "../src/firebase/rtb/team";

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

const mockUpdateForfeited: jest.Mock<
  unknown,
  Parameters<UpdateForfeitedModule["updateForfeited"]>
> = jest.fn();
type UpdateForfeitedModule =
  typeof import("../src/firebase/rtb/match/db-helpers/updateForfeited");
jest.mock<UpdateForfeitedModule>(
  "../src/firebase/rtb/match/db-helpers/updateForfeited",
  () => {
    return {
      updateForfeited(keys, forfeited, isHome, db) {
        mockUpdateForfeited(keys, forfeited, isHome, db);
        return Promise.resolve();
      },
    };
  },
);

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

      describe("enablement", () => {
        enum TestConcedeOrForfeit {
          Concede,
          Forfeit,
        }
        interface EnablementTest {
          description: string;
          isHome: boolean;

          playerConcedeOrForfeit?: TestConcedeOrForfeit;
          playerIndex: 0 | 1 | 2;

          doublesConcedeOrForfeit?: TestConcedeOrForfeit;
        }
        const enablementTests: EnablementTest[] = [
          {
            description: "A disabled when concede",
            isHome: true,
            playerIndex: 0,
            playerConcedeOrForfeit: TestConcedeOrForfeit.Concede,
          },
          {
            description: "A disabled when forfeit",
            isHome: true,
            playerIndex: 0,
            playerConcedeOrForfeit: TestConcedeOrForfeit.Forfeit,
          },
          {
            description: "B disabled when concede",
            isHome: true,
            playerIndex: 1,
            playerConcedeOrForfeit: TestConcedeOrForfeit.Concede,
          },
          {
            description: "B disabled when forfeit",
            isHome: true,
            playerIndex: 1,
            playerConcedeOrForfeit: TestConcedeOrForfeit.Forfeit,
          },
          {
            description: "C disabled when concede",
            isHome: true,
            playerIndex: 2,
            playerConcedeOrForfeit: TestConcedeOrForfeit.Concede,
          },
          {
            description: "C disabled when forfeit",
            isHome: true,
            playerIndex: 2,
            playerConcedeOrForfeit: TestConcedeOrForfeit.Forfeit,
          },
          {
            description: "C enabled when not conceded or forfeit",
            isHome: true,
            playerIndex: 2,
          },
          //doubles
          {
            description: "Home doubles disabled when concede",
            isHome: true,
            doublesConcedeOrForfeit: TestConcedeOrForfeit.Concede,
            playerIndex: 0,
          },
          {
            description: "Home doubles disabled when forfeit",
            isHome: true,
            doublesConcedeOrForfeit: TestConcedeOrForfeit.Forfeit,
            playerIndex: 0,
          },
          //away
          {
            description: "X disabled when concede",
            isHome: false,
            playerIndex: 0,
            playerConcedeOrForfeit: TestConcedeOrForfeit.Concede,
          },
          {
            description: "X disabled when forfeit",
            isHome: false,
            playerIndex: 0,
            playerConcedeOrForfeit: TestConcedeOrForfeit.Forfeit,
          },
          {
            description: "Y disabled when concede",
            isHome: false,
            playerIndex: 1,
            playerConcedeOrForfeit: TestConcedeOrForfeit.Concede,
          },
          {
            description: "Y disabled when forfeit",
            isHome: false,
            playerIndex: 1,
            playerConcedeOrForfeit: TestConcedeOrForfeit.Forfeit,
          },
          {
            description: "Z disabled when concede",
            isHome: false,
            playerIndex: 2,
            playerConcedeOrForfeit: TestConcedeOrForfeit.Concede,
          },
          {
            description: "Z disabled when forfeit",
            isHome: false,
            playerIndex: 2,
            playerConcedeOrForfeit: TestConcedeOrForfeit.Forfeit,
          },
          //doubles
          {
            description: "Away doubles disabled when concede",
            isHome: false,
            doublesConcedeOrForfeit: TestConcedeOrForfeit.Concede,
            playerIndex: 0,
          },
          {
            description: "Away doubles disabled when forfeit",
            isHome: false,
            doublesConcedeOrForfeit: TestConcedeOrForfeit.Forfeit,
            playerIndex: 0,
          },
          {
            description: "Away doubles enabled when not conceded or forfeit",
            isHome: false,
            playerIndex: 0,
          },
        ];
        it.each(enablementTests)(
          "$description",
          async ({
            isHome,
            playerIndex,
            playerConcedeOrForfeit,
            doublesConcedeOrForfeit,
          }) => {
            // could be precise and not select player if forfeited...
            const homeSelectedPlayers: SelectedPlayers = [true, true, true];
            const awaySelectedPlayers: SelectedPlayers = [true, true, true];

            const playersMatchIndicesAndDisplay = isHome
              ? homePlayersMatchIndicesAndDisplay
              : awayPlayersMatchIndicesAndDisplay;
            const matchIndices =
              playersMatchIndicesAndDisplay[playerIndex].matchIndices;

            const key = getTeamConcedeOrForfeitKey(isHome);
            const concedeOrForfeit: ConcedeOrForfeit = {
              isConcede:
                doublesConcedeOrForfeit === TestConcedeOrForfeit.Concede,
            };
            const leagueMatchKey = await setupDatabase(
              database,
              getMatchSetupThatSetsDefaultPlayersThatAreSelected(
                homeSelectedPlayers,
                awaySelectedPlayers,
                (doublesMatch) => {
                  if (doublesConcedeOrForfeit !== undefined) {
                    doublesMatch[key] = concedeOrForfeit;
                  }
                },
                (match, index) => {
                  if (playerConcedeOrForfeit !== undefined) {
                    if (matchIndices.includes(index)) {
                      match[key] = concedeOrForfeit;
                    }
                  }
                },
              ),
            );
            render(createApp(leagueMatchKey));

            const playerCombo = await findPlayerCombo(isHome, playerIndex);
            if (playerConcedeOrForfeit !== undefined) {
              expect(playerCombo).toBeDisabled();
            } else {
              expect(playerCombo).toBeEnabled();
            }

            const doublesCombo = await findDoublesCombo(isHome);
            if (doublesConcedeOrForfeit !== undefined) {
              expect(doublesCombo).toBeDisabled();
            } else {
              expect(doublesCombo).toBeEnabled();
            }
          },
        );
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
          selectedPlayers: SelectedPlayers;
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
              : noPlayersSelected;
            const awaySelectedPlayers = isHome
              ? noPlayersSelected
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

  describe("forfeiting", () => {
    const findOpenForfeitDialogButton = () =>
      screen.findByLabelText(openForfeitDialogButtonAriaLabel);
    const getForfeitDialog = () =>
      screen.getByRole("dialog", { name: "Forfeit" });

    const openForfeitDialog = async () => {
      const openForfeitDialogButton = await findOpenForfeitDialogButton();
      fireEvent.click(openForfeitDialogButton);

      return getForfeitDialog();
    };
    const getTeamForfeitButtonsContainer = (
      forfeitDialog: HTMLElement,
      isHome: boolean,
    ) =>
      within(forfeitDialog).getByLabelText(
        getTeamForfeitButtonsContainerAriaLabel(isHome),
      );
    describe("button enablement", () => {
      // ready ?

      it("should be disabled if all players and doubles pairs have been selected", async () => {
        const leagueMatchKey =
          await setUpDatabaseWithDefaultPlayersThatAreSelected(
            database,
            allPlayersSelected,
            allPlayersSelected,
            (doublesMatch) => {
              doublesMatch.team1Player1Id = defaultHomePlayerNames[0];
              doublesMatch.team1Player2Id = defaultHomePlayerNames[1];
              doublesMatch.team2Player1Id = defaultAwayPlayerNames[0];
              doublesMatch.team2Player2Id = defaultAwayPlayerNames[1];
            },
          );
        render(createApp(leagueMatchKey));

        const openForfeitDialogButton = await findOpenForfeitDialogButton();
        expect(openForfeitDialogButton).toBeDisabled();
      });
      it("should be enabled if there are selections to be made", async () => {
        const leagueMatchKey =
          await setUpDatabaseWithDefaultPlayersThatAreSelected(
            database,
            [true, false, false],
            allPlayersSelected,
          );
        render(createApp(leagueMatchKey));

        const openForfeitDialogButton = await findOpenForfeitDialogButton();
        expect(openForfeitDialogButton).toBeEnabled();
      });
    });
    describe("dialog forfeit / undo forfeit buttons presence", () => {
      interface ExpectedButton {
        ariaLabel: string;
        textContent: string;
      }
      const expectedForfeitDoubles: ExpectedButton = {
        ariaLabel: `forfeit doubles`,
        textContent: "D",
      };
      interface ForfeitButtonsTest {
        description: string;
        homeSelectedPlayers: SelectedPlayers;
        awaySelectedPlayers: SelectedPlayers;
        expectedHomeButtons?: ExpectedButton[];
        expectedAwayButtons?: ExpectedButton[];
        setupDoubles?: SetupDoubles;
        setupMatch?: SetupMatch;
      }
      const ForfeitButtonsTests: ForfeitButtonsTest[] = [
        // away
        {
          description: "doubles not selected, X not selected",
          homeSelectedPlayers: allPlayersSelected,
          awaySelectedPlayers: [false, true, true],
          expectedHomeButtons: [expectedForfeitDoubles],
          expectedAwayButtons: [
            {
              ariaLabel: `forfeit player X`,
              textContent: "X",
            },
            expectedForfeitDoubles,
          ],
        },
        {
          description: "doubles not selected, Y not selected",
          homeSelectedPlayers: allPlayersSelected,
          awaySelectedPlayers: [true, false, true],
          expectedHomeButtons: [expectedForfeitDoubles],
          expectedAwayButtons: [
            {
              ariaLabel: `forfeit player Y`,
              textContent: "Y",
            },
            expectedForfeitDoubles,
          ],
        },
        {
          description: "doubles not selected, Z not selected",
          homeSelectedPlayers: allPlayersSelected,
          awaySelectedPlayers: [true, true, false],
          expectedHomeButtons: [expectedForfeitDoubles],
          expectedAwayButtons: [
            {
              ariaLabel: `forfeit player Z`,
              textContent: "Z",
            },
            expectedForfeitDoubles,
          ],
        },
        // home
        {
          description: "doubles not selected, A not selected",
          homeSelectedPlayers: [false, true, true],
          awaySelectedPlayers: allPlayersSelected,
          expectedHomeButtons: [
            expectedForfeitDoubles,
            {
              ariaLabel: `forfeit player A`,
              textContent: "A",
            },
          ],
          expectedAwayButtons: [expectedForfeitDoubles],
        },
        {
          description: "doubles not selected, B not selected",
          homeSelectedPlayers: [true, false, true],
          awaySelectedPlayers: allPlayersSelected,
          expectedHomeButtons: [
            expectedForfeitDoubles,
            {
              ariaLabel: `forfeit player B`,
              textContent: "B",
            },
          ],
          expectedAwayButtons: [expectedForfeitDoubles],
        },
        {
          description: "doubles not selected, C not selected",
          homeSelectedPlayers: [true, true, false],
          awaySelectedPlayers: allPlayersSelected,
          expectedHomeButtons: [
            expectedForfeitDoubles,
            {
              ariaLabel: `forfeit player C`,
              textContent: "C",
            },
          ],
          expectedAwayButtons: [expectedForfeitDoubles],
        },
        {
          description: "doubles home selected",
          homeSelectedPlayers: allPlayersSelected,
          awaySelectedPlayers: allPlayersSelected,
          expectedAwayButtons: [expectedForfeitDoubles],
          setupDoubles: (doublesMatch) => {
            doublesMatch.team1Player1Id = defaultHomePlayerNames[0];
            doublesMatch.team1Player2Id = defaultHomePlayerNames[1];
          },
        },
        {
          description: "doubles away selected",
          homeSelectedPlayers: allPlayersSelected,
          awaySelectedPlayers: allPlayersSelected,
          expectedHomeButtons: [expectedForfeitDoubles],
          setupDoubles: (doublesMatch) => {
            doublesMatch.team2Player1Id = defaultAwayPlayerNames[0];
            doublesMatch.team2Player2Id = defaultAwayPlayerNames[1];
          },
        },
        // undo forfeit
        {
          description: "undo forfeited A",
          homeSelectedPlayers: [false, true, true],
          awaySelectedPlayers: allPlayersSelected,
          setupMatch: (match, index) => {
            if (index === 0) {
              match.team1ConcedeOrForfeit = {
                isConcede: false,
              };
            }
          },
          expectedHomeButtons: [
            expectedForfeitDoubles,
            {
              ariaLabel: `undo forfeit player A`,
              textContent: "A",
            },
          ],
          expectedAwayButtons: [expectedForfeitDoubles],
        },
      ];
      it.each(ForfeitButtonsTests)(
        "$description",
        async ({
          homeSelectedPlayers,
          awaySelectedPlayers,
          setupDoubles,
          setupMatch,
          expectedHomeButtons,
          expectedAwayButtons,
        }) => {
          const leagueMatchKey = await setupDatabase(
            database,
            getMatchSetupThatSetsDefaultPlayersThatAreSelected(
              homeSelectedPlayers,
              awaySelectedPlayers,
              setupDoubles,
              setupMatch,
            ),
          );
          render(createApp(leagueMatchKey));

          const forfeitDialog = await openForfeitDialog();
          const expectExpectedButtons = (
            isHome: boolean,
            expectedButtons: ExpectedButton[] | undefined,
          ) => {
            if (expectedButtons === undefined) {
              const forfeitButtonsContainer = within(
                forfeitDialog,
              ).queryByLabelText(
                getTeamForfeitButtonsContainerAriaLabel(isHome),
              );
              expect(forfeitButtonsContainer).toBeNull();
            } else {
              const forfeitButtonsContainer = getTeamForfeitButtonsContainer(
                forfeitDialog,
                isHome,
              );
              expectedButtons.forEach(({ ariaLabel, textContent }) => {
                const forfeitButton = within(
                  forfeitButtonsContainer,
                ).getByLabelText(ariaLabel);
                expect(forfeitButton).toHaveTextContent(textContent);
              });
              const numForfeitButtons = within(
                forfeitButtonsContainer,
              ).getAllByRole("button").length;
              expect(numForfeitButtons).toBe(expectedButtons.length);
            }
          };

          expectExpectedButtons(true, expectedHomeButtons);
          expectExpectedButtons(false, expectedAwayButtons);
        },
      );
    });
    describe("clicking forfeit / undo forfeit buttons", () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      interface ForfeitClickTest {
        description: string;
        homeSelectedPlayers: SelectedPlayers;
        awaySelectedPlayers: SelectedPlayers;
        setupDoubles?: SetupDoubles;
        setupMatch?: SetupMatch;
        isHome: boolean;
        forfeitButtonAriaLabel: string;
        expectedForfeitKeys: string[];
        expectedForfeited: boolean;
      }
      const getPlayerExpectedForfeitKeys = (
        isHome: boolean,
        playerIndex: number,
      ) => {
        const playersMatchIndicesAndDisplay = isHome
          ? homePlayersMatchIndicesAndDisplay
          : awayPlayersMatchIndicesAndDisplay;
        return playersMatchIndicesAndDisplay[playerIndex].matchIndices.map(
          (i) => i.toString(),
        );
      };
      const forfeitClickTests: ForfeitClickTest[] = [
        // home
        {
          homeSelectedPlayers: [false, true, true],
          awaySelectedPlayers: allPlayersSelected,
          description: "forfeit player A",
          isHome: true,
          forfeitButtonAriaLabel: "forfeit player A",
          expectedForfeited: true,
          expectedForfeitKeys: getPlayerExpectedForfeitKeys(true, 0),
        },
        {
          homeSelectedPlayers: [true, false, true],
          awaySelectedPlayers: allPlayersSelected,
          description: "forfeit player B",
          isHome: true,
          forfeitButtonAriaLabel: "forfeit player B",
          expectedForfeited: true,
          expectedForfeitKeys: ["1", "3", "6"],
        },
        {
          homeSelectedPlayers: [true, true, false],
          awaySelectedPlayers: allPlayersSelected,
          description: "forfeit player C",
          isHome: true,
          forfeitButtonAriaLabel: "forfeit player C",
          expectedForfeited: true,
          expectedForfeitKeys: ["2", "5", "7"],
        },
        //doubles
        {
          homeSelectedPlayers: allPlayersSelected,
          awaySelectedPlayers: allPlayersSelected,
          description: "forfeit home doubles",
          isHome: true,
          forfeitButtonAriaLabel: "forfeit doubles",
          expectedForfeited: true,
          expectedForfeitKeys: ["9"],
        },
        //away
        {
          homeSelectedPlayers: allPlayersSelected,
          awaySelectedPlayers: [false, true, true],
          description: "forfeit player X",
          isHome: false,
          forfeitButtonAriaLabel: "forfeit player X",
          expectedForfeited: true,
          expectedForfeitKeys: ["0", "3", "7"],
        },
        {
          homeSelectedPlayers: allPlayersSelected,
          awaySelectedPlayers: [true, false, true],
          description: "forfeit player Y",
          isHome: false,
          forfeitButtonAriaLabel: "forfeit player Y",
          expectedForfeited: true,
          expectedForfeitKeys: ["1", "5", "8"],
        },
        {
          homeSelectedPlayers: allPlayersSelected,
          awaySelectedPlayers: [true, true, false],
          description: "forfeit player Z",
          isHome: false,
          forfeitButtonAriaLabel: "forfeit player Z",
          expectedForfeited: true,
          expectedForfeitKeys: ["2", "4", "6"],
        },
        //doubles
        {
          homeSelectedPlayers: allPlayersSelected,
          awaySelectedPlayers: allPlayersSelected,
          description: "forfeit away doubles",
          isHome: false,
          forfeitButtonAriaLabel: "forfeit doubles",
          expectedForfeited: true,
          expectedForfeitKeys: ["9"],
        },
        // undo forfeit
        {
          homeSelectedPlayers: allPlayersSelected,
          awaySelectedPlayers: [true, true, false],
          setupMatch: (match, index) => {
            const matchIndixesZ =
              awayPlayersMatchIndicesAndDisplay[2].matchIndices;
            if (matchIndixesZ.includes(index)) {
              match.team2ConcedeOrForfeit = {
                isConcede: false,
              };
            }
          },
          description: "undo forfeit player Z",
          isHome: false,
          forfeitButtonAriaLabel: "undo forfeit player Z",
          expectedForfeited: false,
          expectedForfeitKeys: ["2", "4", "6"],
        },
        {
          homeSelectedPlayers: allPlayersSelected,
          awaySelectedPlayers: allPlayersSelected,
          setupDoubles: (doublesMatch) => {
            doublesMatch.team2ConcedeOrForfeit = {
              isConcede: false,
            };
          },
          description: "undo forfeit away doubles",
          isHome: false,
          forfeitButtonAriaLabel: "undo forfeit doubles",
          expectedForfeited: false,
          expectedForfeitKeys: ["9"],
        },
        {
          homeSelectedPlayers: [false, true, true],
          awaySelectedPlayers: allPlayersSelected,
          setupMatch: (match, index) => {
            const matchIndicesA =
              homePlayersMatchIndicesAndDisplay[0].matchIndices;
            if (matchIndicesA.includes(index)) {
              match.team1ConcedeOrForfeit = {
                isConcede: false,
              };
            }
          },
          description: "undo forfeit player A",
          isHome: true,
          forfeitButtonAriaLabel: "undo forfeit player A",
          expectedForfeited: false,
          expectedForfeitKeys: ["0", "4", "8"],
        },
        {
          homeSelectedPlayers: allPlayersSelected,
          awaySelectedPlayers: allPlayersSelected,
          setupDoubles: (doublesMatch) => {
            doublesMatch.team1ConcedeOrForfeit = {
              isConcede: false,
            };
          },
          description: "undo forfeit home doubles",
          isHome: true,
          forfeitButtonAriaLabel: "undo forfeit doubles",
          expectedForfeited: false,
          expectedForfeitKeys: ["9"],
        },
      ];
      it.each(forfeitClickTests)(
        "$description",
        async ({
          homeSelectedPlayers,
          awaySelectedPlayers,
          setupDoubles,
          setupMatch,
          forfeitButtonAriaLabel,
          isHome,
          expectedForfeited,
          expectedForfeitKeys: expectedForfeitkeys,
        }) => {
          const leagueMatchKey = await setupDatabase(
            database,
            getMatchSetupThatSetsDefaultPlayersThatAreSelected(
              homeSelectedPlayers,
              awaySelectedPlayers,
              setupDoubles,
              setupMatch,
            ),
          );
          render(createApp(leagueMatchKey));

          const forfeitDialog = await openForfeitDialog();
          const teamForfeitButtonsContainer = getTeamForfeitButtonsContainer(
            forfeitDialog,
            isHome,
          );
          const forfeitButton = within(
            teamForfeitButtonsContainer,
          ).getByLabelText(forfeitButtonAriaLabel);
          fireEvent.click(forfeitButton);

          const updateForfeitedCall = mockUpdateForfeited.mock.calls[0];
          expect(updateForfeitedCall[0]).toEqual(expectedForfeitkeys);
          expect(updateForfeitedCall[1]).toBe(expectedForfeited);
          expect(updateForfeitedCall[2]).toBe(isHome);
          expect(updateForfeitedCall[3]).toBe(database);
        },
      );
    });
  });

  describe.only("livestreams", () => {
    const findOpenLivestreamDialogButton = () => {
      return screen.findByLabelText(livestreamDialogButtonAriaLabel);
    };
    const getLivestreamDialog = () => {
      return screen.getByRole("dialog", { name: "Live stream urls" });
    };
    const openLivestreamDialog = async () => {
      const openForfeitDialogButton = await findOpenLivestreamDialogButton();
      fireEvent.click(openForfeitDialogButton);
      return getLivestreamDialog();
    };
    it("should not show the livestream dialog when the button has not been  clicked", async () => {
      const leagueMatchKey = await setupDatabase(database);
      render(createApp(leagueMatchKey));

      expect(getLivestreamDialog).toThrow();
    });

    it("should show the livestream dialog when click the button", async () => {
      const leagueMatchKey = await setupDatabase(database);
      render(createApp(leagueMatchKey));
      await openLivestreamDialog();
    });

    async function renderExpectOptions(
      leagueMatchKey: string,
      expectedOptions: string[],
    ) {
      render(createApp(leagueMatchKey));
      const livestreamDialog = await openLivestreamDialog();
      const comboBox = within(livestreamDialog).getByRole("combobox");
      fireEvent.keyDown(comboBox, { key: "ArrowDown" });
      const options = screen.getAllByRole("option");
      const realOptions = options.filter(
        (option) => option.getAttribute("tabindex") !== null,
      );
      expect(realOptions.map((option) => option.textContent)).toEqual(
        expectedOptions,
      );
    }

    async function setupDatabaseForLiveStreams(
      setUpMatch?: SetupMatch,
      liveStreams?: Livestreams,
    ) {
      const matchSetup = getMatchSetupThatSetsDefaultPlayersThatAreSelected(
        allPlayersSelected,
        allPlayersSelected,
        (doublesMatch) => {
          doublesMatch.team1Player1Id = defaultHomePlayerNames[0];
          doublesMatch.team1Player2Id = defaultHomePlayerNames[1];
          doublesMatch.team2Player1Id = defaultAwayPlayerNames[0];
          doublesMatch.team2Player2Id = defaultAwayPlayerNames[1];
        },
        setUpMatch,
      );
      const leagueMatchKey = await setupDatabase(
        database,
        matchSetup,
        undefined,
        undefined,
        undefined,
        false,
        liveStreams,
      );
      return leagueMatchKey;
    }
    async function optionsTest(
      expectedOptions: string[],
      setUpMatch?: SetupMatch,
      liveStreams?: Livestreams,
    ) {
      const leagueMatchKey = await setupDatabaseForLiveStreams(
        setUpMatch,
        liveStreams,
      );
      renderExpectOptions(leagueMatchKey, expectedOptions);
    }
    it("should show options for free, Main Table and all games by default,", async () => {
      await optionsTest([
        "Free",
        "Main table",
        "Game 1",
        "Game 2",
        "Game 3",
        "Game 4",
        "Game 5",
        "Game 6",
        "Game 7",
        "Game 8",
        "Game 9",
        "Game 10",
      ]);
    });
    xit("should show an option for all table ids", async () => {});
    it("should only show games options for game that have not been won or Conceded/Forfeited", async () => {
      await optionsTest(
        [
          "Free",
          "Main table",
          "Game 1",
          "Game 3",
          "Game 5",
          "Game 6",
          "Game 7",
          "Game 8",
          "Game 9",
          "Game 10",
        ],
        (match, index) => {
          // todo
          switch (index) {
            case 1:
              match.team1ConcedeOrForfeit = {
                isConcede: true,
              };
              break;
            case 3:
              match.team1ConcedeOrForfeit = {
                isConcede: false,
              };
              break;
            case 6:
              throw new Error("Not implemented");
          }
        },
      );
    });
  });
});
