import { Autocomplete, AutocompleteProps, Box, TextField } from "@mui/material";
import { fillArray, fillArrayWithIndices } from "../helpers/fillArray";

interface TeamsMatchPlayersSelectProps<
  TPlayer extends SelectablePlayer = SelectablePlayer,
> {
  homeTeam: TeamSelectProps<TPlayer>;
  awayTeam: TeamSelectProps<TPlayer>;
  newPlayers?: boolean;
  autoCompleteProps?: TeamAutoCompleteProps<TPlayer>;
}
type TeamSelectProps<TPlayer extends SelectablePlayer = SelectablePlayer> =
  Omit<
    TeamMatchPlayersSelectProps<TPlayer>,
    "numPlayers" | "autoCompleteProps"
  >;
interface SelectablePlayer {
  name: string;
}

export type AutoCompleteProps<T> = Pick<
  AutocompleteProps<T, undefined, undefined, undefined>,
  "autoComplete" | "autoHighlight" | "clearOnEscape" | "groupBy"
>;

type TeamAutoCompleteProps<
  TPlayer extends SelectablePlayer = SelectablePlayer,
> = AutoCompleteProps<TPlayer>;

interface TeamMatchPlayersSelectProps<
  TPlayer extends SelectablePlayer = SelectablePlayer,
> {
  availablePlayers: TPlayer[][];
  selectedPlayers: TPlayer[];
  playerSelected: (availablePlayer: TPlayer | null, position: number) => void;
  newPlayerSelected?: (name: string, position: number) => void;
  enabled?: boolean[];
  autoCompleteProps?: TeamAutoCompleteProps<TPlayer>;
  labels?: string[];
  teamName?: string;
}

export function TeamsMatchPlayersSelect<
  TPlayer extends SelectablePlayer = SelectablePlayer,
>({
  homeTeam,
  awayTeam,
  autoCompleteProps,
}: TeamsMatchPlayersSelectProps<TPlayer>) {
  return (
    <Box display="flex" justifyContent="space-between">
      <TeamMatchPlayersSelect<TPlayer>
        {...homeTeam}
        autoCompleteProps={autoCompleteProps}
      />
      <TeamMatchPlayersSelect<TPlayer>
        {...awayTeam}
        autoCompleteProps={autoCompleteProps}
      />
    </Box>
  );
}

export function TeamMatchPlayersSelect<
  TPlayer extends SelectablePlayer = SelectablePlayer,
>({
  availablePlayers,
  selectedPlayers,
  playerSelected,
  enabled,
  newPlayerSelected,
  autoCompleteProps = {},
  labels,
  teamName,
}: TeamMatchPlayersSelectProps<TPlayer>) {
  const numPlayers = availablePlayers.length;
  if (labels === undefined) {
    labels = fillArray(numPlayers, (index) => `Player ${index + 1}`);
  }
  if (enabled === undefined) {
    enabled = fillArray(numPlayers, () => true);
  }
  if (enabled.length !== numPlayers) {
    throw new Error("enabled length must match numPlayers");
  }
  const playerPositions = fillArrayWithIndices(numPlayers);
  return (
    <div style={{ flexGrow: 1 }}>
      {teamName && <h3>{teamName}</h3>}
      {playerPositions.map((position) => {
        let selectedPlayer = selectedPlayers[position];
        if (selectedPlayer === undefined) {
          selectedPlayer = null;
        }

        return (
          // this is generic  but includes FreeSolo as a type parameter
          <Autocomplete
            {...autoCompleteProps}
            clearOnBlur
            freeSolo={newPlayerSelected !== undefined}
            disabled={!enabled[position]}
            key={position}
            options={availablePlayers[position]}
            getOptionLabel={(option: TPlayer | string) => {
              // is a string when freeSolo is true
              if (typeof option === "string") {
                return option;
              }
              return option.name;
            }}
            value={selectedPlayer}
            onChange={(
              event: React.SyntheticEvent,
              newValue: TPlayer | null,
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              reason,
            ) => {
              if (typeof newValue === "string") {
                newPlayerSelected!(newValue, position);
              } else {
                playerSelected(newValue, position);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={labels![position]}
                variant="standard"
              />
            )}
          />
        );
      })}
    </div>
  );
}
