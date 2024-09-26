import { Autocomplete, AutocompleteProps, TextField } from "@mui/material";
import { fillArray, fillArrayWithIndices } from "../../../../helpers/fillArray";

export type TeamSelectProps<
  TPlayer extends SelectablePlayer = SelectablePlayer,
> = Omit<
  TeamMatchPlayersSelectProps<TPlayer>,
  "numPlayers" | "autoCompleteProps" | "isHome"
>;
export interface SelectablePlayer {
  name: string;
}

export type AutoCompleteProps<T> = Pick<
  AutocompleteProps<T, undefined, undefined, undefined>,
  "autoComplete" | "autoHighlight" | "clearOnEscape" | "groupBy"
>;

export type SelectablePlayerAutoCompleteProps = AutoCompleteProps<unknown>;

interface TeamMatchPlayersSelectProps<
  TPlayer extends SelectablePlayer = SelectablePlayer,
> {
  availablePlayers: TPlayer[][];
  selectedPlayers: (TPlayer | null)[];
  playerSelected: (availablePlayer: TPlayer | null, position: number) => void;
  newPlayerSelected?: (name: string, position: number) => void;
  enabled?: boolean[];
  autoCompleteProps: SelectablePlayerAutoCompleteProps | undefined;
  labels?: string[];
  teamName?: string;
  isHome: boolean;
}

export const matchPlayersSelectSectionLabel = "Match Players Select";

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
  isHome,
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
    <section aria-label={matchPlayersSelectSectionLabel}>
      {teamName && <h3>{teamName}</h3>}
      {playerPositions.map((position) => {
        let selectedPlayer = selectedPlayers[position];
        if (selectedPlayer === undefined) {
          selectedPlayer = null;
        }
        const homeAwayPrefix = isHome ? "home" : "away";
        const id = `${homeAwayPrefix}-player-${position + 1}`;
        return (
          // this is generic  but includes FreeSolo as a type parameter
          <Autocomplete
            id={id}
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
              // @ts-expect-error - this is how they document it ! todo look at later
              <TextField
                {...params}
                label={labels![position]}
                variant="standard"
              />
            )}
          />
        );
      })}
    </section>
  );
}
