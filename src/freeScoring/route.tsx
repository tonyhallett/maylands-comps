import { Outlet, RouteObject, redirect } from "react-router-dom";
import FreeScoringMatches, {
  FreeScoringMatchState,
} from "./FreeScoringMatches";
import { FreeScoringMatch } from "./FreeScoringMatch";
import CreateFreeScoringPlayer from "./CreateFreeScoringPlayer";
import Box from "@mui/material/Box/Box";
import FreeScoringPlayers from "./FreeScoringPlayers";

import CreateMatch, { CreateMatchOptions } from "./CreateMatch";
import { FreeScoringPlayer, FreeScoringTeam } from "./types";
import { Umpire } from "../umpire";
import CreateFreeScoringDoubles from "./CreateFreeScoringDoubles";
import EditPlayer from "./EditPlayer";
import FreeScoringTeams from "./FreeScoringTeams";
import {
  getFreeScoringMatchStates,
  getFreeScoringPlayers,
  getFreeScoringTeams,
  storeTransactMatchStates,
  storeTransactPlayers,
  storeTransactTeams,
} from "./freeScoringStore";
import GroupIcon from "@mui/icons-material/Group";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import PersonIcon from "@mui/icons-material/Person";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DynamicLinkIcon from "./DynamicLinkIcon";
import { AppBar, Stack, Toolbar } from "@mui/material";
import { BatSVG } from "../demoUmpire/BatButton";
import MGLogo from "../MGLogo2";

export interface FreeScoringPlayersLoaderData {
  players: ReturnType<typeof getFreeScoringPlayers>;
}
export interface FreeScoringTeamsLoaderData {
  teams: ReturnType<typeof getFreeScoringTeams>;
}
export interface FreeScoringMatchStatesLoaderData {
  matchStates: ReturnType<typeof getFreeScoringMatchStates>;
}
export interface FreeScoringPlayersAndTeamsLoaderData
  extends FreeScoringPlayersLoaderData,
    FreeScoringTeamsLoaderData {}

