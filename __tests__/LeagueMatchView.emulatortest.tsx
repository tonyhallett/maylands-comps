/**
 * @jest-environment jsdom
 */
import { CssBaseline } from "@mui/material";
import MaylandsThemeProvider from "../src/MaylandsTheming/MaylandsThemeProvider";
import {
  DatabaseProvider,
  getMaylandsCompRTB,
} from "../src/firebase/rtb/rtbProvider";
import { LeagueMatchView } from "../src/teamMatches/league/LeagueMatchView";
import { ref, set, update } from "firebase/database";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import {
  createTypedValuesUpdater,
  getNewKey,
} from "../src/firebase/rtb/typeHelpers";
import { Root, refTyped } from "../src/firebase/rtb/root";
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
} from "../src/teamMatches/league/singlesLeagueMatchPlayers";
import { getInitials } from "../src/umpireView/helpers";
import {
  findPlayerCombo,
  findScoresheet,
  findTeamsMatchPlayersSelectSection,
  getPlayerCombo,
  getScoresheetPlayerIdentifier,
  teamMatchPlayersSelectSection,
} from "./leagueMatchViewSelectors";
import { getMatchPlayerIndices } from "../src/teamMatches/league/getMatchPlayerIndices";

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
//import userEvent from '@testing-library/user-event'
//import '@testing-library/jest-dom'

const database = getMaylandsCompRTB();

beforeEach(async () => {
  await set(ref(database), null); // todo check the promise
});

//afterAll(async () => {}); // database coverage

