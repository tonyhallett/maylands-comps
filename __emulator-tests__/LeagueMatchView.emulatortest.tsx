/**
 * @jest-environment jsdom
 */
import {
  LeagueMatchSelectionProps,
  livestreamDialogButtonAriaLabel,
  openForfeitDialogButtonAriaLabel,
} from "../src/teamMatches/league/play/league-match-selection/LeagueMatchSelection";
import { LeagueMatchSelection } from "../src/teamMatches/league/play/league-match-selection/LeagueMatchSelection";
import {
  screen,
  render,
  waitFor,
  within,
  fireEvent,
} from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
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
import {
  Livestream,
  LivestreamService,
  Livestreams,
} from "../src/firebase/rtb/team";
import {
  addLivestreamButtonAriaLabel,
  deleteSectionAriaLabel,
  toggleButtonGroupAriaLabel,
} from "../src/teamMatches/league/play/league-match-selection/livestreams/LiveStreamingDialog";
import { LivestreamProvider } from "../src/teamMatches/league/play/league-match-selection/livestreams/LivestreamProvider";
import { updateLivestreams } from "../src/firebase/rtb/match/db-helpers/updateLivestreams";
import { twitchProvider } from "../src/teamMatches/league/play/league-match-selection/livestreams/providers/twitchProvider";
import { instagramProvider } from "../src/teamMatches/league/play/league-match-selection/livestreams/providers/instagramProvider";
import { facebookProvider } from "../src/teamMatches/league/play/league-match-selection/livestreams/providers/facebookProvider";
import { youtubeProvider } from "../src/teamMatches/league/play/league-match-selection/livestreams/providers/youtubeProvider";
import { mainTable } from "../src/teamMatches/league/play/league-match-selection/getTablesAndMatchesNotCompleted";
import { matchScoreGamesWon } from "./matchScoringHelpers";
const mockedUpdateLivestreams = updateLivestreams as unknown as jest.Mock<
  typeof updateLivestreams
>;
let mockKeyCount = 0;
jest.mock("../src/firebase/rtb/getNewKey", () => {
  return {
    getNewKey: jest.fn(() => {
      return `${mockKeyCount++}`;
    }),
  };
});
jest.mock("../src/firebase/rtb/match/db-helpers/updateLivestreams", () => {
  return {
    updateLivestreams: jest.fn(),
  };
});

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

