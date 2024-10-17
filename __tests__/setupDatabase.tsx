import { Database } from "firebase/database";
import {
  DBMatchSaveState,
  saveStateToDbMatchSaveState,
} from "../src/firebase/rtb/match/conversion";
import { DbMatch } from "../src/firebase/rtb/match/dbMatch";
import { Root } from "../src/firebase/rtb/root";
import { getDbToday } from "../src/helpers/getDbDate";
import { ClubSetup } from "../src/teamMatches/league/db-population/data/romfordLeagueData";
import { Umpire } from "../src/umpire";
import { leagueMatchPlayersPositionDisplays } from "../src/teamMatches/league/play/format/singlesLeagueMatchPlayers";
import { setRoot } from "./setRoot";
import { Livestreams } from "../src/firebase/rtb/team";

export const defaultHomeTeamName = "Maylands A";
export const defaultAwayTeamName = "Lower ranked away";
export const lowerRankedHomeTeamName = "Maylands B";
export const defaultHomePlayerNames = ["DMAP3 E", "BMAP2 C", "AMAP1 B"];
export const defaultAwayPlayerNames = ["JOP3 K", "HOP2 I", "FOP1 G"];
export const lowerRankedDefaultHomePlayerNames = ["P Q", "R S", "T U"];

export const defaultTestClubSetups: ClubSetup[] = [
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

export type SetupMatch = (dbMatch: DbMatch, index: number) => void;

export async function setupDatabase(
  database: Database,
  setUpMatch: SetupMatch = () => {},
  testClubSetups = defaultTestClubSetups,
  homeTeamName = defaultHomeTeamName,
  awayTeamName = defaultAwayTeamName,
  isFriendly = false,
  livestreams: Livestreams | undefined = undefined,
) {
  const root: Root = {
    clubs: {},
    teams: {},
    players: {},
    registeredPlayers: {},
    leagueMatches: {},
    matches: {},
  };

  testClubSetups.forEach((clubSetup) => {
    root.clubs[clubSetup.clubName] = { name: clubSetup.clubName };

    clubSetup.teamSetups.forEach((teamSetup) => {
      root.teams[teamSetup.teamName] = {
        rank: teamSetup.rank,
        name: teamSetup.teamName,
        clubId: clubSetup.clubName,
      };

      teamSetup.playerNames.forEach((playerName) => {
        root.players[playerName] = { name: playerName };
        root.registeredPlayers[playerName] = {
          clubId: clubSetup.clubName,
          teamId: teamSetup.teamName,
          rank: teamSetup.rank,
          playerId: playerName,
        };
      });
    });
  });

  const leagueMatchKey = "league match";
  root.leagueMatches[leagueMatchKey] = {
    date: getDbToday(),
    isFriendly,
    homeTeamId: homeTeamName,
    awayTeamId: awayTeamName,
    description: "Test match",
  };
  if (livestreams) {
    root.leagueMatches[leagueMatchKey].livestreams = livestreams;
  }

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

  const addMatch = (dbMatchSaveState: DBMatchSaveState, index: number) => {
    const newMatch: DbMatch = {
      scoreboardWithUmpire: true,
      ...dbMatchSaveState,
      containerId: leagueMatchKey,
    };
    setUpMatch(newMatch, index);
    root.matches[index.toString()] = newMatch;
  };

  for (let i = 0; i < 9; i++) {
    addMatch(getDbMatchSaveState(false), i);
  }
  const doublesMatchSaveState = getDbMatchSaveState(true);
  addMatch(doublesMatchSaveState, 9);

  await setRoot(database, root);
  return leagueMatchKey;
}

export type TeamPlayerIds = (string | undefined)[];
export type SetupDoubles = (
  doublesMatch: DbMatch,
  homeTeamPlayerIds: TeamPlayerIds,
  awayTeamPlayerIds: TeamPlayerIds,
) => void;

export const allPlayersSelected: SelectedPlayers = [true, true, true];
export const noPlayersSelected: SelectedPlayers = [false, false, false];
export type SelectedPlayers = [boolean, boolean, boolean];
// and passes the player ids to the setupDoubles function
export function getMatchSetupThatSetsDefaultPlayersThatAreSelected(
  homePlayersSelected: SelectedPlayers, // each index is a player position - A, B, C
  awayPlayersSelected: SelectedPlayers, // each index is a player position - X, Y, Z
  setupDoubles: SetupDoubles = () => {},
  afterSetupMatch: SetupMatch = () => {},
) {
  // if selected collect the player ids for setupDoubles
  const homeTeamPlayerIds: TeamPlayerIds = [undefined, undefined, undefined];
  const awayTeamPlayerIds: TeamPlayerIds = [undefined, undefined, undefined];
  const setupMatch: SetupMatch = (dbMatch, index) => {
    if (index !== 9) {
      const { homePositionDisplay, awayPositionDisplay } =
        leagueMatchPlayersPositionDisplays[index];
      // the position corresponds to the combobox
      // if selected set the player id to that of the default at that position
      if (homePlayersSelected[homePositionDisplay.position]) {
        dbMatch.team1Player1Id =
          defaultHomePlayerNames[homePositionDisplay.position];
        homeTeamPlayerIds[homePositionDisplay.position] =
          dbMatch.team1Player1Id;
      }
      if (awayPlayersSelected[awayPositionDisplay.position]) {
        dbMatch.team2Player1Id =
          defaultAwayPlayerNames[awayPositionDisplay.position];
        awayTeamPlayerIds[awayPositionDisplay.position] =
          dbMatch.team2Player1Id;
      }
    } else {
      setupDoubles(dbMatch, homeTeamPlayerIds, awayTeamPlayerIds);
    }
    afterSetupMatch(dbMatch, index);
  };
  return setupMatch;
}

// shortcut
export function setUpDatabaseWithDefaultPlayersThatAreSelected(
  database: Database,
  homePlayersSelected: SelectedPlayers,
  awayPlayersSelected: SelectedPlayers,
  setupDoubles: SetupDoubles = () => {},
) {
  return setupDatabase(
    database,
    getMatchSetupThatSetsDefaultPlayersThatAreSelected(
      homePlayersSelected,
      awayPlayersSelected,
      setupDoubles,
    ),
  );
}
