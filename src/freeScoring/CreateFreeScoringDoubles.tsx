import FormControl from "@mui/material/FormControl/FormControl";
import InputLabel from "@mui/material/InputLabel/InputLabel";
import Select from "@mui/material/Select/Select";
import { useState } from "react";
import { useLoaderDataT } from "./hooks/useLoaderDataT";
import MenuItem from "@mui/material/MenuItem/MenuItem";
import Button from "@mui/material/Button/Button";
import NumberInput from "../NumberInput";
import {
  CreateFreeScoringTeamOptions,
  FreeScoringPlayersAndTeamsLoaderData,
} from "./route";
import { FreeScoringPlayer, FreeScoringTeam } from "./types";
import { usePostJson } from "./hooks/usePostJson";

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
        aria-label="Player handicao"
        placeholder="Handicap"
        value={handicap}
        onChange={(event, val) => setHandicap(val)}
      />
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
        Add Team
      </Button>
    </div>
  );
}
