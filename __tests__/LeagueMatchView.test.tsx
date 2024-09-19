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
import { render, screen } from "@testing-library/react";
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
import { createWriteStream } from "node:fs";
import http from "node:http";
import { teamsMatchPlayersSelectSectionLabel } from "../src/teamMatches/teamMatchPlayerSelect";

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

// #region database coverage
function parseHostAndPort(hostAndPort: string): {
  host: string;
  port: number;
} {
  const pieces = hostAndPort.split(":");
  return {
    host: pieces[0],
    port: parseInt(pieces[1], 10),
  };
}

function getDatabaseCoverageMeta(databaseName: string) {
  /**
   * The FIREBASE_DATABASE_EMULATOR_HOST environment variable is set automatically
   * by "firebase emulators:exec"
   */
  const hostAndPort = parseHostAndPort(
    process.env.FIREBASE_DATABASE_EMULATOR_HOST!,
  );
  const { host, port } = hostAndPort;
  const coverageUrl = `http://${host}:${port}/.inspect/coverage?ns=${databaseName}`;
  return {
    host,
    port,
    coverageUrl,
  };
}

//todo
const DATABASE_NAME = "todo";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function writeDatabaseCoverage() {
  const { coverageUrl } = getDatabaseCoverageMeta(DATABASE_NAME);
  // todo use the current file name
  const coverageFile = "database-coverage.html";
  const fstream = createWriteStream(coverageFile);
  await new Promise((resolve, reject) => {
    http.get(coverageUrl, (res) => {
      res.pipe(fstream, { end: true });
      res.on("end", resolve);
      res.on("error", reject);
    });
  });

  console.log(`View database rule coverage information at ${coverageFile}\n`);
}
//#endregion

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

const findTeamsMatchPlayersSelectSection = () =>
  screen.findByRole("region", {
    name: teamsMatchPlayersSelectSectionLabel,
  });
// this also works
//screen.findByLabelText(teamsMatchPlayersSelectSectionLabel);

describe("<LeagueMatchView/> emulator", () => {
  const defaultHomeTeamName = "Maylands A";
  const defaultAwayTeamName = "Other A";
  const defaultTestClubSetups: ClubSetup[] = [
    {
      clubName: "Maylands",
      teamSetups: [
        {
          rank: 1,
          teamName: defaultHomeTeamName,
          playerNames: ["MAP1", "MAP2", "MAP3"],
        },
        {
          rank: 2,
          teamName: "Maylands B",
          playerNames: ["MBP1", "MBP2", "MBP3"],
        },
      ],
    },
    {
      clubName: "Other",
      teamSetups: [
        {
          rank: 1,
          teamName: defaultAwayTeamName,
          playerNames: ["OP1", "OP2", "OP3"],
        },
      ],
    },
  ];
  async function setupDatabase(
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
        teamSetup.playerNames.forEach((player) => {
          const playerKey = updatePlayer({ name: player });
          updateRegisteredPlayer({
            clubId: clubKey,
            teamId: teamKey,
            playerId: playerKey,
            rank: teamSetup.rank,
          });
        });
        return {
          teamKey,
          name: teamSetup.teamName,
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
    const addMatch = (dbMatchSaveState: DBMatchSaveState) => {
      const matchKey = getNewKey(matchesRef);
      const newMatch: DbMatch = {
        scoreboardWithUmpire: true,
        ...dbMatchSaveState,
        containerId: leagueMatchKey,
      };
      updater.updateListItem("matches", matchKey, newMatch);
    };
    for (let i = 0; i < 9; i++) {
      addMatch(singlesMatchSaveState);
    }
    const doublesMatchSaveState = getDbMatchSaveState(true);
    addMatch(doublesMatchSaveState);

    await update(ref(database), updater.values);
    return leagueMatchKey;
  }
  it("renders without crashing", async () => {
    const leagueMatchKey = await setupDatabase();
    render(createApp(leagueMatchKey));
  });
  it("renders section for selecting players", async () => {
    const leagueMatchKey = await setupDatabase();
    render(createApp(leagueMatchKey));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const teamsMatchPlayersSelectSection =
      await findTeamsMatchPlayersSelectSection();

    // section for home and away
  });
});
