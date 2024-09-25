/**
 * @jest-environment jsdom
 */
import { CssBaseline } from "@mui/material";
import MaylandsThemeProvider from "../src/MaylandsTheming/MaylandsThemeProvider";
import {
  DatabaseProvider,
  getMaylandsCompRTB,
} from "../src/firebase/rtb/rtbProvider";
import {
  LeagueMatchSelection,
  LeagueMatchSelectionProps,
} from "../src/teamMatches/league/LeagueMatchSelection";
import { ref, set, update } from "firebase/database";
import {
  screen,
  render,
  waitFor,
  within,
  fireEvent,
} from "@testing-library/react";
import { getNewKey } from "../src/firebase/rtb/typeHelpers";
import { refTyped } from "../src/firebase/rtb/root";
import {
  clearOptions,
  openAutocompleteAndGetOptions,
  selectNthOption,
} from "../test-helpers/mui/autocomplete";
import {
  DbLeagueClub,
  DbLeagueMatch,
  DbLeagueTeam,
  DbRegisteredPlayer,
} from "../src/firebase/rtb/team";
import { DbPlayer } from "../src/firebase/rtb/players";
import {
  DBMatchSaveState,
  saveStateToDbMatchSaveState,
} from "../src/firebase/rtb/match/conversion";
import { DbMatch } from "../src/firebase/rtb/match/dbMatch";
import { Umpire } from "../src/umpire";
import { getSimpleToday } from "../src/helpers/getSimpleToday";
import { ClubSetup } from "../src/teamMatches/league/romfordLeagueData";
import {
  awayPlayerMatchDetails,
  homePlayerMatchDetails,
  singlesLeagueMatchPositionDisplays,
} from "../src/teamMatches/league/singlesLeagueMatchPlayers";
//import { getInitials } from "../src/umpireView/helpers";
import { findPlayerCombo, findScoresheet } from "./leagueMatchViewSelectors";
//import { getMatchPlayerPositions } from "../src/teamMatches/league/getMatchPlayerPositions";
import { fillArrayWithIndices } from "../src/helpers/fillArray";
import { getPlayerComboInputs } from "./leagueMatchViewSelectors";
import { findDoublesCombo } from "./leagueMatchViewSelectors";
import { openPlayerAutocompleteAndGetOptions } from "./leagueMatchViewSelectors";
import { MatchAndKey } from "../src/teamMatches/league/useLeagueMatchAndMatches";
import { createRootUpdater } from "../src/firebase/rtb/match/helpers";

// mocking due to import.meta.url
jest.mock(
  "../src/umpireView/dialogs/serverReceiver/Tosser/ClickKingTosser",
  () => {
    return {
      ClickKingTosser: () => <div data-testid="tosser"></div>,
    };
  },
);

jest.mock("../src/teamMatches/league/LeagueMatchScoreboard", () => {
  return {
    LeagueMatchScoreboard: () => (
      <div data-testid="leaguematchscoreboard"></div>
    ),
  };
});

const database = getMaylandsCompRTB();

beforeEach(async () => {
  await set(ref(database), null); // todo check the promise
});

//afterAll(async () => {}); // database coverage

function createApp(
  leagueMatchId: string,
  renderScoreboard: LeagueMatchSelectionProps["renderScoreboard"] = () => null,
) {
  return (
    <DatabaseProvider database={database}>
      <MaylandsThemeProvider>
        <CssBaseline enableColorScheme />
        <LeagueMatchSelection
          leagueMatchId={leagueMatchId}
          renderScoreboard={renderScoreboard}
        />
      </MaylandsThemeProvider>
    </DatabaseProvider>
  );
}

const leagueMatchesRef = refTyped(database, "leagueMatches");
const registeredPlayersRef = refTyped(database, "registeredPlayers");
const playersRef = refTyped(database, "players");
const teamsRef = refTyped(database, "teams");
const clubsRef = refTyped(database, "clubs");
const matchesRef = refTyped(database, "matches");

