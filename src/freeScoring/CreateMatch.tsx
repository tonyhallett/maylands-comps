import { useLoaderDataT } from "./useLoaderDataT";
import FormControlLabel from "@mui/material/FormControlLabel/FormControlLabel";
import Checkbox from "@mui/material/Checkbox/Checkbox";
import { useState } from "react";
import { useSubmit } from "react-router-dom";
import Button from "@mui/material/Button/Button";
import IconButton from "@mui/material/IconButton/IconButton";
import IncrementIcon from "@mui/icons-material/Add";
import DecrementIcon from "@mui/icons-material/Remove";
import NumberInput from "../NumberInput";
import FormControl from "@mui/material/FormControl/FormControl";
import InputLabel from "@mui/material/InputLabel/InputLabel";
import Select from "@mui/material/Select/Select";
import MenuItem from "@mui/material/MenuItem/MenuItem";
import { FreeScoringPlayer, FreeScoringTeam } from "./types";
import { shiftHandicap } from "../umpire/shiftHandicap";
import { MatchOptions } from "../umpire";
import { PlayerNameAndIds } from "./FreeScoringMatches";
import { Alert, Box, Typography } from "@mui/material";

function LabelledNumberInput(props: {
  label: string;
  numberInputProps: React.ComponentProps<typeof NumberInput>;
}) {
  const { label, numberInputProps } = props;
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <NumberInput {...numberInputProps} />
      <Typography ml={1}>{label}</Typography>
    </Box>
  );
}

export interface BestOfOption {
  bestOf: number;
  canDecrement: boolean;
}

interface SelectedPlayerOrTeam {
  id: number;
  name: string;
  handicap: number;
}

function getStartScores(
  isHandicap: boolean,
  upTo: number,
  shiftHandicapScore: boolean,
  selectedPlayerOrTeams: SelectedPlayerOrTeam[],
) {
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
  return {
    team1StartGameScore,
    team2StartGameScore,
    calculatedUpTo,
  };
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
  const [bestOfX, setBestOf] = useState(5);
  const [bestOfOption, setBestOfOption] = useState<BestOfOption>({
    bestOf: 5,
    canDecrement: true,
  });

  const insufficientTeamsForDoubles = isDoubles && teams.length < 2;
  const doublesCheckBox = (
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
  );

  if (players.length < 2) {
    return (
      <Alert severity="error">Need at least 2 players to create a match</Alert>
    );
  }
  if (insufficientTeamsForDoubles) {
    return (
      <>
        <Alert severity="error">Need at least 2 teams to create a match</Alert>
        {doublesCheckBox}
      </>
    );
  }

  const selectedId = isDoubles ? selectedTeamId : selectedPlayerId;
  let canAdd =
    selectedPlayerOrTeams.length < 2 &&
    selectedId !== undefined &&
    !selectedPlayerOrTeams.some((p) => p.id === selectedId);

  if (isDoubles && canAdd && selectedPlayerOrTeams.length > 0) {
    const selectedTeam = teams.find((t) => t.id === selectedId);
    const addedTeam = teams.find((t) => t.id === selectedPlayerOrTeams[0].id);
    const addedTeamPlayerIds = [addedTeam.player1.id, addedTeam.player2.id];
    const duplicatePlayers = [
      selectedTeam.player1.id,
      selectedTeam.player2.id,
    ].some((id) => addedTeamPlayerIds.includes(id));
    canAdd = !duplicatePlayers;
  }

  const canCreateMatch =
    selectedPlayerOrTeams.length === 2 &&
    numServes > 0 &&
    upTo > 0 &&
    bestOfX > 0 &&
    bestOfX % 2 === 1;
  return (
    <>
      {doublesCheckBox}
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
        control={
          <Checkbox
            checked={isHandicap}
            onChange={() => setIsHandicap(!isHandicap)}
          />
        }
        label="Handicap ?"
      />
      <FormControlLabel
        style={{ display: "inline" }}
        control={
          <Checkbox
            disabled={!isHandicap}
            checked={shiftHandicapScore}
            onChange={() => setShiftHandicap(!shiftHandicapScore)}
          />
        }
        label="Shift negatives"
      />
      <Box mb={1}>
        <Typography display={"inline"}>
          Best of {bestOfOption.bestOf}{" "}
        </Typography>
        <IconButton
          onClick={() =>
            setBestOfOption({
              canDecrement: true,
              bestOf: bestOfOption.bestOf + 2,
            })
          }
        >
          <IncrementIcon />
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
          <DecrementIcon />
        </IconButton>
      </Box>
      <FormControlLabel
        style={{ display: "block" }}
        control={
          <Checkbox
            checked={clearBy2}
            onChange={() => setClearBy2(!clearBy2)}
          />
        }
        label="Win by 2 ?"
      />
      <LabelledNumberInput
        label="Num serves"
        numberInputProps={{
          "aria-label": "Number of serves",
          placeholder: "Num serves",
          value: numServes,
          min: 1,
          onChange: (event, val) => setNumServes(val),
        }}
      />
      <LabelledNumberInput
        label="Up to"
        numberInputProps={{
          "aria-label": "Up to",
          placeholder: "Up to",
          value: upTo,
          min: 11,
          onChange: (event, val) => setUpTo(val),
        }}
      />

      <LabelledNumberInput
        label="Best of"
        numberInputProps={{
          "aria-label": "Best of",
          placeholder: "Best of",
          value: bestOfX,
          min: 1,
          onChange: (event, val) => {
            if (val !== null) {
              /*
                this "fixes" broken behaviour with step
              */
              const preVal = bestOfX;
              const isEven = val % 2 === 0;
              if (isEven) {
                if (val > preVal) {
                  val = val + 1;
                } else {
                  val = val - 1;
                }
              }
            }
            setBestOf(val);
          },
        }}
      />

      <Button
        onClick={() => {
          const { calculatedUpTo, team1StartGameScore, team2StartGameScore } =
            getStartScores(
              isHandicap,
              upTo,
              shiftHandicapScore,
              selectedPlayerOrTeams,
            );
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
