import { PlayerNames } from "../demoUmpire"; // todo moveout
import { SaveState } from "../umpire";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useFreeScoringLocalStorage } from "./useFreeScoringLocalStorage";
import { useCallback, useMemo } from "react";

export interface PlayerIds {
  team1Player1Id: number;
  team2Player1Id: number;
  team1Player2Id?: number;
  team2Player2Id?: number;
}
export interface PlayerNameAndIds extends PlayerNames, PlayerIds {}
export interface FreeScoringMatchState extends SaveState, PlayerNameAndIds {
  id: string;
  lastUsed: number;
}

export default function FreeScoringMatches() {
  const navigate = useNavigate();
  // might use read only version
  const [freeScoringMatchStates, setFreeScoringMatchStates] =
    useFreeScoringLocalStorage([]);

  const navigateToMatch = useCallback(
    (id: string) => {
      navigate(`../match/${id}`);
    },
    [navigate],
  );
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
              // todo - remove the cast
              navigateToMatch(params.id as string);
            }}
          >
            Play
          </Button>,
        ],
      },
      { field: "score", headerName: "Score" },
      { field: "upTo", headerName: "Up to" },
      { field: "clearBy2", headerName: "Clear by 2" },
      { field: "numServes", headerName: "Num Serves" },
      { field: "bestOf", headerName: "Best of" },
      { field: "isHandicap", headerName: "Is Handicap" },
      /* { field: "team1StartScore", headerName: "Team1 Start score" }, */
      { field: "team1Player1Name", headerName: "Team1 Player 1" },
      { field: "team1Player2Name", headerName: "Team1 Player 2" },

      /* { field: "team2StartScore", headerName: "Team2 Start score" }, */
      { field: "team2Player1Name", headerName: "Team2 Player 1" },
      { field: "team2Player2Name", headerName: "Team2 Player 2" },
    ],
    [navigateToMatch],
  );
  const rows = freeScoringMatchStates.map((matchState) => {
    const isHandicap =
      matchState.team1StartGameScore !== 0 ||
      matchState.team2StartGameScore !== 0;
    return {
      id: matchState.id,
      upTo: matchState.upTo,
      clearBy2: matchState.clearBy2,
      numServes: matchState.numServes,
      bestOf: matchState.bestOf,
      isHandicap,
      score: `(${matchState.team1Score.games}) ${matchState.team1Score.points} - ${matchState.team2Score.points} (${matchState.team2Score.games})`,
      /* team1StartScore: matchState.team1StartGameScore, */
      team1Player1Name: matchState.team1Player1Name,
      team1Player2Name: matchState.team1Player2Name,
      /* team2StartScore: matchState.team2StartGameScore, */
      team2Player1Name: matchState.team2Player1Name,
      team2Player2Name: matchState.team2Player2Name,
    };
  });
  return (
    <>
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
