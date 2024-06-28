import { PlayerNames } from "../demoUmpire"; // todo moveout
import { SaveState, Umpire } from "../umpire";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useFreeScoringLocalStorage } from "./useFreeScoringLocalStorage";
import { useMemo } from "react";

export interface FreeScoringMatchState extends SaveState, PlayerNames {
  id: string;
  lastUsed: Date;
}

// might put some of these in a single cell with popovers

export default function FreeScoring() {
  const navigate = useNavigate();
  // might use read only version
  // todo main storage
  const [freeScoringMatchStates, setFreeScoringMatchStates] =
    useFreeScoringLocalStorage([]);

  const columns: GridColDef[] = useMemo<GridColDef<unknown>[]>(
    () => [
      {
        field: "actions",
        type: "actions",
        width: 80,
        getActions: (params) => [
          <Button
            key={params.id}
            onClick={() => {
              navigate(`/freeScoring/${params.id}`);
            }}
          >
            Play
          </Button>,
        ],
      },
      { field: "upTo", headerName: "Up to" },
      { field: "clearBy2", headerName: "Clear by 2" },
      { field: "numServes", headerName: "Num Serves" },
      { field: "bestOf", headerName: "Best of" },
      { field: "score", headerName: "Score" },
      { field: "team1StartScore", headerName: "Team1 Start score" },
      { field: "team1Player1Name", headerName: "Team1 Player 1" },
      { field: "team1Player2Name", headerName: "Team1 Player 2" },

      { field: "team2StartScore", headerName: "Team2 Start score" },
      { field: "team2Player1Name", headerName: "Team2 Player 1" },
      { field: "team2Player2Name", headerName: "Team2 Player 2" },
    ],
    [navigate],
  );
  const rows = freeScoringMatchStates.map((matchState) => {
    return {
      id: matchState.id,
      upTo: matchState.upTo,
      clearBy2: matchState.clearBy2,
      numServes: matchState.numServes,
      bestOf: matchState.bestOf,
      score: `(${matchState.team1Score.games}) ${matchState.team1Score.points} - ${matchState.team2Score.points} (${matchState.team2Score.games})`,
      team1StartScore: matchState.team1StartGameScore,
      team1Player1Name: matchState.team1Player1Name,
      team1Player2Name: matchState.team1Player2Name,
      team2StartScore: matchState.team2StartGameScore,
      team2Player1Name: matchState.team2Player1Name,
      team2Player2Name: matchState.team2Player2Name,
    };
  });
  return (
    <>
      <Button
        onClick={() => {
          const lastUsed = new Date();
          const id = lastUsed.getTime().toString();
          const umpire = new Umpire(
            {
              upTo: 11,
              clearBy2: true,
              numServes: 2,
              bestOf: 3,
              team1StartGameScore: 0,
              team2StartGameScore: 0,
            },
            true,
          );
          const saveState = umpire.getSaveState();
          const freeScoringMatchState: FreeScoringMatchState = {
            id,
            lastUsed,
            ...saveState,
            team1Player1Name: "Player 1",
            team1Player2Name: "Player 2",
            team2Player1Name: "Player 3",
            team2Player2Name: "Player 4",
          };
          setFreeScoringMatchStates([
            ...freeScoringMatchStates,
            freeScoringMatchState,
          ]);
          navigate(`/freeScoring/${id}`);
        }}
      >
        New Match
      </Button>
      <Button
        onClick={() => {
          setFreeScoringMatchStates([]);
        }}
      >
        Clear Matches
      </Button>
      <DataGrid autosizeOnMount rows={rows} columns={columns}></DataGrid>
    </>
  );
}
