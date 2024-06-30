import { useLoaderDataT } from "./useLoaderDataT";
import { FreeScoringPlayer } from "./FreeScoringPlayer";
import FormControlLabel from "@mui/material/FormControlLabel/FormControlLabel";
import Checkbox from "@mui/material/Checkbox/Checkbox";
import { useState } from "react";
import { useSubmit } from "react-router-dom";
import Button from "@mui/material/Button/Button";
import IconButton from "@mui/material/IconButton/IconButton";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import NumberInput from "../NumberInput";
import FormControl from "@mui/material/FormControl/FormControl";
import InputLabel from "@mui/material/InputLabel/InputLabel";
import Select from "@mui/material/Select/Select";
import MenuItem from "@mui/material/MenuItem/MenuItem";
import { FreeScoringTeam } from "./FreeScoringTeam";
import { shiftHandicap } from "../umpire/shiftHandicap";
import { MatchOptions } from "../umpire";
import { PlayerNameAndIds } from "./FreeScoringMatches";

export interface BestOfOption {
  bestOf: number;
  canDecrement: boolean;
}

interface SelectedPlayerOrTeam {
  id: number;
  name: string;
  handicap: number;
}

export default function CreateMatch() {
  const submit = useSubmit();
  const { players, teams } = useLoaderDataT<{
    players: FreeScoringPlayer[];
    teams: FreeScoringTeam[];
  }>();
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | undefined>(
    players.length > 0 ? players[0].id : undefined,
  );
  const [selectedTeamId, setSelectedTeamId] = useState<number | undefined>(
    teams.length > 0 ? teams[0].id : undefined,
  );
  const [clearBy2, setClearBy2] = useState(true);
  const [isHandicap, setIsHandicap] = useState(false);
  const [shiftHandicapScore, setShiftHandicap] = useState(true);
  const [numServes, setNumServes] = useState(2);
  const [upTo, setUpTo] = useState(11);
  const [isDoubles, setIsDoubles] = useState(false);
  const [selectedPlayerOrTeams, setSelectedPlayerOrTeams] = useState<
    SelectedPlayerOrTeam[]
  >([]);
  const [bestOfOption, setBestOfOption] = useState<BestOfOption>({
    bestOf: 3,
    canDecrement: true,
  });

  /*
     {
              team1StartGameScore: 0,
              team2StartGameScore: 0,
            },
            true,
  */
  // could auto redirect in......
  if (players.length < 2) {
    return <div>Need at least 2 players to create a match</div>;
  }
  // todo - still show the rest of the form
  if (isDoubles && (teams === undefined || teams.length < 2)) {
    return <div>Need at least 2 teams to create a match</div>;
  }

  const canCreateMatch = selectedPlayerOrTeams.length === 2;
  const selectedId = isDoubles ? selectedTeamId : selectedPlayerId;
  const canAdd =
    selectedPlayerOrTeams.length < 2 &&
    selectedId !== undefined &&
    !selectedPlayerOrTeams.some((p) => p.id === selectedId);

  let team1StartGameScore = 0;
  let team2StartGameScore = 0;
  let calculatedUpTo = upTo;
  if (isHandicap && selectedPlayerOrTeams.length === 2) {
    const team1Handicap = selectedPlayerOrTeams[0].handicap;
    const team2Handicap = selectedPlayerOrTeams[1].handicap;
    if (shiftHandicapScore) {
      const shifted = shiftHandicap({ team1Handicap, team2Handicap, upTo });
      team1StartGameScore = shifted.team1Handicap;
      team2StartGameScore = shifted.team2Handicap;
      calculatedUpTo = shifted.upTo;
    } else {
      team1StartGameScore = team1Handicap;
      team2StartGameScore = team2Handicap;
    }
  }
  return (
    // perhaps be imperative - only need to pass player ids
    <>
      <FormControlLabel
        control={
          <Checkbox
            checked={isDoubles}
            onChange={() => {
              setIsDoubles(!isDoubles);
              setSelectedPlayerOrTeams([]);
            }}
          />
        }
        label="Doubles"
      />
      {!isDoubles ? (
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
      ) : (
        <FormControl>
          <InputLabel id="select-team-label">Select team</InputLabel>
          <Select
            onChange={(evt) => setSelectedTeamId(Number(evt.target.value))}
            value={selectedTeamId}
            sx={{ minWidth: 120 }}
            labelId="select-team-label"
          >
            {teams.map((team) => (
              <MenuItem key={team.id} value={team.id}>
                {team.player1.name} & {team.player2.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      <Button
        onClick={() => {
          if (isDoubles) {
            const team = teams.find((t) => t.id === selectedTeamId);
            if (team !== undefined) {
              setSelectedPlayerOrTeams([
                ...selectedPlayerOrTeams,
                {
                  id: team.id,
                  name: `${team.player1.name} & ${team.player2.name}`,
                  handicap: team.handicap,
                },
              ]);
            }
          } else {
            const player = players.find((p) => p.id === selectedPlayerId);
            if (player !== undefined) {
              setSelectedPlayerOrTeams([
                ...selectedPlayerOrTeams,
                {
                  id: player.id,
                  name: player.name,
                  handicap: player.handicap,
                },
              ]);
            }
          }
        }}
        disabled={!canAdd}
      >
        Add
      </Button>

      <div>
        {selectedPlayerOrTeams.map((p) => (
          <div key={p.id}>
            {p.name} {p.handicap}
          </div>
        ))}
      </div>
      <FormControlLabel
        style={{ display: "block" }}
        control={
          <Checkbox
            checked={isHandicap}
            onChange={() => setIsHandicap(!isHandicap)}
          />
        }
        label="Handicap ?"
      />
      <FormControlLabel
        style={{ display: "block" }}
        control={
          <Checkbox
            disabled={!isHandicap}
            checked={shiftHandicapScore}
            onChange={() => setShiftHandicap(!shiftHandicapScore)}
          />
        }
        label="Shift negatives"
      />
      <label style={{ display: "block", marginBottom: 10 }}>
        Best of {bestOfOption.bestOf}{" "}
        <IconButton
          onClick={() =>
            setBestOfOption({
              canDecrement: true,
              bestOf: bestOfOption.bestOf + 2,
            })
          }
        >
          <AddIcon />
        </IconButton>
        <IconButton
          disabled={!bestOfOption.canDecrement}
          onClick={() => {
            const newBestOf = bestOfOption.bestOf - 2;
            setBestOfOption({
              canDecrement: newBestOf !== 1,
              bestOf: newBestOf,
            });
          }}
        >
          <RemoveIcon />
        </IconButton>
      </label>
      <NumberInput
        aria-label="Number of serves"
        placeholder="Num serves"
        value={numServes}
        onChange={(event, val) => setNumServes(val)}
      />

      <NumberInput
        aria-label="Up to"
        placeholder="Up to"
        value={upTo}
        onChange={(event, val) => setUpTo(val)}
      />
      <FormControlLabel
        style={{ display: "block" }}
        control={
          <Checkbox
            checked={clearBy2}
            onChange={() => setClearBy2(!clearBy2)}
          />
        }
        label="Clear by 2 ?"
      />
      <Button
        onClick={() => {
          const createMatchOptions: MatchOptions = {
            upTo: calculatedUpTo,
            bestOf: bestOfOption.bestOf,
            clearBy2,
            numServes,
            team1StartGameScore,
            team2StartGameScore,
          };
          const ids = selectedPlayerOrTeams.map((p) => p.id);
          let playerNameAndIds: PlayerNameAndIds;
          if (isDoubles) {
            const selectedTeams = teams.filter((team) => ids.includes(team.id));
            playerNameAndIds = {
              team1Player1Name: selectedTeams[0].player1.name,
              team1Player1Id: selectedTeams[0].player1.id,
              team1Player2Name: selectedTeams[0].player2.name,
              team1Player2Id: selectedTeams[0].player2.id,
              team2Player1Name: selectedTeams[1].player1.name,
              team2Player1Id: selectedTeams[1].player1.id,
              team2Player2Name: selectedTeams[1].player2.name,
              team2Player2Id: selectedTeams[1].player2.id,
            };
          } else {
            const selectedPlayers = players.filter((player) =>
              ids.includes(player.id),
            );
            playerNameAndIds = {
              team1Player1Name: selectedPlayers[0].name,
              team1Player1Id: selectedPlayers[0].id,
              team2Player1Name: selectedPlayers[1].name,
              team2Player1Id: selectedPlayers[1].id,
              team1Player2Id: undefined,
              team1Player2Name: undefined,
              team2Player2Id: undefined,
              team2Player2Name: undefined,
            };
          }

          submit(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { ...createMatchOptions, ...playerNameAndIds } as any,
            {
              method: "post",
              encType: "application/json",
            },
          );
        }}
        disabled={!canCreateMatch}
        type="submit"
      >
        Create
      </Button>
    </>
  );
}

export interface CreateMatchOptions extends MatchOptions, PlayerNameAndIds {}
