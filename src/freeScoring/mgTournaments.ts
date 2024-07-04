import store from "store2";
import { MatchOptions } from "../umpire";
import { createStoredMatch } from "./createStoredMatch";
import {
  getFreeScoringTeams,
  storeTransactPlayers,
  storeTransactTeams,
} from "./freeScoringStore";
import { FreeScoringPlayer, FreeScoringTeam } from "./types";

const players: FreeScoringPlayer[] = [
  {
    id: 1,
    handicap: 0,
    name: "Chris Herbert",
  },
  {
    id: 2,
    handicap: 0,
    name: "Clive",
  },
  {
    id: 3,
    handicap: 0,
    name: "Bolaji",
  },
  {
    id: 4,
    handicap: 0,
    name: "Simon",
  },
  {
    id: 5,
    handicap: 0,
    name: "Wilson",
  },
  {
    id: 6,
    handicap: 0,
    name: "Paul J",
  },
  {
    id: 7,
    handicap: 0,
    name: "Dave B",
  },
  {
    id: 8,
    handicap: 0,
    name: "Anis",
  },
  ///////////////////////////////////////////
  {
    id: 9,
    handicap: 0,
    name: "Bruce",
  },
  {
    id: 10,
    handicap: 0,
    name: "Roopesh",
  },
  {
    id: 11,
    handicap: 0,
    name: "Naeem",
  },
  {
    id: 12,
    handicap: 0,
    name: "Tony H",
  },
  {
    id: 13,
    handicap: 0,
    name: "Adam",
  },
  {
    id: 14,
    handicap: 0,
    name: "Keith",
  },
  {
    id: 15,
    handicap: 0,
    name: "Immad",
  },
  {
    id: 16,
    handicap: 0,
    name: "Jonathan",
  },
  {
    id: 17,
    handicap: 0,
    name: "Catalin",
  },
  {
    id: 18,
    handicap: 0,
    name: "Russ",
  },
  {
    id: 19,
    handicap: 0,
    name: "John H",
  },
  {
    id: 20,
    handicap: 0,
    name: "Rafal",
  },
];

const teams: FreeScoringTeam[] = [
  {
    id: 1,
    handicap: 0,
    player1Id: 1,
    player2Id: 2,
  },
  {
    id: 2,
    handicap: 0,
    player1Id: 3,
    player2Id: 4,
  },
  {
    id: 3,
    handicap: 0,
    player1Id: 5,
    player2Id: 6,
  },
  {
    id: 4,
    handicap: 0,
    player1Id: 7,
    player2Id: 8,
  },
  {
    id: 5,
    handicap: 0,
    player1Id: 9,
    player2Id: 10,
  },
  {
    id: 6,
    handicap: 0,
    player1Id: 11,
    player2Id: 12,
  },
  {
    id: 7,
    handicap: 0,
    player1Id: 13,
    player2Id: 14,
  },
  {
    id: 8,
    handicap: 0,
    player1Id: 15,
    player2Id: 16,
  },
  {
    id: 9,
    handicap: 17,
    player1Id: 17,
    player2Id: 11,
  },
  {
    id: 10,
    handicap: 16,
    player1Id: 6,
    player2Id: 18,
  },
  {
    id: 11,
    handicap: 15,
    player1Id: 7,
    player2Id: 19,
  },
  {
    id: 12,
    handicap: 16,
    player1Id: 16,
    player2Id: 20,
  },
];

interface DoublesMatch {
  team1Id: number;
  team2Id: number;
}
const handicapDoublesSemis: DoublesMatch[] = [
  {
    team1Id: 9,
    team2Id: 10,
  },
  {
    team1Id: 11,
    team2Id: 12,
  },
];

interface GroupMatch {
  entrant1Id: string;
  entrant2Id: string;
  umpire: string;
}
type GroupMatches = GroupMatch[];
interface GroupEntrant {
  id: string;
  entrantId: number;
}
type MatchRules = Omit<
  MatchOptions,
  "team1StartGameScore" | "team2StartGameScore"
>;
interface Group {
  isHandicap: boolean;
  isDoubles: boolean;
  entrants: GroupEntrant[];
  name: string;
  matches: GroupMatches;
  rules: MatchRules;
}

