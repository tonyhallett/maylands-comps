import { useNavigate } from "react-router-dom";
import { FreeScoringTeamsLoaderData } from "./route";
import { useLoaderDataT } from "./hooks/useLoaderDataT";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useMemo } from "react";
import { CurrentColorBatButton } from "./CurrentColorBatButton";

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
      player1Name: team.player1Name,
      player2Name: team.player2Name,
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
