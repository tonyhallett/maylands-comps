import { useState } from "react";
import { useLoaderDataT } from "./hooks/useLoaderDataT";
import MenuItem from "@mui/material/MenuItem/MenuItem";
import Button from "@mui/material/Button/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  CreateFreeScoringTeamOptions,
  FreeScoringPlayersAndTeamsLoaderData,
} from "./route";
import { FreeScoringPlayer, FreeScoringTeam } from "./types";
import { usePostJson } from "./hooks/usePostJson";
import { LabelledNumberInput } from "./LabelledNumberInput";
import { Box, IconButton, TextField } from "@mui/material";
import { MarginDivider } from "./MarginDivider";

function playersAlreadyInDoublesTeam(
  player1Id: number,
  player2Id: number,
  teams: FreeScoringTeam[],
): boolean {
  return teams.some((team) => {
    const player1InTeam =
      team.player1Id === player1Id || team.player2Id === player1Id;
    const player2InTeam =
      team.player1Id === player2Id || team.player2Id === player2Id;
    return player1InTeam && player2InTeam;
  });
}

export default function CreateFreeScoringDoubles() {
  const [handicap, setHandicap] = useState(0);

  const { players, teams } =
    useLoaderDataT<FreeScoringPlayersAndTeamsLoaderData>();
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | undefined>(
    players.length > 0 ? players[0].id : undefined,
  );
  const [selectedPlayers, setSelectedPlayers] = useState<FreeScoringPlayer[]>(
    [],
  );
  const postJson = usePostJson();
  const canAddPlayer =
    selectedPlayers.length === 0
      ? true
      : selectedPlayers.length === 1
        ? selectedPlayers[0].id !== selectedPlayerId &&
          !playersAlreadyInDoublesTeam(
            selectedPlayers[0].id,
            selectedPlayerId,
            teams,
          )
        : false;
  const canAddTeam = selectedPlayers.length === 2;
  return (
    <div>
      <Box mb={1}>
        <TextField
          fullWidth
          select
          label="Select player"
          onChange={(evt) => setSelectedPlayerId(Number(evt.target.value))}
          value={selectedPlayerId}
        >
          {players.map((player) => (
            <MenuItem key={player.id} value={player.id}>
              {player.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      <Button
        onClick={() => {
          const player = players.find((p) => p.id === selectedPlayerId);
          if (player) {
            setSelectedPlayers([...selectedPlayers, player]);
          }
        }}
        disabled={!canAddPlayer}
      >
        Add Player
      </Button>
      <Box mt={1} mb={1} minHeight={80}>
        {selectedPlayers.map((player) => (
          <div key={player.id}>
            <IconButton
              onClick={() => {
                setSelectedPlayers(
                  selectedPlayers.filter((p) => p.id !== player.id),
                );
              }}
            >
              <DeleteIcon />
            </IconButton>
            <span key={player.id}>{player.name}</span>
          </div>
        ))}
      </Box>
      <MarginDivider />
      <LabelledNumberInput
        label="Handicap"
        numberInputProps={{
          "aria-label": "Player handicap",
          placeholder: "Handicap",
          value: handicap,
          onChange: (event, val) => setHandicap(val),
        }}
      />
      <MarginDivider />
      <Button
        onClick={() => {
          const freeScoringTeam: CreateFreeScoringTeamOptions = {
            player1Id: selectedPlayers[0].id,
            player2Id: selectedPlayers[1].id,
            handicap,
          };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          postJson(freeScoringTeam as any);
        }}
        disabled={!canAddTeam}
      >
        Create team
      </Button>
    </div>
  );
}