let leagueMatchKey: string;
function createApp(
  leagueMatchId: string,
  renderScoresheet: LeagueMatchSelectionProps["renderScoresheet"] = () => null,
) {
  leagueMatchKey = leagueMatchId;
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

  beforeEach(() => {
    jest.clearAllMocks();
    mockKeyCount = 0;
  });

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

  describe("livestreams", () => {
    const findOpenLivestreamDialogButton = () => {
      return screen.findByLabelText(livestreamDialogButtonAriaLabel);
    };

    const findLivestreamDialog = () => {
      return screen.findByRole("dialog", { name: "Live stream urls" });
    };

    const openLivestreamDialog = async () => {
      const openForfeitDialogButton = await findOpenLivestreamDialogButton();
      fireEvent.click(openForfeitDialogButton);
      return await findLivestreamDialog();
    };

    function renderOpenDialog(leagueMatchKey: string) {
      render(createApp(leagueMatchKey));
      return openLivestreamDialog();
    }

    function getLivestreamRealOptions(livestreamDialog: HTMLElement) {
      const comboBox = within(livestreamDialog).getByRole("combobox");
      fireEvent.keyDown(comboBox, { key: "ArrowDown" });
      const options = screen.getAllByRole("option");
      return options.filter(
        (option) => option.getAttribute("tabindex") !== null,
      );
    }

    async function renderOpenDialogGetRealOptions(leagueMatchKey: string) {
      const dialog = await renderOpenDialog(leagueMatchKey);
      const options = getLivestreamRealOptions(dialog);
      return {
        dialog,
        options,
      };
    }

    async function renderOpenAndSelectOption(
      leagueMatchKey: string,
      optionIndex: number,
    ) {
      const { dialog, options } =
        await renderOpenDialogGetRealOptions(leagueMatchKey);
      fireEvent.click(options[optionIndex]);
      return { dialog, options };
    }

    describe("showing the dialog", () => {
      it("should not show the livestream dialog when the button has not been clicked", async () => {
        const leagueMatchKey = await setupDatabase(database);
        render(createApp(leagueMatchKey));

        expect(() =>
          screen.getByRole("dialog", { name: "Live stream urls" }),
        ).toThrow();
      });

      it("should show the livestream dialog when click the button", async () => {
        const leagueMatchKey = await setupDatabase(database);
        render(createApp(leagueMatchKey));
        await openLivestreamDialog();
      });
    });

    async function renderExpectOptions(
      leagueMatchKey: string,
      expectedOptions: string[],
    ) {
      const { options } = await renderOpenDialogGetRealOptions(leagueMatchKey);

      expect(options.map((option) => option.textContent)).toEqual(
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

    describe("available options", () => {
      async function optionsTest(
        expectedOptions: string[],
        setUpMatch?: SetupMatch,
        liveStreams?: Livestreams,
      ) {
        const leagueMatchKey = await setupDatabaseForLiveStreams(
          setUpMatch,
          liveStreams,
        );
        await renderExpectOptions(leagueMatchKey, expectedOptions);
      }

      const allGames = [
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
      ];

      it("should show options for free, Main Table and all games by default,", async () => {
        await optionsTest(["Free", "Main table", ...allGames]);
      });

      it("should show an option for all table ids", async () => {
        await optionsTest(
          ["Free", "Main table", "Table 1", "Table 2", ...allGames],
          (match, index) => {
            switch (index) {
              case 1:
              case 2:
                match.tableId = "1";
                break;
              case 3:
                match.tableId = "2";
            }
          },
        );
      });

      it("should only show games options for game that have not been won or Conceded/Forfeited", async () => {
        await optionsTest(
          [
            "Free",
            "Main table",
            "Game 1",
            "Game 3",
            "Game 5",
            "Game 6",
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
                matchScoreGamesWon(match, 3, 0);
            }
          },
        );
      });
    });

    function getCommitButton(livestreamDialog: HTMLElement) {
      return within(livestreamDialog).getByRole("button", {
        name: "Commit",
      });
    }

    function getDeleteButtons(livestreamDialog: HTMLElement) {
      const deleteSection = within(livestreamDialog).getByRole("region", {
        name: deleteSectionAriaLabel,
      });
      return within(deleteSection).getAllByRole("button");
    }

    it("should have commit disabled when there has been no changes", async () => {
      const leagueMatchKey = await setupDatabase(database);
      const livestreamDialog = await renderOpenDialog(leagueMatchKey);

      expect(getCommitButton(livestreamDialog)).toBeDisabled();
    });

    describe("add/delete", () => {
      async function setupGetDeleteButtons(
        livestreams: Livestream[],
        selectedOption: number,
        setupMatch?: SetupMatch,
      ) {
        const livestreamsObject: Livestreams = {};
        livestreams.forEach((livestream, index) => {
          livestreamsObject[index.toString()] = livestream;
        });

        const leagueMatchKey = await setupDatabaseForLiveStreams(
          setupMatch,
          livestreamsObject,
        );

        const { dialog } = await renderOpenAndSelectOption(
          leagueMatchKey,
          selectedOption,
        );
        const deleteButtons = getDeleteButtons(dialog);
        return {
          deleteButtons,
          dialog,
        };
      }
      interface ExpectedDeleteButton {
        tag: string;
        iconTestId: string;
      }

      function expectDeleteButtons(
        deleteButtons: HTMLElement[],
        expectedDeleteButtons: ExpectedDeleteButton[],
      ) {
        expect(deleteButtons).toHaveLength(expectedDeleteButtons.length);
        expectedDeleteButtons.forEach(({ tag: textContent, iconTestId }) => {
          const deleteButton = deleteButtons.find(
            (button) => button.textContent === textContent,
          );
          expect(within(deleteButton!).getByTestId(iconTestId));
        });
      }

      describe("delete", () => {
        describe("should show livestreams for the selected option available for deletion by their tag and icon", () => {
          interface SelectedOptionLivestreamsTest {
            description: string;
            selectedOption: number;
            setupMatch?: SetupMatch;
            // don't need the playerUrl for this test
            livestreams: Livestream[];
            expectedDeleteButtons: ExpectedDeleteButton[];
          }

          const mainTableLivestream: Livestream = {
            url: "maintable",
            tag: "maintable",
            service: LivestreamService.facebook,
            identifier: mainTable,
          };
          const freeLivestreams: Livestream[] = [
            {
              url: "free1",
              tag: "free1",
              service: LivestreamService.youtube,
            },
            {
              url: "free2",
              tag: "free2",
              service: LivestreamService.twitch,
            },
          ];
          const game1Livestream: Livestream = {
            url: "game1",
            tag: "game1",
            service: LivestreamService.instagram,
            identifier: 0,
          };
          const game2Livestream: Livestream = {
            url: "game2",
            tag: "game2",
            service: LivestreamService.youtube,
            identifier: 1,
          };
          const selectedOptionLivestreamsTests: SelectedOptionLivestreamsTest[] =
            [
              {
                description: "Free",
                selectedOption: 0,
                // no identifier - Free
                livestreams: [...freeLivestreams, mainTableLivestream],
                expectedDeleteButtons: [
                  {
                    tag: freeLivestreams[0].tag,
                    iconTestId: "YouTubeIcon",
                  },
                  {
                    tag: freeLivestreams[1].tag,
                    iconTestId: "TwitchIcon",
                  },
                ],
              },
              {
                description: "Main table",
                selectedOption: 1,
                livestreams: [...freeLivestreams, mainTableLivestream],
                expectedDeleteButtons: [
                  {
                    tag: mainTableLivestream.tag,
                    iconTestId: "FacebookIcon",
                  },
                ],
              },
              {
                description: "Game (1)",
                selectedOption: 2,
                livestreams: [
                  ...freeLivestreams,
                  mainTableLivestream,
                  game1Livestream,
                ],
                expectedDeleteButtons: [
                  {
                    tag: game1Livestream.tag,
                    iconTestId: "InstagramIcon",
                  },
                ],
              },
              {
                description: "Game (2)",
                selectedOption: 3,
                livestreams: [game1Livestream, game2Livestream],
                expectedDeleteButtons: [
                  {
                    tag: game2Livestream.tag,
                    iconTestId: "YouTubeIcon",
                  },
                ],
              },
              {
                description: "Custom table",
                selectedOption: 2,
                setupMatch: (match) => {
                  match.tableId = "Custom";
                },
                livestreams: [
                  ...freeLivestreams,
                  mainTableLivestream,
                  game1Livestream,
                  {
                    service: LivestreamService.instagram,
                    tag: "Custom",
                    url: "Custom",
                    identifier: "Custom",
                  },
                ],
                expectedDeleteButtons: [
                  {
                    tag: "Custom",
                    iconTestId: "InstagramIcon",
                  },
                ],
              },
            ];
          it.each(selectedOptionLivestreamsTests)(
            "$description",
            async ({
              selectedOption,
              setupMatch,
              expectedDeleteButtons,
              livestreams,
            }) => {
              const { deleteButtons } = await setupGetDeleteButtons(
                livestreams,
                selectedOption,
                setupMatch,
              );
              expectDeleteButtons(deleteButtons, expectedDeleteButtons);
            },
          );
        });

        describe("deleting a livestream", () => {
          it("should have commit enabled when a livestream has been deleted", async () => {
            const { deleteButtons, dialog } = await setupGetDeleteButtons(
              [
                {
                  url: "free1",
                  tag: "free1",
                  service: LivestreamService.youtube,
                },
              ],
              0,
              undefined,
            );

            fireEvent.click(deleteButtons[0]);

            expect(getCommitButton(dialog)).toBeEnabled();
          });
          async function deleteLivestream(deleteFirst: boolean) {
            const deleteButtonIndex = deleteFirst ? 0 : 1;
            const { deleteButtons, dialog } = await setupGetDeleteButtons(
              [
                {
                  url: "free1",
                  tag: "free1",
                  service: LivestreamService.youtube,
                },
                {
                  url: "free2",
                  tag: "free2",
                  service: LivestreamService.instagram,
                },
              ],
              0,
              undefined,
            );

            fireEvent.click(deleteButtons[deleteButtonIndex]);
            return dialog;
          }
          it.each([true, false])(
            "should not show the deleted livestream in the list of available livestreams",
            async (deleteFirst) => {
              const dialog = await deleteLivestream(deleteFirst);

              const updatedDeleteButtons = getDeleteButtons(dialog);

              expect(updatedDeleteButtons).toHaveLength(1);
              const expectedText = deleteFirst ? "free2" : "free1";
              expect(updatedDeleteButtons[0]).toHaveTextContent(expectedText);
            },
          );

          it.each([true, false])(
            "should update the database with the deleted livestream when commit",
            async (deleteFirst) => {
              const dialog = await deleteLivestream(deleteFirst);

              fireEvent.click(getCommitButton(dialog));

              const deletedKey = deleteFirst ? "0" : "1";

              expect(mockedUpdateLivestreams).toHaveBeenCalledWith<
                Parameters<typeof updateLivestreams>
              >(database, leagueMatchKey, { [deletedKey]: null });
            },
          );
        });
      });

      function getTagTextField(livestreamDialog: HTMLElement) {
        return within(livestreamDialog).getByLabelText("Tag");
      }

      function getLivestreamTextField(
        livestreamDialog: HTMLElement,
        livestreamProvider: LivestreamProvider,
      ) {
        return within(livestreamDialog).getByLabelText(
          livestreamProvider.inputLabel,
        );
      }

      function clickLivestreamProviderButton(
        livestreamDialog: HTMLElement,
        livestreamProvider: LivestreamProvider,
      ) {
        const toggleButtonGroup = within(livestreamDialog).getByRole("group", {
          name: toggleButtonGroupAriaLabel,
        });
        const button = within(toggleButtonGroup).getByRole("button", {
          name: livestreamProvider.serviceName,
        });
        fireEvent.click(button);
      }

      async function typeInLivestream(
        dialog: HTMLElement,
        livestream: string,
        user: UserEvent,
        livestreamProvider: LivestreamProvider = youtubeProvider,
      ) {
        const livestreamTextField = getLivestreamTextField(
          dialog,
          livestreamProvider,
        );

        await user.type(livestreamTextField, livestream);
        return livestreamTextField;
      }

      async function typeLivestream(
        livestream: string,
        optionNumber = 0,
        livestreamProvider: LivestreamProvider = youtubeProvider,
      ) {
        const user = userEvent.setup();
        const leagueMatchKey = await setupDatabase(database);
        const { dialog } = await renderOpenAndSelectOption(
          leagueMatchKey,
          optionNumber,
        );

        if (livestreamProvider !== youtubeProvider) {
          clickLivestreamProviderButton(dialog, livestreamProvider);
        }

        const livestreamTextField = await typeInLivestream(
          dialog,
          livestream,
          user,
          livestreamProvider,
        );

        return {
          dialog,
          livestreamTextField,
          user,
        };
      }

      function getAddLivestreamButton(livestreamDialog: HTMLElement) {
        return within(livestreamDialog).getByRole("button", {
          name: addLivestreamButtonAriaLabel,
        });
      }

      function clickAddLivestream(livestreamDialog: HTMLElement) {
        fireEvent.click(getAddLivestreamButton(livestreamDialog));
      }

      async function typePermittedAndAdd(
        livestream: string,
        optionNumber = 0,
        livestreamProvider?: LivestreamProvider,
      ) {
        const { dialog } = await typeLivestream(
          livestream,
          optionNumber,
          livestreamProvider,
        );
        clickAddLivestream(dialog);
        return dialog;
      }

      async function typeInTag(
        tag: string,
        dialog: HTMLElement,
        user: UserEvent,
        clear = true,
      ) {
        const tagTextField = getTagTextField(dialog);
        if (clear) {
          user.clear(tagTextField);
        }
        await user.type(tagTextField, "custom");
        return tagTextField;
      }

      async function typeTag(tag: string) {
        const user = userEvent.setup();
        const leagueMatchKey = await setupDatabase(database);
        const { dialog } = await renderOpenAndSelectOption(leagueMatchKey, 0);

        const tagTextField = await typeInTag(tag, dialog, user);
        return {
          dialog,
          user,
          tagTextField,
        };
      }

      const videoId = "U_BtCIwvHqg";
      const aYoutubeLiveUrl = `https://youtube.com/live/${videoId}`;

      describe("adding livestreams", () => {
        it("should have disabled livestream and tag text fields when have not selected an option", async () => {
          const leagueMatchKey = await setupDatabase(database);
          const livestreamDialog = await renderOpenDialog(leagueMatchKey);

          const livestreamTextField = getLivestreamTextField(
            livestreamDialog,
            youtubeProvider,
          );
          const tagTextField = within(livestreamDialog).getByLabelText("Tag");
          expect(livestreamTextField).toBeDisabled();
          expect(tagTextField).toBeDisabled();
        });

        it("should should have enabled livestream ( labelled from first provider ) and tag text fields when have selected an option", async () => {
          const leagueMatchKey = await setupDatabase(database);
          const { dialog } = await renderOpenAndSelectOption(leagueMatchKey, 0);

          const livestreamTextField = getLivestreamTextField(
            dialog,
            youtubeProvider,
          );
          const tagTextField = getTagTextField(dialog);
          expect(livestreamTextField).toBeEnabled();
          expect(tagTextField).toBeEnabled();
        });

        it("should have disabled add livestream button when no option selected", async () => {
          const leagueMatchKey = await setupDatabase(database);
          const livestreamDialog = await renderOpenDialog(leagueMatchKey);

          const addLivestreamButton = getAddLivestreamButton(livestreamDialog);
          expect(addLivestreamButton).toBeDisabled();
        });

        interface NotPermittedTest {
          livestreamProvider: LivestreamProvider;
          notPermitted: string;
        }

        const notPermittedTests: NotPermittedTest[] = [
          {
            livestreamProvider: youtubeProvider,
            notPermitted: "notpermitted",
          },
          {
            livestreamProvider: twitchProvider,
            notPermitted: "x",
          },
          {
            livestreamProvider: facebookProvider,
            notPermitted: "notpermitted",
          },
          {
            livestreamProvider: instagramProvider,
            notPermitted: "notpermitted",
          },
        ];

        it.each(notPermittedTests)(
          "should have livestream text field in error when not permitted - $livestreamProvider.serviceName",
          async ({ livestreamProvider, notPermitted }) => {
            const { livestreamTextField } = await typeLivestream(
              notPermitted,
              0,
              livestreamProvider,
            );
            expect(livestreamTextField).toBeInvalid();
          },
        );

        interface PermittedTest {
          permitted: string;
          expectedTag: string;
          expectedPlayerProp?: string;
        }
        interface PermittedTests {
          livestreamProvider: LivestreamProvider;
          permitted: PermittedTest[];
          expectedIconTestId: string;
        }

        const livestreamProviderPermittedTests: PermittedTests[] = [
          {
            livestreamProvider: youtubeProvider,
            permitted: [
              {
                permitted: "https://youtube.com/live/U_BtCIwvHqg",
                expectedTag: "U_BtCIwvHqg",
                expectedPlayerProp: "https://youtube.com/live/U_BtCIwvHqg",
              },
              {
                permitted: "https://www.youtube.com/live/jfKfPfyJRdk",
                expectedTag: "jfKfPfyJRdk",
                expectedPlayerProp: "https://www.youtube.com/live/jfKfPfyJRdk",
              },
              {
                permitted: "https://www.youtube.com/watch?v=97d-tPo-YCQ",
                expectedTag: "97d-tPo-YCQ",
                expectedPlayerProp:
                  "https://www.youtube.com/watch?v=97d-tPo-YCQ",
              },
            ],
            expectedIconTestId: "YouTubeIcon",
          },
          {
            livestreamProvider: twitchProvider,
            expectedIconTestId: "TwitchIcon",
            permitted: [
              {
                permitted: "https://www.twitch.tv/username",
                expectedTag: "username",
                expectedPlayerProp: "twitch.tv/username",
              },
              {
                permitted: "username",
                expectedTag: "username",
                expectedPlayerProp: "twitch.tv/username",
              },
            ],
          },
          {
            livestreamProvider: instagramProvider,
            expectedIconTestId: "InstagramIcon",
            permitted: [
              {
                permitted:
                  "https://www.instagram.com/auser/live/17927797259956173?igsh=MXgyN29vY3N5YzV5dQ%3D%3D",
                expectedTag: "auser",
              },
            ],
          },
          {
            livestreamProvider: facebookProvider,
            expectedIconTestId: "FacebookIcon",
            permitted: [
              {
                permitted:
                  "https://www.facebook.com/username/videos/1554747258504979",
                expectedTag: "username",
                expectedPlayerProp:
                  "https://www.facebook.com/username/videos/1554747258504979",
              },
              {
                permitted:
                  "https://www.facebook.com/username/videos/1554747258504979/",
                expectedTag: "username",
                expectedPlayerProp:
                  "https://www.facebook.com/username/videos/1554747258504979/",
              },
            ],
          },
        ];

        describe.each(livestreamProviderPermittedTests)(
          "livestream provider - $livestreamProvider.serviceName",
          (permittedTests) => {
            const livestreamProvider = permittedTests.livestreamProvider;
            describe("updates database", () => {
              it.each(permittedTests.permitted)(
                "$permitted",
                async (permittedTest) => {
                  const dialog = await typePermittedAndAdd(
                    permittedTest.permitted,
                    0,
                    livestreamProvider,
                  );

                  fireEvent.click(getCommitButton(dialog));
                  const expectedLivestream: Livestream = {
                    url: permittedTest.permitted,
                    tag: permittedTest.expectedTag,
                    service: livestreamProvider.service,
                  };
                  if (permittedTest.expectedPlayerProp !== undefined) {
                    expectedLivestream.playerProp =
                      permittedTest.expectedPlayerProp;
                  }

                  expect(mockedUpdateLivestreams).toHaveBeenCalledWith<
                    Parameters<typeof updateLivestreams>
                  >(database, leagueMatchKey, {
                    "0": expectedLivestream,
                  });
                },
              );
            });

            describe("should show the correct icon and tag", () => {
              it.each(permittedTests.permitted)(
                "$permitted",
                async (permittedTest) => {
                  const dialog = await typePermittedAndAdd(
                    permittedTest.permitted,
                    0,
                    livestreamProvider,
                  );
                  expectDeleteButtons(getDeleteButtons(dialog), [
                    {
                      tag: permittedTest.expectedTag,
                      iconTestId: permittedTests.expectedIconTestId,
                    },
                  ]);
                },
              );
            });
          },
        );

        // initially selected
        describe("permitted / not permitted behaviour", () => {
          describe("not permitted", () => {
            async function typeNotPermittedYoutubeLivestream() {
              return typeLivestream("notpermitted");
            }
            it("should have livestream text field in error", async () => {
              const { livestreamTextField } =
                await typeNotPermittedYoutubeLivestream();

              expect(livestreamTextField).toBeInvalid();
            });

            it("should not be in error when clear the not permitted livestream", async () => {
              const { livestreamTextField, user } =
                await typeNotPermittedYoutubeLivestream();

              user.clear(livestreamTextField);

              expect(livestreamTextField).toBeValid();
            });

            it("should not update the tag", async () => {
              const { dialog } = await typeNotPermittedYoutubeLivestream();

              const tagTextField = getTagTextField(dialog);
              expect(tagTextField).toHaveValue("");
            });

            it("should have the add button disabled", async () => {
              const { dialog } = await typeNotPermittedYoutubeLivestream();
              expect(getAddLivestreamButton(dialog)).toBeDisabled();
            });
          });

          describe("permitted", () => {
            it("should be valid when permitted - %p", async () => {
              const { livestreamTextField } =
                await typeLivestream(aYoutubeLiveUrl);
              expect(livestreamTextField).toBeValid();
            });

            it("should update the tag when has not been manually input", async () => {
              const { dialog } = await typeLivestream(aYoutubeLiveUrl);

              const tagTextField = getTagTextField(dialog);
              expect(tagTextField).toHaveValue(videoId);
            });

            it("should not update the tag when has been manually input", async () => {
              const { dialog, tagTextField, user } = await typeTag("custom");

              await typeInLivestream(dialog, aYoutubeLiveUrl, user);

              expect(tagTextField).toHaveValue("custom");
            });

            it("should have enabled add button when permitted and non empty tag", async () => {
              const { dialog } = await typeLivestream(aYoutubeLiveUrl);

              expect(getAddLivestreamButton(dialog)).toBeEnabled();
            });

            it("should have disabled add button when permitted and empty tag", async () => {
              const { dialog, user } = await typeLivestream(aYoutubeLiveUrl);
              typeInTag(" ", dialog, user);

              expect(getAddLivestreamButton(dialog)).toBeDisabled();
            });

            it("should have disabled add button when permitted, non empty tag and empty livestream", async () => {
              const { dialog } = await typeTag("custom");
              expect(getAddLivestreamButton(dialog)).toBeDisabled();
            });

            it("should clear the livestream and tag when add button clicked", async () => {
              const { dialog, tagTextField, user } = await typeTag("custom");

              const livestreamTextField = await typeInLivestream(
                dialog,
                aYoutubeLiveUrl,
                user,
              );

              clickAddLivestream(dialog);

              expect(livestreamTextField).toHaveValue("");
              expect(tagTextField).toHaveValue("");
            });

            describe("update database", () => {
              interface UpdateDatabaseTest {
                description: string;
                optionNumber: number;
                expectedIdentifier?: Exclude<
                  Livestream["identifier"],
                  undefined
                >;
              }
              const updateDatabaseTests: UpdateDatabaseTest[] = [
                {
                  description: "Free",
                  optionNumber: 0,
                },
                {
                  description: "Main table",
                  optionNumber: 1,
                  expectedIdentifier: mainTable,
                },
                {
                  description: "Game 1",
                  optionNumber: 2,
                  expectedIdentifier: 0,
                },
                {
                  description: "Game 2",
                  optionNumber: 3,
                  expectedIdentifier: 1,
                },
              ];
              it.each(updateDatabaseTests)(
                "should update the database when confirmed - $description",
                async ({ optionNumber, expectedIdentifier }) => {
                  const dialog = await typePermittedAndAdd(
                    aYoutubeLiveUrl,
                    optionNumber,
                  );
                  fireEvent.click(getCommitButton(dialog));
                  const expectedLivestream: Livestream = {
                    url: aYoutubeLiveUrl,
                    tag: videoId,
                    service: LivestreamService.youtube,
                    playerProp: aYoutubeLiveUrl,
                  };
                  if (expectedIdentifier !== undefined) {
                    expectedLivestream.identifier = expectedIdentifier;
                  }

                  expect(mockedUpdateLivestreams).toHaveBeenCalledWith<
                    Parameters<typeof updateLivestreams>
                  >(database, leagueMatchKey, {
                    "0": expectedLivestream,
                  });
                },
              );
            });
          });
        });

        describe("deleting added livestream", () => {
          it("should have commit disabled if the only livestream", async () => {
            const dialog = await typePermittedAndAdd(aYoutubeLiveUrl);
            fireEvent.click(getDeleteButtons(dialog)[0]);

            expect(getCommitButton(dialog)).toBeDisabled();
          });
        });
      });

      describe("switching livestream provider", () => {
        it("should clear text fields when switching provider and not custom tag", async () => {
          const { dialog, livestreamTextField } =
            await typeLivestream(aYoutubeLiveUrl);

          clickLivestreamProviderButton(dialog, instagramProvider);

          expect(livestreamTextField).toHaveValue("");
          expect(getTagTextField(dialog)).toHaveValue("");
        });

        it("should only clear the livestream text field when switching provider and custom tag", async () => {
          const { dialog, tagTextField } = await typeTag("custom");

          clickLivestreamProviderButton(dialog, instagramProvider);

          expect(tagTextField).toHaveValue("custom");
          //changing provider changes the livestream label
          expect(getLivestreamTextField(dialog, instagramProvider)).toHaveValue(
            "",
          );
        });
      });
    });
  });
});
