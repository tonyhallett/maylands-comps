import {
  LoaderFunction,
  Outlet,
  RouteObject,
  redirect,
} from "react-router-dom";
import FreeScoringMatches, {
  FreeScoringMatchSaveState,
  FreeScoringMatchState,
} from "./FreeScoringMatches";
import { FreeScoringMatch } from "./FreeScoringMatch";
import CreateFreeScoringPlayer from "./CreateFreeScoringPlayer";
import Box from "@mui/material/Box/Box";
import FreeScoringPlayers from "./FreeScoringPlayers";

import CreateMatch, { CreateMatchOptionsRequest } from "./CreateMatch";
import { FreeScoringPlayer, FreeScoringTeam } from "./types";
import CreateFreeScoringDoubles from "./CreateFreeScoringDoubles";
import EditPlayer from "./EditPlayer";
import FreeScoringTeams from "./FreeScoringTeams";
import {
  getFreeScoringMatchSaveStates,
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
import { BatIcon } from "../commonIcons/BatIcon";
import MGLogo from "../MaylandsTheming/MGLogo";
import { CurrentColorBatIcon } from "./CurrentColorBatIcon";
import { PlayerNames } from "../umpireView/UmpireController";
import { createStoredMatch } from "./createStoredMatch";
import { initializePlayersTeamsMatches } from "./mgTournaments";

initializePlayersTeamsMatches();

interface FreeScoringTeamWithNames extends FreeScoringTeam {
  player1Name: string;
  player2Name: string;
}

export interface CreateMatchLoaderData {
  players: FreeScoringPlayer[];
  teams: FreeScoringTeamWithNames[];
}
export interface FreeScoringPlayersLoaderData {
  players: ReturnType<typeof getFreeScoringPlayers>;
}
export interface FreeScoringTeamsLoaderData {
  teams: FreeScoringTeamWithNames[];
}
export interface FreeScoringMatchStatesLoaderData {
  matchStates: FreeScoringMatchState[];
}
export interface FreeScoringPlayersAndTeamsLoaderData
  extends FreeScoringPlayersLoaderData,
    FreeScoringTeamsLoaderData {}

const getFreeScoringPlayersAndTeams =
  (): FreeScoringPlayersAndTeamsLoaderData => {
    const players = getFreeScoringPlayers();

    function getPlayerName(playerId: number): string {
      const player = players.find((p) => p.id === playerId);
      return player ? player.name : "";
    }
    const teams = getFreeScoringTeams().map((team) => {
      return {
        ...team,
        player1Name: getPlayerName(team.player1Id),
        player2Name: getPlayerName(team.player2Id),
      };
    });
    return {
      players,
      teams,
    };
  };

const getFreeScoringMatchStates = (): FreeScoringMatchState[] => {
  const players = getFreeScoringPlayers();
  const matchSaveStates = getFreeScoringMatchSaveStates();
  return matchSaveStates.map((matchState) => {
    const playerNames: PlayerNames = {
      team1Player1Name: players.find(
        (player) => player.id === matchState.team1Player1Id,
      )?.name,

      team1Player2Name:
        matchState.team1Player2Id === undefined
          ? undefined
          : players.find((player) => player.id === matchState.team1Player2Id)
              ?.name,
      team2Player1Name: players.find(
        (player) => player.id === matchState.team2Player1Id,
      )?.name,
      team2Player2Name:
        matchState.team2Player2Id === undefined
          ? undefined
          : players.find((player) => player.id === matchState.team2Player2Id)
              ?.name,
    };
    const freeScoringMatchState: FreeScoringMatchState = {
      ...matchState,
      ...playerNames,
    };
    return freeScoringMatchState;
  });
};

export type CreateFreeScoringTeamOptions = Omit<FreeScoringTeam, "id">;

function redirectIfNotANumber(
  param: string,
  loader: (num: number) => ReturnType<LoaderFunction>,
) {
  const num = Number(param);
  if (isNaN(num)) {
    return redirect("/freescoring/badrequest");
  }
  return loader(num);
}

function redirectTo404() {
  return redirect("/freescoring/notfound");
}

const route: RouteObject = {
  path: "freescoring",
  element: <FreeScoringIndex />,
  children: [
    {
      path: "badrequest",
      element: <Box>Bad request</Box>,
    },
    {
      path: "notfound",
      element: <Box>Not found</Box>,
    },
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
        return redirectIfNotANumber(params.playerId, (playerId) => {
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
        });
      },
      element: <FreeScoringMatches />,
    },
    {
      path: "teammatches/:teamId",
      loader: ({ params }) => {
        return redirectIfNotANumber(params.teamId, (teamId) => {
          const teams = getFreeScoringTeams();
          const team = teams.find((team) => team.id === teamId);
          const loaderData: FreeScoringMatchStatesLoaderData = {
            matchStates: [],
          };
          if (team) {
            const matchStates = getFreeScoringMatchStates();
            loaderData.matchStates = matchStates.filter((matchState) => {
              return (
                (matchState.team1Player1Id === team.player1Id &&
                  matchState.team1Player2Id === team.player2Id) ||
                (matchState.team2Player1Id === team.player1Id &&
                  matchState.team2Player2Id === team.player2Id)
              );
            });

            return loaderData;
          }
        });
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
        const matchState: FreeScoringMatchState = matchStates.find(
          (matchState) => matchState.id === params.matchId,
        );
        return matchState;
      },
      action: async ({ request }) => {
        const updatedMatchState: FreeScoringMatchSaveState =
          await request.json();

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
        return redirectIfNotANumber(params.playerId, (playerId) => {
          const players = getFreeScoringPlayers();
          const player = players.find((player) => player.id === playerId);
          if (player === undefined) {
            return redirectTo404();
          }
          return {
            player,
          };
        });
      },
      action: async ({ request }) => {
        const updatedPlayer: FreeScoringPlayer = await request.json();
        storeTransactPlayers((players) => {
          const player = players.find(
            (player) => player.id === updatedPlayer.id,
          );
          if (player) {
            player.name = updatedPlayer.name;
            player.handicap = updatedPlayer.handicap;
          }
        });

        return redirect("/freescoring/players");
      },
    },
    {
      path: "teams",
      element: <FreeScoringTeams />,
      loader: () => {
        const loaderData: FreeScoringTeamsLoaderData = {
          teams: getFreeScoringPlayersAndTeams().teams,
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
        function getPlayerName(playerId: number): string {
          const player = players.find((p) => p.id === playerId);
          return player ? player.name : "";
        }

        // todo use the Response
        const { players, teams } = getFreeScoringPlayersAndTeams();
        const loaderData: CreateMatchLoaderData = {
          players,
          teams: teams.map((team) => {
            return {
              ...team,
              player1Name: getPlayerName(team.player1Id),
              player2Name: getPlayerName(team.player2Id),
            };
          }),
        };
        return loaderData;
      },
      action: async ({ request }) => {
        const { play, ...createMatchOptions }: CreateMatchOptionsRequest =
          await request.json();
        const id = createStoredMatch(createMatchOptions);

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
                <BatIcon
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
              icon={<CurrentColorBatIcon />}
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
              <MGLogo showRibbonText={false} />
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