/* export const matchesPlayersPositions = getMatchPlayerPositions(
  homePlayerMatchDetails.map((p) => p.matchIndices),
  awayPlayerMatchDetails.map((p) => p.matchIndices),
); */

describe("<LeagueMatchView/>", () => {
  const defaultHomeTeamName = "Maylands A";
  const defaultAwayTeamName = "Lower ranked away";
  const lowerRankedHomeTeamName = "Maylands B";
  const defaultHomePlayerNames = ["DMAP3 E", "BMAP2 C", "AMAP1 B"];
  const defaultAwayPlayerNames = ["JOP3 K", "HOP2 I", "FOP1 G"];
  const lowerRankedDefaultHomePlayerNames = ["P Q", "R S", "T U"];
  const defaultOrderedHomeAvailablePlayerNames = defaultHomePlayerNames
    .sort()
    .concat(lowerRankedDefaultHomePlayerNames)
    .sort();
  const defaultOrderedAwayAvailablePlayerNames = defaultAwayPlayerNames.sort();

  const defaultTestClubSetups: ClubSetup[] = [
    {
      clubName: "Maylands",
      teamSetups: [
        {
          rank: 2,
          teamName: lowerRankedHomeTeamName,
          playerNames: lowerRankedDefaultHomePlayerNames,
        },
        {
          rank: 1,
          teamName: defaultHomeTeamName,
          playerNames: defaultHomePlayerNames,
        },
      ],
    },
    {
      clubName: "Other",
      teamSetups: [
        {
          rank: 1,
          teamName: "Higher ranked away",
          playerNames: ["HRA1", "HRA2", "HRA3"],
        },
        {
          rank: 2,
          teamName: defaultAwayTeamName,
          playerNames: defaultAwayPlayerNames,
        },
      ],
    },
  ];
  type getPlayerId = (teamName: string, playerName: string) => string;

  type SetupMatch = (
    getPlayerId: getPlayerId,
    dbMatch: DbMatch,
    index: number,
  ) => void;
  type SetupDoubles = (
    doublesMatch: DbMatch,
    homeTeamPlayerIds: TeamPlayerIds,
    awayTeamPlayerIds: TeamPlayerIds,
  ) => void;
  async function setupDatabase(
    setUpMatch: SetupMatch = () => {},
    testClubSetups = defaultTestClubSetups,
    homeTeamName = defaultHomeTeamName,
    awayTeamName = defaultAwayTeamName,
    isFriendly = false,
  ) {
    const updater = createRootUpdater();
    const updateClub = (leagueClub: DbLeagueClub) => {
      const newClubKey = getNewKey(clubsRef);
      updater.updateListItem("clubs", newClubKey, leagueClub);
      return newClubKey!;
    };

    const updateTeam = (leagueTeam: DbLeagueTeam) => {
      const newTeamKey = getNewKey(teamsRef);
      updater.updateListItem("teams", newTeamKey!, leagueTeam);
      return newTeamKey!;
    };

    const updatePlayer = (player: DbPlayer) => {
      const newPlayerKey = getNewKey(playersRef);
      updater.updateListItem("players", newPlayerKey!, player);
      return newPlayerKey!;
    };

    const updateRegisteredPlayer = (registeredPlayer: DbRegisteredPlayer) => {
      const newRegisteredPlayerKey = getNewKey(registeredPlayersRef);
      updater.updateListItem(
        "registeredPlayers",
        newRegisteredPlayerKey,
        registeredPlayer,
      );
      return newRegisteredPlayerKey;
    };

    const updateLeagueMatch = (leagueMatch: DbLeagueMatch) => {
      const newLeagueMatchKey = getNewKey(leagueMatchesRef);
      updater.updateListItem("leagueMatches", newLeagueMatchKey, leagueMatch);
      return newLeagueMatchKey;
    };

    const teamNameKeys = testClubSetups.flatMap((clubSetup) => {
      const clubKey = updateClub({ name: clubSetup.clubName });
      return clubSetup.teamSetups.map((teamSetup) => {
        const teamKey = updateTeam({
          rank: teamSetup.rank,
          name: teamSetup.teamName,
          clubId: clubKey,
        });
        const playerNameKeys = teamSetup.playerNames.map((playerName) => {
          const playerKey = updatePlayer({ name: playerName });
          updateRegisteredPlayer({
            clubId: clubKey,
            teamId: teamKey,
            playerId: playerKey,
            rank: teamSetup.rank,
          });
          return {
            name: playerName,
            key: playerKey,
          };
        });
        return {
          teamKey,
          name: teamSetup.teamName,
          playerNameKeys,
        };
      });
    });

    const getTeamKey = (teamName: string) => {
      const teamNameKey = teamNameKeys.find(
        (teamNameKey) => teamNameKey.name === teamName,
      );
      if (!teamNameKey) {
        throw new Error(`team not found - ${teamName}`);
      }
      return teamNameKey.teamKey;
    };
    const getPlayerId = (teamName: string, playerName: string) => {
      const teamNameKey = teamNameKeys.find(
        (teamNameKey) => teamNameKey.name === teamName,
      );
      if (!teamNameKey) {
        throw new Error(`team not found - ${teamName}`);
      }
      const playerNameKey = teamNameKey.playerNameKeys.find(
        (playerNameKey) => playerNameKey.name === playerName,
      );
      if (!playerNameKey) {
        throw new Error(`player not found - ${playerName}`);
      }
      return playerNameKey.key;
    };

    const leagueMatchKey = updateLeagueMatch({
      date: getSimpleToday(),
      isFriendly,
      homeTeamId: getTeamKey(homeTeamName),
      awayTeamId: getTeamKey(awayTeamName),
      description: "Test match",
    });
    const getDbMatchSaveState = (isDoubles: boolean) => {
      const umpire = new Umpire(
        {
          bestOf: 5,
          clearBy2: true,
          numServes: 2,
          team1StartGameScore: 0,
          team2StartGameScore: 0,
          upTo: 11,
        },
        isDoubles,
      );
      const umpireSaveState = umpire.getSaveState();
      return saveStateToDbMatchSaveState(umpireSaveState);
    };
    const singlesMatchSaveState = getDbMatchSaveState(false);
    const addMatch = (dbMatchSaveState: DBMatchSaveState, index: number) => {
      const matchKey = getNewKey(matchesRef);
      const newMatch: DbMatch = {
        scoreboardWithUmpire: true,
        ...dbMatchSaveState,
        containerId: leagueMatchKey,
      };
      setUpMatch(getPlayerId, newMatch, index);
      updater.updateListItem("matches", matchKey, newMatch);
    };
    for (let i = 0; i < 9; i++) {
      addMatch(singlesMatchSaveState, i);
    }
    const doublesMatchSaveState = getDbMatchSaveState(true);
    addMatch(doublesMatchSaveState, 9);

    await update(ref(database), updater.values);
    return leagueMatchKey;
  }

  type TeamPlayerIds = (string | undefined)[];
  function setUpMatchesForSelection(
    homePlayersSelected: boolean[],
    awayPlayersSelected: boolean[],
    setupDoubles: SetupDoubles = () => {},
  ) {
    return setupDatabase(
      getSetupMatches(homePlayersSelected, awayPlayersSelected, setupDoubles),
    );
  }

  function getSetupMatches(
    homePlayersSelected: boolean[],
    awayPlayersSelected: boolean[],
    setupDoubles: SetupDoubles = () => {},
  ) {
    const homeTeamPlayerIds: TeamPlayerIds = [undefined, undefined, undefined];
    const awayTeamPlayerIds: TeamPlayerIds = [undefined, undefined, undefined];
    const setupMatch: SetupMatch = (getPlayerId, dbMatch, index) => {
      if (index !== 9) {
        const { homePositionDisplay, awayPositionDisplay } =
          singlesLeagueMatchPositionDisplays[index];
        if (homePlayersSelected[homePositionDisplay.position]) {
          dbMatch.team1Player1Id = getPlayerId(
            defaultHomeTeamName,
            defaultHomePlayerNames[homePositionDisplay.position],
          ); // Player A
          homeTeamPlayerIds[homePositionDisplay.position] =
            dbMatch.team1Player1Id;
        }
        if (awayPlayersSelected[awayPositionDisplay.position]) {
          dbMatch.team2Player1Id = getPlayerId(
            defaultAwayTeamName,
            defaultAwayPlayerNames[awayPositionDisplay.position],
          ); // Player X
          awayTeamPlayerIds[awayPositionDisplay.position] =
            dbMatch.team2Player1Id;
        }
      } else {
        setupDoubles(dbMatch, homeTeamPlayerIds, awayTeamPlayerIds);
      }
    };
    return setupMatch;
  }

  describe("match selection", () => {
    describe("players selection", () => {
      it("renders section for selecting players, one for each team with 3 combos", async () => {
        const leagueMatchKey = await setupDatabase();
        render(createApp(leagueMatchKey));

        const { homePlayerInputs, awayPlayerInputs } =
          await getPlayerComboInputs();
        expect(homePlayerInputs).toHaveLength(3);
        expect(awayPlayerInputs).toHaveLength(3);
      });

      it("should have no selected players if no players have been selected for matches", async () => {
        const leagueMatchKey = await setupDatabase();
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

        const allPlayerSelected = [true, true, true];
        const leagueMatchKey = await setUpMatchesForSelection(
          allPlayerSelected,
          allPlayerSelected,
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
              const leagueMatchKey = await setupDatabase();
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
          const leagueMatchKey = await setUpMatchesForSelection(
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
            getSetupMatches([true, false, false], [false, false, false]),
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
            let getThePlayerId: getPlayerId;
            const leagueMatchKey = await setupDatabase((getPlayerId) => {
              getThePlayerId = getPlayerId;
            });
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
            const teamName = isHome ? defaultHomeTeamName : defaultAwayTeamName;
            const expectedPlayerId = getThePlayerId!(teamName, playerName);
            const matchPlayerDetails = isHome
              ? homePlayerMatchDetails
              : awayPlayerMatchDetails;
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
            const leagueMatchKey = await setUpMatchesForSelection(
              [true, true, true],
              [true, true, true],
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
                  singlesLeagueMatchPositionDisplays[index];
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
            const leagueMatchKey = await setUpMatchesForSelection(
              [true, true, true],
              [true, true, true],
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
                  singlesLeagueMatchPositionDisplays[index];
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
            const allPlayersSelected = [true, true, true];
            const leagueMatchKey = await setUpMatchesForSelection(
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
            selectedPlayers: [true, true, true],
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
            selectedPlayers: [true, true, true],
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
            const leagueMatchKey = await setUpMatchesForSelection(
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
            const leagueMatchKey = await setUpMatchesForSelection(
              [true, true, true],
              [true, true, true],
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
            const leagueMatchKey = await setUpMatchesForSelection(
              [true, true, true],
              [true, true, true],
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
      const leagueMatchKey = await setupDatabase();
      render(
        createApp(leagueMatchKey, () => (
          <div data-testid="testscoreboard"></div>
        )),
      );

      const scoresheet = await findScoresheet();
      within(scoresheet).getByTestId("testscoreboard");
    });

    /*   type ExpectedScoresheetPlayersIdentifier = {
    home: string;
    away: string;
  };

  const expectScoresheetPlayersIdentifiers = (
    scoresheet: HTMLElement,
    expectedScoresheetPlayersIdentifiers: ExpectedScoresheetPlayersIdentifier[],
  ) => {
    expectedScoresheetPlayersIdentifiers.forEach(
      (expectedScoresheetPlayersIdentifier, index) => {
        expect(getScoresheetPlayerIdentifier(scoresheet, true, index)).toBe(
          expectedScoresheetPlayersIdentifier.home,
        );
        expect(getScoresheetPlayerIdentifier(scoresheet, false, index)).toBe(
          expectedScoresheetPlayersIdentifier.away,
        );
      },
    );
  };

  it("should show player identifiers in the match scoresheet when no players selected", async () => {
    const leagueMatchKey = await setupDatabase();
    render(createApp(leagueMatchKey));

    const scoresheet = await findScoresheet();

    const expectedScoresheetPlayersIdentifiers: ExpectedScoresheetPlayersIdentifier[] =
      matchesPlayersIndices.map((matchPlayerIndices) => {
        const expectedScoresheetPlayersIdentifier: ExpectedScoresheetPlayersIdentifier =
          {
            home: homePlayerMatchDetails[matchPlayerIndices.home]
              .positionDisplay,
            away: awayPlayerMatchDetails[matchPlayerIndices.away]
              .positionDisplay,
          };
        return expectedScoresheetPlayersIdentifier;
      });
    expectedScoresheetPlayersIdentifiers.push({ home: "TBD", away: "TBD" });

    expectScoresheetPlayersIdentifiers(
      scoresheet,
      expectedScoresheetPlayersIdentifiers,
    );
  });

  it("should show player initials and selected doubles player identifiers in the match scoresheet when players selected", async () => {
    const expectedScoresheetPlayersIdentifiers: ExpectedScoresheetPlayersIdentifier[] =
      [];
    const initialsMap: Map<string, string> = new Map();
    const get2Initials = (name: string) => {
      const initials = getInitials(name);
      if (initials.length !== 2) {
        throw new Error(`Expected 2 initials for ${name}`);
      }
      initialsMap.set(name, initials);
      return initials;
    };
    const leagueMatchKey = await setupDatabase(
      (getPlayerId, dbMatch, index) => {
        if (index === 9) {
          dbMatch.team1Player1Id = getPlayerId(
            defaultHomeTeamName,
            defaultHomePlayerNames[0],
          );
          dbMatch.team1Player2Id = getPlayerId(
            defaultHomeTeamName,
            defaultHomePlayerNames[1],
          );
          dbMatch.team2Player1Id = getPlayerId(
            defaultAwayTeamName,
            defaultAwayPlayerNames[0],
          );
          dbMatch.team2Player2Id = getPlayerId(
            defaultAwayTeamName,
            defaultAwayPlayerNames[1],
          );
          return;
        }
        const playersIndex = matchesPlayersIndices[index];
        const homePlayerName = defaultHomePlayerNames[playersIndex.home];
        const homePlayerInitials = get2Initials(homePlayerName);
        const awayPlayerName = defaultAwayPlayerNames[playersIndex.away];
        const awayPlayerInitials = get2Initials(awayPlayerName);
        dbMatch.team1Player1Id = getPlayerId(
          defaultHomeTeamName,
          homePlayerName,
        );
        dbMatch.team2Player1Id = getPlayerId(
          defaultAwayTeamName,
          awayPlayerName,
        );
        expectedScoresheetPlayersIdentifiers.push({
          home: homePlayerInitials,
          away: awayPlayerInitials,
        });
      },
    );
    if (new Set(initialsMap.values()).size !== 6) {
      throw new Error("Initials should be distinct");
    }
    expectedScoresheetPlayersIdentifiers.push({
      home: "A B",
      away: "X Y",
    });
    render(createApp(leagueMatchKey));
    const scoresheet = await findScoresheet();

    expectScoresheetPlayersIdentifiers(
      scoresheet,
      expectedScoresheetPlayersIdentifiers,
    );
  }); */
  });
});
