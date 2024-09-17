import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { FreeScoringPlayersLoaderData } from "./route";
import { useLoaderDataT } from "./hooks/useLoaderDataT";
import { Box, IconButton } from "@mui/material";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import { CurrentColorBatButton } from "./CurrentColorBatButton";

export default function FreeScoringPlayers() {
  const { players } = useLoaderDataT<FreeScoringPlayersLoaderData>();
  const navigate = useNavigate();
  const playersColumns: GridColDef[] = useMemo<GridColDef[]>(
    () => [
      {
        field: "actions",
        type: "actions",
        width: 150,
        getActions: (params) => [
          <IconButton
            key={0}
            onClick={() => {
              navigate(`../players/edit/${params.id}`);
            }}
          >
            <EditIcon />
          </IconButton>,
          <CurrentColorBatButton
            key={1}
            enabled={true}
            clicked={() => {
              navigate(`../playermatches/${params.id}`);
            }}
          ></CurrentColorBatButton>,
        ],
      },
      {
        field: "name",
        width: 200,
        headerName: "Name",
      },
      {
        field: "handicap",
        width: 130,
        headerName: "Handicap",
      },
    ],
    [navigate],
  );
  const playerRows = players.map((player) => {
    return {
      id: player.id,
      name: player.name,
      handicap: player.handicap,
    };
  });

  return (
    <DataGrid
      autoHeight
      rows={playerRows}
      columns={playersColumns}
      slots={{
        noRowsOverlay: () => (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            No players
          </Box>
        ),
      }}
    />
  );
}
