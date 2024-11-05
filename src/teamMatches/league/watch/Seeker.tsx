import { useState } from "react";
import { Seek } from "../play/league-match-selection/livestreams/LivestreamProvider";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
} from "@mui/material";
import { GameScoreState } from "../../../umpire";

export interface SeekPoint {
  date: Date;
  gameScoreState: GameScoreState;
}

export type GameSeekPoints = Map<number, SeekPoint[]>;
export type MatchSeekPoints = Map<string, GameSeekPoints>;

type NotSelected = "";
type OrNotSelected<T> = T | NotSelected;
export interface SeekerState {
  match: string;
  game: OrNotSelected<number>;
  seekPointIndex: OrNotSelected<number>;
}
const notSelected: NotSelected = "";

export function Seeker({
  matchSeekPoints,
  seek,
  singleMatch,
  identifying,
}: {
  matchSeekPoints: MatchSeekPoints;
  seek: Seek;
  singleMatch: boolean;
  identifying: string;
}) {
  const getIdentifier = (suffix: string) => `${identifying}-select-${suffix}`;
  const [state, setState] = useState<SeekerState>({
    match: singleMatch ? [...matchSeekPoints.keys()][0] : notSelected,
    game: notSelected,
    seekPointIndex: notSelected,
  });

  const handleMatchChange = (event: SelectChangeEvent) => {
    const match = event.target.value;

    const newState: SeekerState = {
      match,
      game: notSelected,
      seekPointIndex: notSelected,
    };
    setState(newState);
  };

  const handleGameChange = (event: SelectChangeEvent<number>) => {
    const game = event.target.value as number;
    setState((prevState) => {
      return {
        ...prevState,
        game,
      };
    });
  };

  const handleSeekChange = (event: SelectChangeEvent<number>) => {
    const seekPointIndex = event.target.value as number;
    setState((prevState) => {
      const seekPoints = getMatchSeekPontsFromState(prevState);
      const seekPoint = seekPoints.get(prevState.game as number)![
        seekPointIndex
      ];
      seek(seekPoint);
      return {
        ...prevState,
        seekPointIndex,
      };
    });
  };

  const getMatchSeekPontsFromState = (state: SeekerState) => {
    return matchSeekPoints.get(state.match)!;
  };
  const getMatchSeekPoints = () => {
    return getMatchSeekPontsFromState(state);
  };

  const matchSelectIdentifier = getIdentifier("Match");
  const gameSelectIdentifier = getIdentifier("Game");
  const seekPointSelectIdentifier = getIdentifier("Seek");
  return (
    <Stack direction="row" spacing={1} m={1}>
      {!singleMatch && (
        <Box component="span">
          <FormControl style={{ width: 120 }}>
            <InputLabel id={matchSelectIdentifier}>Match</InputLabel>
            <Select
              inputProps={{ MenuProps: { disableScrollLock: true } }}
              value={state.match}
              label="Match"
              labelId={matchSelectIdentifier}
              onChange={handleMatchChange}
            >
              {[...matchSeekPoints.keys()].map((match) => {
                return (
                  <MenuItem
                    key={match}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    value={match}
                  >
                    {match}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>
      )}
      <Box component="span">
        <FormControl style={{ width: 120 }}>
          <InputLabel id={gameSelectIdentifier}>Game</InputLabel>
          <Select<number>
            inputProps={{ MenuProps: { disableScrollLock: true } }}
            value={state.game}
            label="Game"
            labelId={gameSelectIdentifier}
            onChange={handleGameChange}
            disabled={state.match === ""}
          >
            {state.match !== "" &&
              [...getMatchSeekPoints().keys()].map((gameNumber) => {
                return (
                  <MenuItem
                    key={gameNumber}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    value={gameNumber}
                  >
                    {gameNumber + 1}
                  </MenuItem>
                );
              })}
          </Select>
        </FormControl>
      </Box>
      <Box component="span">
        <FormControl style={{ width: 120 }}>
          <InputLabel id={seekPointSelectIdentifier}>Seek</InputLabel>
          <Select<number>
            inputProps={{ MenuProps: { disableScrollLock: true } }}
            value={state.seekPointIndex}
            label="Seek"
            labelId={seekPointSelectIdentifier}
            onChange={handleSeekChange}
            disabled={state.game === ""}
          >
            {state.game !== "" &&
              [...getMatchSeekPoints().get(state.game)!.values()].map(
                (seekPoint, i) => {
                  return (
                    <MenuItem
                      key={i}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      value={i}
                    >
                      {`${seekPoint.gameScoreState.team1Points} - ${seekPoint.gameScoreState.team2Points}`}
                    </MenuItem>
                  );
                },
              )}
          </Select>
        </FormControl>
      </Box>
    </Stack>
  );
}
