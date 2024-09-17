import { useNavigate } from "react-router-dom";
import { FreeScoringTeamsLoaderData } from "./route";
import { useLoaderDataT } from "./hooks/useLoaderDataT";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useMemo } from "react";
import { CurrentColorBatButton } from "./CurrentColorBatButton";
import { Box } from "@mui/material";

export default function FreeScoringTeams() {
  const { teams } = useLoaderDataT<FreeScoringTeamsLoaderData>();
  const navigate = useNavigate();
  const teamsColumns: GridColDef[] = useMemo<GridColDef[]>(
    () => [
      {
        field: "actions",
        type: "actions",
        width: 80,
        getActions: (params) => [
          <CurrentColorBatButton
            key={1}
            enabled={true}
            clicked={() => {
              navigate(`../teammatches/${params.id}`);
            }}
          ></CurrentColorBatButton>,
        ],
      },
      {
        field: "player1Name",
        width: 150,
        headerName: "Player 1",
      },
      {
        width: 150,
        field: "player2Name",
        headerName: "Player 2",
      },
      {
        field: "handicap",
        width: 130,
        headerName: "Handicap",
      },
    ],
    [navigate],
  );
  const teamRows = teams.map((team) => {
    return {
      id: team.id,
      player1Name: team.player1Name,
      player2Name: team.player2Name,
      handicap: team.handicap,
    };
  });

  return (
    <DataGrid
      autoHeight
      rows={teamRows}
      columns={teamsColumns}
      slots={{
        noRowsOverlay: () => (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            No teams
          </Box>
        ),
      }}
    />
  );
}
