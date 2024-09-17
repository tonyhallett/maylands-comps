import { useLoaderDataT } from "./hooks/useLoaderDataT";
import FormControlLabel from "@mui/material/FormControlLabel/FormControlLabel";
import Checkbox from "@mui/material/Checkbox/Checkbox";
import { useState } from "react";
import { useSubmit } from "react-router-dom";
import Button from "@mui/material/Button/Button";
import MenuItem from "@mui/material/MenuItem/MenuItem";
import { shiftHandicap } from "../umpire/shiftHandicap";
import { MatchOptions } from "../umpire";
import { PlayerIds, PlayerNameAndIds } from "./FreeScoringMatches";
import { Alert, Box, IconButton, TextField } from "@mui/material";
import { LabelledNumberInput } from "./LabelledNumberInput";
import { CreateMatchLoaderData } from "./route";
import { MarginDivider } from "./MarginDivider";
import DeleteIcon from "@mui/icons-material/Delete";

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
  const { players, teams } = useLoaderDataT<CreateMatchLoaderData>();
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | undefined>(
    players.length > 0 ? players[0].id : undefined,
  );
  const [selectedTeamId, setSelectedTeamId] = useState<number | undefined>(
    teams.length > 0 ? teams[0].id : undefined,
  );
  const [umpire, setUmpire] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [clearBy2, setClearBy2] = useState(true);
  const [isHandicap, setIsHandicap] = useState(false);
  //const [shiftHandicapScore, setShiftHandicap] = useState(true);
  const [numServes, setNumServes] = useState(2);
  const [upTo, setUpTo] = useState(11);
  const [isDoubles, setIsDoubles] = useState(false);
  const [selectedPlayerOrTeams, setSelectedPlayerOrTeams] = useState<
    SelectedPlayerOrTeam[]
  >([]);
  const [bestOf, setBestOf] = useState(5);

  const insufficientTeamsForDoubles = isDoubles && teams.length < 2;
  const doublesCheckBox = (
    <Box mb={2}>
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
    </Box>
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
    const selectedTeam = teams.find((t) => t.id === selectedId)!;
    const addedTeam = teams.find((t) => t.id === selectedPlayerOrTeams[0].id)!;
    const addedTeamPlayerIds = [addedTeam.player1Id, addedTeam.player2Id];
    const duplicatePlayers = [
      selectedTeam.player1Id,
      selectedTeam.player2Id,
    ].some((id) => addedTeamPlayerIds.includes(id));
    canAdd = !duplicatePlayers;
  }

  const canCreateMatch =
    selectedPlayerOrTeams.length === 2 &&
    numServes > 0 &&
    upTo > 0 &&
    bestOf > 0 &&
    bestOf % 2 === 1;

  const _submit = (play: boolean) => {
    const { calculatedUpTo, team1StartGameScore, team2StartGameScore } =
      getStartScores(
        isHandicap,
        upTo,
        /* shiftHandicapScore, */
        true,
        selectedPlayerOrTeams,
      );
    const matchOptions: MatchOptions = {
      upTo: calculatedUpTo,
      bestOf,
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
        team1Player1Name: selectedTeams[0].player1Name,
        team1Player1Id: selectedTeams[0].player1Id,
        team1Player2Name: selectedTeams[0].player2Name,
        team1Player2Id: selectedTeams[0].player2Id,
        team2Player1Name: selectedTeams[1].player1Name,
        team2Player1Id: selectedTeams[1].player1Id,
        team2Player2Name: selectedTeams[1].player2Name,
        team2Player2Id: selectedTeams[1].player2Id,
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
    const createMatchOptions: CreateMatchOptionsRequest = {
      ...matchOptions,
      ...playerNameAndIds,
      play,
      umpire,
      title,
    };
    submit(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createMatchOptions as any,
      {
        method: "post",
        encType: "application/json",
      },
    );
  };

  return (
    <>
      <Box mb={1}>
        <TextField
          label="Title"
          value={title}
          onChange={(evt) => setTitle(evt.target.value)}
        />
      </Box>
      <Box>
        <TextField
          label="Umpire"
          value={umpire}
          onChange={(evt) => setUmpire(evt.target.value)}
        />
      </Box>
      <MarginDivider />

      <FormControlLabel
        control={
          <Checkbox
            checked={isHandicap}
            onChange={() => setIsHandicap(!isHandicap)}
          />
        }
        label="Handicap Match"
      />
      {/* <FormControlLabel
        style={{ display: "inline" }}
        control={
          <Checkbox
            disabled={!isHandicap}
            checked={shiftHandicapScore}
            onChange={() => setShiftHandicap(!shiftHandicapScore)}
          />
        }
        label="Shift negatives"
      /> */}
      <MarginDivider />
      {doublesCheckBox}
      <Box mb={1}>
        {!isDoubles ? (
          <TextField
            fullWidth
            label="Select player"
            select
            value={selectedPlayerId}
            onChange={(evt) => setSelectedPlayerId(Number(evt.target.value))}
          >
            {players.map((player) => (
              <MenuItem key={player.id} value={player.id}>
                {player.name}
              </MenuItem>
            ))}
          </TextField>
        ) : (
          <TextField
            fullWidth
            label="Select team"
            select
            onChange={(evt) => setSelectedTeamId(Number(evt.target.value))}
            value={selectedTeamId}
          >
            {teams.map((team) => (
              <MenuItem key={team.id} value={team.id}>
                {`${team.player1Name} & ${team.player2Name}`}
              </MenuItem>
            ))}
          </TextField>
        )}
      </Box>
      <Button
        onClick={() => {
          if (isDoubles) {
            const team = teams.find((t) => t.id === selectedTeamId);
            if (team !== undefined) {
              setSelectedPlayerOrTeams([
                ...selectedPlayerOrTeams,
                {
                  id: team.id,
                  name: `${team.player1Name} & ${team.player2Name}`,
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
        {`Add ${isDoubles ? "team" : "player"}`}
      </Button>
      <Box minHeight={80}>
        {selectedPlayerOrTeams.map((p) => (
          <div key={p.id}>
            <IconButton
              onClick={() => {
                setSelectedPlayerOrTeams(
                  selectedPlayerOrTeams.filter((player) => player.id !== p.id),
                );
              }}
            >
              <DeleteIcon />
            </IconButton>
            {p.name}
          </div>
        ))}
      </Box>

      <MarginDivider />
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
      <Box mb={1}>
        <LabelledNumberInput
          label="Num serves"
          numberInputProps={{
            "aria-label": "Number of serves",
            placeholder: "Num serves",
            value: numServes,
            min: 1,
            onChange: (event, val) => setNumServes(val!),
          }}
        />
      </Box>
      <LabelledNumberInput
        label="Up to"
        numberInputProps={{
          "aria-label": "Up to",
          placeholder: "Up to",
          value: upTo,
          min: 1,
          onChange: (event, val) => setUpTo(val!),
        }}
      />
      <MarginDivider />
      <LabelledNumberInput
        label="Best of"
        numberInputProps={{
          "aria-label": "Best of",
          placeholder: "Best of",
          value: bestOf,
          min: 1,
          onChange: (event, val) => {
            if (val !== null) {
              /*
                this "fixes" broken behaviour with step
                https://github.com/mui/base-ui/issues/471   my issue
                This can occur for typing as well as buttons.
                Using previous value to work with buttons.

              */
              const isEven = val % 2 === 0;
              if (isEven) {
                if (val > bestOf) {
                  val = val + 1;
                } else {
                  val = val - 1;
                }
              }
            }
            setBestOf(val!);
          },
        }}
      />

      <MarginDivider />
      <Button
        onClick={() => {
          _submit(false);
        }}
        disabled={!canCreateMatch}
        type="submit"
      >
        Create Match
      </Button>

      <Button
        onClick={() => {
          _submit(true);
        }}
        disabled={!canCreateMatch}
        type="submit"
      >
        Play
      </Button>
    </>
  );
}

export interface CreateMatchOptions extends MatchOptions, PlayerIds {
  umpire: string;
  title: string;
}

export interface CreateMatchOptionsRequest extends CreateMatchOptions {
  play: boolean;
}
