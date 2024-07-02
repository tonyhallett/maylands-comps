import { useNavigate } from "react-router-dom";
import { CarbonBatButton } from "../demoUmpire/CarbonBatButton";
import { FreeScoringTeamsLoaderData } from "./route";
import { useLoaderDataT } from "./useLoaderDataT";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useMemo } from "react";
{
  /* <IconButton
            key={0}
            onClick={() => {
              navigate(`../players/edit/${params.id}`);
            }}
          >
            <EditIcon />
          </IconButton>, */
}
export default function FreeScoringTeams() {
  const { teams } = useLoaderDataT<FreeScoringTeamsLoaderData>();
  const navigate = useNavigate();
  const playersColumns: GridColDef[] = useMemo<GridColDef<unknown>[]>(
    () => [
      {
        field: "actions",
        type: "actions",
        width: 80,
        getActions: (params) => [
          <CarbonBatButton
            key={1}
            rubberFillColor="#808080"
            enabled={true}
            clicked={() => {
              navigate(`../teammatches/${params.id}`);
            }}
          ></CarbonBatButton>,
        ],
      },
      {
        field: "player1Name",
        headerName: "Player 1",
      },
      {
        field: "player2Name",
        headerName: "Player 2",
      },
      {
        field: "handicap",
        headerName: "Handicap",
      },
    ],
    [navigate],
  );
  const teamRows = teams.map((team) => {
    return {
      id: team.id,
      player1Name: team.player1.name,
      player2Name: team.player2.name,
      handicap: team.handicap,
    };
  });

  return (
    <>
      <DataGrid
        autosizeOnMount
        rows={teamRows}
        columns={playersColumns}
      ></DataGrid>
      <div>{`Num teams ${teams.length}`}</div>
    </>
  );
}