const abcdGroupMatches: GroupMatches = [
  {
    entrant1Id: "A",
    entrant2Id: "C",
    umpire: "B",
  },
  {
    entrant1Id: "B",
    entrant2Id: "D",
    umpire: "C",
  },
  {
    entrant1Id: "A",
    entrant2Id: "B",
    umpire: "D",
  },
  {
    entrant1Id: "C",
    entrant2Id: "D",
    umpire: "A",
  },
  {
    entrant1Id: "A",
    entrant2Id: "D",
    umpire: "B",
  },
  {
    entrant1Id: "B",
    entrant2Id: "C",
    umpire: "D",
  },
];

const hardbarDoublesRules: MatchRules = {
  upTo: 15,
  clearBy2: false,
  numServes: 2,
  bestOf: 3,
};

const hardbatDoublesGroup1: Group = {
  isDoubles: true,
  isHandicap: false,
  name: "Hardbat Doubles Group 1",
  matches: abcdGroupMatches,
  entrants: [
    {
      id: "A",
      entrantId: 1,
    },
    {
      id: "B",
      entrantId: 2,
    },
    {
      id: "C",
      entrantId: 3,
    },
    {
      id: "D",
      entrantId: 4,
    },
  ],
  rules: hardbarDoublesRules,
};

const hardbatDoublesGroup2: Group = {
  isDoubles: true,
  isHandicap: false,
  name: "Hardbat Doubles Group 2",
  matches: abcdGroupMatches,
  entrants: [
    {
      id: "A",
      entrantId: 5,
    },
    {
      id: "B",
      entrantId: 6,
    },
    {
      id: "C",
      entrantId: 7,
    },
    {
      id: "D",
      entrantId: 8,
    },
  ],
  rules: hardbarDoublesRules,
};

const hardbatDoublesGroups: Group[] = [
  hardbatDoublesGroup1,
  hardbatDoublesGroup2,
];

export function initializePlayersTeamsMatches() {
  const addedMGTournamentsKey = "addedMGTournaments";
  if (!store.has(addedMGTournamentsKey)) {
    initializePlayers();
    initializeTeams();
    initializeMatches();
    store.set(addedMGTournamentsKey, true);
  }
}

function initializePlayers() {
  storeTransactPlayers((existingPlayers) => {
    players.forEach((player) => {
      existingPlayers.push(player);
    });
    return existingPlayers;
  });
}
function initializeTeams() {
  storeTransactTeams((existingTeams) => {
    teams.forEach((team) => {
      existingTeams.push(team);
    });
    return existingTeams;
  });
}

function initializeMatches() {
  let matchId = 1;
  const teams = getFreeScoringTeams();
  hardbatDoublesGroups.forEach((group) => {
    group.matches.forEach((match) => {
      //match.umpire
      const entrant1 = group.entrants.find(
        (entrant) => entrant.id === match.entrant1Id,
      );
      const entrant2 = group.entrants.find(
        (entrant) => entrant.id === match.entrant2Id,
      );
      const team1 = teams.find((team) => team.id === entrant1.entrantId);
      const team2 = teams.find((team) => team.id === entrant2.entrantId);
      createStoredMatch(
        {
          ...group.rules,
          // if was handicap would have to do differently
          team1StartGameScore: 0,
          team2StartGameScore: 0,
          team1Player1Id: team1.player1Id,
          team1Player2Id: team1.player2Id,
          team2Player1Id: team2.player1Id,
          team2Player2Id: team2.player2Id,
          umpire: match.umpire,
          title: `${group.name} ${match.entrant1Id} vs ${match.entrant2Id}`,
        },
        matchId.toString(),
      );
      matchId++;
    });
  });
  handicapDoublesSemis.forEach((doublesMatch) => {
    const team1 = teams.find((team) => team.id === doublesMatch.team1Id);
    const team2 = teams.find((team) => team.id === doublesMatch.team2Id);
    createStoredMatch(
      {
        upTo: 31,
        clearBy2: false,
        numServes: 5,
        bestOf: 5,
        team1StartGameScore: team1.handicap,
        team2StartGameScore: team2.handicap,
        team1Player1Id: team1.player1Id,
        team1Player2Id: team1.player2Id,
        team2Player1Id: team2.player1Id,
        team2Player2Id: team2.player2Id,
        umpire: "TBC",
        title: `Handicap Doubles Semi Final`,
      },
      matchId.toString(),
    );
    matchId++;
  });
}
