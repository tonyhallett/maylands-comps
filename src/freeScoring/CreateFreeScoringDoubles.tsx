import FormControl from "@mui/material/FormControl/FormControl";
import InputLabel from "@mui/material/InputLabel/InputLabel";
import Select from "@mui/material/Select/Select";
import { useState } from "react";
import { useSubmit } from "react-router-dom";
import { useLoaderDataT } from "./useLoaderDataT";
import { FreeScoringPlayer } from "./FreeScoringPlayer";
import MenuItem from "@mui/material/MenuItem/MenuItem";
import Button from "@mui/material/Button/Button";
import NumberInput from "../NumberInput";
import { CreateFreeScoringTeamOptions } from "./route";

export default function CreateFreeScoringDoubles() {
  const [handicap, setHandicap] = useState(0);

  const { players } = useLoaderDataT<{
    players: FreeScoringPlayer[];
  }>();
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | undefined>(
    players.length > 0 ? players[0].id : undefined,
  );
  const [selectedPlayers, setSelectedPlayers] = useState<FreeScoringPlayer[]>(
    [],
  );
  const submit = useSubmit();
  const canAddPlayer =
    selectedPlayers.length === 0
      ? true
      : selectedPlayers.length === 1
        ? selectedPlayers[0].id !== selectedPlayerId
        : false;
  const canAddTeam = selectedPlayers.length === 2;
  return (
    <div>
      <FormControl sx={{ display: "block", mb: 1 }}>
        <InputLabel id="select-player-label">Select player</InputLabel>
        <Select
          onChange={(evt) => setSelectedPlayerId(Number(evt.target.value))}
          value={selectedPlayerId}
          autoWidth
          labelId="select-player-label"
        >
          {players.map((player) => (
            <MenuItem key={player.id} value={player.id}>
              {player.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
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
      {selectedPlayers.map((player) => (
        <div key={player.id}>{player.name}</div>
      ))}
      <NumberInput
        slotProps={{
          input: {
            name: "handicap",
          },
        }}
        aria-label="Player handicao"
        placeholder="Handicap"
        value={handicap}
        onChange={(event, val) => setHandicap(val)}
      />
      <Button
        onClick={() => {
          const freeScoringTeam: CreateFreeScoringTeamOptions = {
            player1: selectedPlayers[0],
            player2: selectedPlayers[1],
            handicap,
          };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          submit(freeScoringTeam as any, {
            method: "POST",
            encType: "application/json",
          });
        }}
        disabled={!canAddTeam}
      >
        Add Team
      </Button>
    </div>
  );
}