const getFreeScoringPlayersAndTeams =
  (): FreeScoringPlayersAndTeamsLoaderData => {
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
      loader: () => {
        const loaderData: FreeScoringMatchStatesLoaderData = {
          matchStates: getFreeScoringMatchStates(),
        };

        return loaderData;
      },
      element: <FreeScoringMatches />,
    },
    {
      path: "playermatches/:playerId",
      loader: ({ params }) => {
        const playerId = Number(params.playerId);
        const matchStates = getFreeScoringMatchStates();
        const playerMatches = matchStates.filter(
          (matchState) =>
            matchState.team1Player1Id === playerId ||
            matchState.team1Player2Id === playerId ||
            matchState.team2Player1Id === playerId ||
            matchState.team2Player2Id === playerId,
        );
        const loaderData: FreeScoringMatchStatesLoaderData = {
          matchStates: playerMatches,
        };
        return loaderData;
      },
      element: <FreeScoringMatches />,
    },
    {
      path: "teammatches/:teamId",
      loader: ({ params }) => {
        const teams = getFreeScoringTeams();
        const teamId = Number(params.teamId);
        const team = teams.find((team) => team.id === teamId);
        const loaderData: FreeScoringMatchStatesLoaderData = {
          matchStates: [],
        };
        if (team) {
          const matchStates = getFreeScoringMatchStates();
          loaderData.matchStates = matchStates.filter((matchState) => {
            return (
              (matchState.team1Player1Id === team.player1.id &&
                matchState.team1Player2Id === team.player2.id) ||
              (matchState.team2Player1Id === team.player1.id &&
                matchState.team2Player2Id === team.player2.id)
            );
          });

          return loaderData;
        }
      },
      element: <FreeScoringMatches />,
    },
    {
      path: "matches/delete",
      action: async ({ request }) => {
        const matchIdsToDelete: string[] = await request.json();
        storeTransactMatchStates((matchStates) => {
          return matchStates.filter(
            (matchState) => !matchIdsToDelete.includes(matchState.id),
          );
        });
        return redirect("/freescoring/matches");
      },
    },
    {
      path: "match/:matchId",
      element: <FreeScoringMatch />,
      loader: ({ params }) => {
        const matchStates = getFreeScoringMatchStates();
        const matchState = matchStates.find(
          (matchState) => matchState.id === params.matchId,
        );
        return matchState;
      },
      action: async ({ request }) => {
        const updatedMatchState: FreeScoringMatchState = await request.json();

        storeTransactMatchStates((matchStates) => {
          const index = matchStates.findIndex(
            (matchState) => matchState.id === updatedMatchState.id,
          );
          if (index === -1) {
            throw new Error(
              `Match state with id ${updatedMatchState.id} not found`,
            );
          }
          matchStates[index] = updatedMatchState;
        });

        return {
          matchState: updatedMatchState,
        };
      },
    },
    {
      path: "players",
      element: <FreeScoringPlayers />,
      loader: () => {
        const loaderData: FreeScoringPlayersLoaderData = {
          players: getFreeScoringPlayers(),
        };
        return loaderData;
      },
    },
    {
      path: "players/edit/:playerId",
      element: <EditPlayer />,
      loader: ({ params }) => {
        const players = getFreeScoringPlayers();
        const player = players.find(
          (player) => player.id === Number(params.playerId),
        );
        return {
          player,
        };
      },
      action: async ({ request }) => {
        const updatedPlayer: FreeScoringPlayer = await request.json();
        let playerNameChanged = false;
        storeTransactPlayers((players) => {
          const player = players.find(
            (player) => player.id === updatedPlayer.id,
          );
          if (player) {
            playerNameChanged = player.name !== updatedPlayer.name;
            player.name = updatedPlayer.name;
            player.handicap = updatedPlayer.handicap;
          }
        });
        if (playerNameChanged) {
          storeTransactTeams((teams) => {
            teams.forEach((team) => {
              if (team.player1.id === updatedPlayer.id) {
                team.player1.name = updatedPlayer.name;
              }
              if (team.player2.id === updatedPlayer.id) {
                team.player2.name = updatedPlayer.name;
              }
            });
          });
          storeTransactMatchStates((matchStates) => {
            matchStates.forEach((match) => {
              if (match.team1Player1Id === updatedPlayer.id) {
                match.team1Player1Name = updatedPlayer.name;
              }
              if (match.team1Player2Id === updatedPlayer.id) {
                match.team1Player2Name = updatedPlayer.name;
              }
              if (match.team2Player1Id === updatedPlayer.id) {
                match.team2Player1Name = updatedPlayer.name;
              }
              if (match.team2Player2Id === updatedPlayer.id) {
                match.team2Player2Name = updatedPlayer.name;
              }
            });
          });
        }
        return redirect("/freescoring/players");
      },
    },
    {
      path: "teams",
      element: <FreeScoringTeams />,
      loader: () => {
        const loaderData: FreeScoringTeamsLoaderData = {
          teams: getFreeScoringTeams(),
        };
        return loaderData;
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
        storeTransactTeams((teams) => {
          teams.push({
            ...options,
            id: new Date().getTime(),
          });
        });
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
        storeTransactPlayers((players) => {
          players.push({
            name: playerName,
            handicap: Number(handicap),
            id: new Date().getTime(),
          });
        });
        return redirect("/freescoring/players");
      },
      loader: () => {
        const loaderData: FreeScoringPlayersLoaderData = {
          players: getFreeScoringPlayers(),
        };
        return loaderData;
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
          play,
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

        storeTransactMatchStates((freeScoringMatchStates) => {
          freeScoringMatchStates.push(freeScoringMatchState);
        });

        return redirect(
          play ? `/freescoring/match/${id}` : "/freescoring/matches",
        );
      },
    },
  ],
};

function FreeScoringIndex() {
  const activeColor = "yellow";
  return (
    <Box p={1}>
      <AppBar position="static">
        <Toolbar>
          <Stack direction="row" spacing={1}>
            <DynamicLinkIcon
              activeColor={activeColor}
              inactiveColor="white"
              to="matches"
              end
              icon={
                <BatSVG
                  showBall={false}
                  bladeFillColor1="currentColor"
                  bladeFillColor2="currentColor"
                  rubberFillColor="currentColor"
                />
              }
            />

            <DynamicLinkIcon
              activeColor={activeColor}
              inactiveColor="white"
              to="matches/create"
              end
              icon={
                <BatSVG
                  showBall={false}
                  bladeFillColor1="currentColor"
                  bladeFillColor2="currentColor"
                  rubberFillColor="currentColor"
                />
              }
            />

            <DynamicLinkIcon
              activeColor={activeColor}
              inactiveColor="white"
              to="players"
              end
              icon={<PersonIcon />}
            />

            <DynamicLinkIcon
              activeColor={activeColor}
              inactiveColor="white"
              to="players/create"
              end
              icon={<PersonAddIcon />}
            />

            <DynamicLinkIcon
              activeColor={activeColor}
              inactiveColor="white"
              to="teams"
              end
              icon={<GroupIcon />}
            />
            <DynamicLinkIcon
              activeColor={activeColor}
              inactiveColor="white"
              to="players/createdoubles"
              end
              icon={<GroupAddIcon />}
            />
          </Stack>
          <Box display={"flex"} flex={1} justifyContent="flex-end">
            <Box
              width={64}
              borderRadius={1}
              flexGrow={0}
              p={1}
              bgcolor={"white"}
            >
              <MGLogo />
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Box mb={1}>
        <Outlet />
      </Box>
    </Box>
  );
}

export default route;
