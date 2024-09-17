import { SaveState } from "../umpire";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useCallback, useMemo, useState } from "react";
import { useLoaderDataT } from "./hooks/useLoaderDataT";
import { FreeScoringMatchStatesLoaderData } from "./route";
import { useDeleteJson } from "./hooks/usePostJson";
import DeleteIcon from "@mui/icons-material/Delete";
import { PlayerNames } from "../umpireView";
import { getTeamInitials } from "../umpireView/helpers";
import EditIcon from "@mui/icons-material/Edit";

export interface PlayerIds {
  team1Player1Id: number;
  team2Player1Id: number;
  team1Player2Id: number | undefined;
  team2Player2Id: number | undefined;
}
export interface PlayerNameAndIds extends PlayerNames, PlayerIds {}

export interface FreeScoringMatchSaveState extends SaveState, PlayerIds {
  id: string;
  lastUsed: number;
  umpire: string;
  title: string;
}
export interface FreeScoringMatchState
  extends FreeScoringMatchSaveState,
    PlayerNames {}

export default function FreeScoringMatches() {
  const { matchStates } = useLoaderDataT<FreeScoringMatchStatesLoaderData>();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();
  const deleteJSON = useDeleteJson();
  const navigateToMatch = useCallback(
    (id: string) => {
      navigate(`../match/${id}`);
    },
    [navigate],
  );
  const columns: GridColDef[] = useMemo<GridColDef[]>(
    () => [
      {
        field: "actions",
        type: "actions",
        width: 120,
        getActions: (params) => [
          <Button
            key={0}
            onClick={() => {
              // todo - remove the cast
              navigateToMatch(params.id as string);
            }}
          >
            Play
          </Button>,
          <IconButton
            key={1}
            onClick={() => {
              navigate(`../matches/edit/${params.id}`);
            }}
          >
            <EditIcon />
          </IconButton>,
        ],
      },
      { field: "title", headerName: "Title", width: 240 },
      /* { field: "players", headerName: "Players", width: 150 }, */
      { field: "umpire", headerName: "Umpire", width: 120 },
      { field: "score", headerName: "Score", width: 120 },
      { field: "team1Player1Name", headerName: "Team1 Player 1", width: 120 },
      { field: "team1Player2Name", headerName: "Team1 Player 2", width: 120 },
      { field: "team2Player1Name", headerName: "Team2 Player 1", width: 120 },
      { field: "team2Player2Name", headerName: "Team2 Player 2", width: 120 },
      /* 
        { field: "upTo", headerName: "Up to" },
        { field: "clearBy2", headerName: "Clear by 2" },
        { field: "numServes", headerName: "Num Serves" },
        { field: "bestOf", headerName: "Best of" },
        { field: "isHandicap", headerName: "Is Handicap" }, 
        { field: "team1StartScore", headerName: "Team1 Start score" }, 
        { field: "team2StartScore", headerName: "Team2 Start score" }
      */
    ],
    [navigateToMatch, navigate],
  );

  const rows = matchStates.map((matchState) => {
    const isHandicap =
      matchState.team1StartGameScore !== 0 ||
      matchState.team2StartGameScore !== 0;
    return {
      id: matchState.id,
      title: matchState.title,
      umpire: matchState.umpire,
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
      players: `${getTeamInitials(matchState.team1Player1Name, matchState.team1Player2Name)} vs ${getTeamInitials(matchState.team2Player1Name, matchState.team2Player2Name)}`,
    };
  });
  return (
    <>
      <Dialog open={showDeleteDialog}>
        <DialogTitle>Delete all matches?</DialogTitle>
        <DialogActions>
          <Button
            onClick={() => {
              deleteJSON(
                matchStates.map((matchState) => matchState.id),
                {
                  action: `../matches/delete`,
                },
              );
              setShowDeleteDialog(false);
            }}
          >
            Confirm
          </Button>
          <Button
            autoFocus
            onClick={() => {
              setShowDeleteDialog(false);
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Button
        disabled={matchStates.length === 0}
        startIcon={<DeleteIcon />}
        onClick={() => {
          setShowDeleteDialog(true);
        }}
      >
        Delete All Matches
      </Button>
      <DataGrid
        slots={{
          noRowsOverlay: () => (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              No matches
            </Box>
          ),
        }}
        autoHeight
        rows={rows}
        columns={columns}
      />
    </>
  );
}
