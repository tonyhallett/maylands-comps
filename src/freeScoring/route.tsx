import { Link, Outlet, RouteObject, redirect } from "react-router-dom";
import FreeScoringMatches, {
  FreeScoringMatchState,
} from "./FreeScoringMatches";
import { FreeScoringMatch } from "./FreeScoringMatch";
import CreateFreeScoringPlayer from "./CreateFreeScoringPlayer";
import Box from "@mui/material/Box/Box";
import FreeScoringPlayers from "./FreeScoringPlayers";
import store from "store2";
import { FreeScoringPlayer } from "./FreeScoringPlayer";
import CreateMatch, { CreateMatchOptions } from "./CreateMatch";
import { FreeScoringTeam } from "./FreeScoringTeam";
import { Umpire } from "../umpire";
import CreateFreeScoringDoubles from "./CreateFreeScoringDoubles";

export interface FreeScoringPlayersLoaderData {
  players: FreeScoringPlayer[];
}
export interface FreeScoringTeamsLoaderData {
  teams: FreeScoringTeam[];
}
export interface FreeScoringPlayersAndTeamsLoaderData
  extends FreeScoringPlayersLoaderData,
    FreeScoringTeamsLoaderData {}

const getFreeScoringPlayers = () => {
  return store.get("freeScoringPlayers", []) as FreeScoringPlayer[];
};
const getFreeScoringTeams = () => {
  return store.get("freeScoringTeams", []) as FreeScoringTeam[];
};
const getFreeScoringPlayersAndTeams = () => {
  return {
    players: getFreeScoringPlayers(),
    teams: getFreeScoringTeams(),
  };
};

export type CreateFreeScoringTeamOptions = Omit<FreeScoringTeam, "id">;

const route: RouteObject = {
  path: "freescoring",
  element: <FreeScoringIndex />,
  children: [
    {
      path: "matches",
      element: <FreeScoringMatches />,
    },
    {
      path: "match/:matchId",
      element: <FreeScoringMatch />,
    },
    {
      path: "players",
      element: <FreeScoringPlayers />,
      loader: () => {
        // todo use the Response
        return getFreeScoringPlayersAndTeams();
      },
    },
    {
      path: "players/createdoubles",
      element: <CreateFreeScoringDoubles />,
      loader: () => {
        // todo use the Response
        return getFreeScoringPlayersAndTeams();
      },
      action: async ({ request }) => {
        const options: CreateFreeScoringTeamOptions = await request.json();
        store.transact(
          "freeScoringTeams",
          (teams: FreeScoringTeam[]) => {
            teams.push({
              ...options,
              id: new Date().getTime(),
            });
          },
          [],
        );
        return redirect("/freescoring/players");
      },
    },
    {
      path: "players/create",
      element: <CreateFreeScoringPlayer />,
      action: async ({ request }) => {
        const formData = await request.formData();
        const playerName = formData.get("name") as string;
        const handicap = formData.get("handicap");
        store.transact(
          "freeScoringPlayers",
          (players: FreeScoringPlayer[]) => {
            players.push({
              name: playerName,
              handicap: Number(handicap),
              id: new Date().getTime(),
            });
          },
          [],
        );
        return redirect("/freescoring/players");
      },
    },
    {
      path: "matches/create",
      element: <CreateMatch />,
      loader: () => {
        // todo use the Response
        return getFreeScoringPlayersAndTeams();
      },
      action: async ({ request }) => {
        const {
          team1Player1Id,
          team1Player1Name,
          team1Player2Id,
          team1Player2Name,
          team2Player2Id,
          team2Player1Id,
          team2Player2Name,
          team2Player1Name,
          ...matchOptions
        }: CreateMatchOptions = await request.json();
        const lastUsed = new Date().getTime();
        const id = lastUsed.toString();

        const umpire = new Umpire(matchOptions, team1Player2Id !== undefined);
        const saveState = umpire.getSaveState();
        const freeScoringMatchState: FreeScoringMatchState = {
          id,
          lastUsed,
          ...saveState,
          team1Player1Id,
          team1Player1Name,
          team1Player2Id,
          team1Player2Name,
          team2Player1Id,
          team2Player1Name,
          team2Player2Id,
          team2Player2Name,
        };

        store.transact(
          "freeScoringMatchStates",
          (freeScoringMatchStates) => {
            freeScoringMatchStates.push(freeScoringMatchState);
          },
          [],
        );
        return redirect(`/freescoring/match/${id}`);
      },
    },
  ],
};

function FreeScoringIndex() {
  return (
    <Box p={1}>
      <h1>Free Scoring</h1>
      <Box>
        <Link to="matches">Matches</Link>
      </Box>
      <Box>
        <Link to="matches/create">Create Match</Link>
      </Box>
      <Box>
        <Link to="players">Players</Link>
      </Box>
      <Box>
        <Link to="players/create">Create Player</Link>
      </Box>
      <Box>
        <Link to="players/createdoubles">Create Doubles</Link>
      </Box>
      <Outlet />
    </Box>
  );
}

export default route;