function createApp(leagueMatchId: string) {
  return (
    <DatabaseProvider database={database}>
      <MaylandsThemeProvider>
        <CssBaseline enableColorScheme />
        <LeagueMatchView leagueMatchId={leagueMatchId} />
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

export const matchesPlayersIndices = getMatchPlayerIndices(
  homePlayerMatchDetails.map((p) => p.matchIndices),
  awayPlayerMatchDetails.map((p) => p.matchIndices),
);

describe("<LeagueMatchView/> emulator", () => {
  const defaultHomeTeamName = "Maylands A";
  const defaultAwayTeamName = "Lower ranked away";
  const defaultHomePlayerNames = ["DMAP3 E", "BMAP2 C", "AMAP1 B"];
  const defaultAwayPlayerNames = ["JOP3 K", "HOP2 I", "FOP1 G"];
  const lowerRankedDefaultHomePlayerNames = ["P Q", "R S", "T U"];

  const defaultTestClubSetups: ClubSetup[] = [
    {
      clubName: "Maylands",
      teamSetups: [
        {
          rank: 2,
          teamName: "Maylands B",
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

  async function setupDatabase(
    setUpMatch: (
      getPlayerId: getPlayerId,
      dbMatch: DbMatch,
      index: number,
    ) => void = () => {},
    testClubSetups = defaultTestClubSetups,
    homeTeamName = defaultHomeTeamName,
    awayTeamName = defaultAwayTeamName,
  ) {
    const updater = createTypedValuesUpdater<Root>();
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
      isFriendly: false,
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

  it("renders without crashing", async () => {
    const leagueMatchKey = await setupDatabase();
    render(createApp(leagueMatchKey));
  });

  it("renders section for selecting players, one for each team", async () => {
    const leagueMatchKey = await setupDatabase();
    render(createApp(leagueMatchKey));

    const teamsMatchPlayersSelectSection =
      await findTeamsMatchPlayersSelectSection();

    teamMatchPlayersSelectSection()
      .within(teamsMatchPlayersSelectSection)
      .getBy(true);
    teamMatchPlayersSelectSection().getBy(false);
  });

  async function getComboInputs() {
    const teamsMatchPlayersSelectSection =
      await findTeamsMatchPlayersSelectSection();
    const findWith = teamMatchPlayersSelectSection().within(
      teamsMatchPlayersSelectSection,
    );
    const homeMatchPlayersSelectSection = findWith.getBy(true);
    const awayMatchPlayersSelectSection = findWith.getBy(false);
    const homePlayerInputs = within(
      homeMatchPlayersSelectSection,
    ).getAllByRole<HTMLInputElement>("combobox");
    const awayPlayerInputs = within(
      awayMatchPlayersSelectSection,
    ).getAllByRole<HTMLInputElement>("combobox");
    expect(homePlayerInputs).toHaveLength(3);
    expect(awayPlayerInputs).toHaveLength(3);

    return {
      homePlayerInputs,
      awayPlayerInputs,
    };
  }

  it("should have no selected players if no players have been selected for matches", async () => {
    const leagueMatchKey = await setupDatabase();
    render(createApp(leagueMatchKey));

    const { homePlayerInputs, awayPlayerInputs } = await getComboInputs();
    homePlayerInputs.forEach((homePlayerInput) => {
      expect(homePlayerInput.value).toBe("");
    });
    awayPlayerInputs.forEach((awayPlayerInput) => {
      expect(awayPlayerInput.value).toBe("");
    });
  });

  it("should have selected players if players have been selected for matches", async () => {
    // value if from getOptionLabel - name property of AvailablePlayer

    /*
      only the minimal number of matches are looked at to get this information
      0 - A V X
      1 - B V Y
      2 - C V Z
    */
    const leagueMatchKey = await setupDatabase(
      (getPlayerId, dbMatch, index) => {
        switch (index) {
          case 0:
            dbMatch.team1Player1Id = getPlayerId(
              defaultHomeTeamName,
              defaultHomePlayerNames[0],
            ); // Player A
            dbMatch.team2Player1Id = getPlayerId(
              defaultAwayTeamName,
              defaultAwayPlayerNames[0],
            ); // Player X
            break;
          case 1:
            dbMatch.team1Player1Id = getPlayerId(
              defaultHomeTeamName,
              defaultHomePlayerNames[1],
            ); // Player B
            dbMatch.team2Player1Id = getPlayerId(
              defaultAwayTeamName,
              defaultAwayPlayerNames[1],
            ); // Player Y
            break;
          case 2:
            dbMatch.team1Player1Id = getPlayerId(
              defaultHomeTeamName,
              defaultHomePlayerNames[2],
            ); // Player C
            dbMatch.team2Player1Id = getPlayerId(
              defaultAwayTeamName,
              defaultAwayPlayerNames[2],
            ); // Player Z
            break;
        }
      },
    );
    render(createApp(leagueMatchKey));
    const { homePlayerInputs, awayPlayerInputs } = await getComboInputs();
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

  // not sure if need to check that selecting a player results in the player being selected in the combo
  // have already shown that fills from matches - no if show elsewhere that match.player1Id changes....

  type ExpectedScoresheetPlayersIdentifier = {
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

  it("should show player identifers in the match scoresheet when no players selected", async () => {
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

  it("should show player identifiers in the match scoresheet when players selected", async () => {
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
  });

  interface SortedAvailabledPlayersTest {
    isHome: boolean;
    expectedPlayerNames: string[];
  }

  const sortedAvailabledPlayersTests: SortedAvailabledPlayersTest[] = [
    {
      isHome: true,
      expectedPlayerNames: defaultHomePlayerNames
        .sort()
        .concat(lowerRankedDefaultHomePlayerNames)
        .sort(),
    },
    {
      isHome: false,
      expectedPlayerNames: defaultAwayPlayerNames.sort(),
    },
  ];

  async function openAutocomplete(isHome: boolean, position: number) {
    const playerCombo = await findPlayerCombo(isHome, position);
    fireEvent.keyDown(playerCombo, { key: "ArrowDown" });
  }

  async function openAutocompleteAndGetOptions(
    isHome: boolean,
    position: number,
  ) {
    await openAutocomplete(isHome, position);
    const listbox = screen.getByRole("listbox");
    const htmlOptions = [...listbox.querySelectorAll("li")];
    return htmlOptions.map((htmlOption) => htmlOption.innerHTML);
  }

  it.each(sortedAvailabledPlayersTests)(
    "should have all available players for selection sorted by rank and name when no players selected",
    async ({ isHome, expectedPlayerNames }) => {
      const leagueMatchKey = await setupDatabase();
      render(createApp(leagueMatchKey));

      const optionDisplays = await openAutocompleteAndGetOptions(isHome, 0);

      expect(optionDisplays).toEqual(expectedPlayerNames);
    },
  );

  xit("should update all of the player matches when a player is selected", async () => {
    // should be able to as an each
    const leagueMatchKey = await setupDatabase();
    render(createApp(leagueMatchKey));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const scoresheet = await findScoresheet();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const playerXCombo = getPlayerCombo(true, 0);
  });

  // selecting a player results in the player being selected in all of the matches that they are in
  // deselecting a player results in the player being deselected in all of the matches that they are in
  // including doubles - which will remove from doubles selection

  // doubles available options
});
