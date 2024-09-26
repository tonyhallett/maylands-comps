import { Autocomplete, Box, TextField } from "@mui/material";
import { AutoCompleteProps } from "./TeamMatchPlayerSelect";

export interface AvailableDoubles {
  player1Name: string;
  player1Id: string;
  player1PositionDisplay: string;
  player2Name: string;
  player2Id: string;
  player2PositionDisplay: string;
}

export interface TeamDoublesSelectProps {
  availableDoubles: AvailableDoubles[];
  selectedDoubles: AvailableDoubles | null;
  disabled?: boolean;
  onChange: (availableDoubles: AvailableDoubles | null) => void;
  autoCompleteProps?: AutoCompleteProps<AvailableDoubles>;
  isHome: boolean;
}
export const getDoublesSelectAriaLabel = (isHome: boolean) => {
  return isHome ? "home-doubles-select" : "away-doubles-select";
};

export function TeamDoublesSelect({
  availableDoubles,
  selectedDoubles,
  disabled = false,
  onChange,
  autoCompleteProps = {},
  isHome,
}: TeamDoublesSelectProps) {
  return (
    <Autocomplete
      {...autoCompleteProps}
      clearOnBlur
      freeSolo={false}
      disabled={disabled}
      options={availableDoubles}
      // *********************************  renderOption for full alternative
      getOptionLabel={(option: AvailableDoubles) => {
        return `${option.player1Name} - ${option.player2Name}`;
      }}
      value={selectedDoubles}
      onChange={(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        event: React.SyntheticEvent,
        newValue: AvailableDoubles | null,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        reason,
      ) => {
        onChange(newValue);
      }}
      renderInput={(params) => (
        // @ts-expect-error - this is how they document it ! todo look at later
        <TextField
          {...params}
          label="Doubles"
          variant="standard"
          inputProps={{
            ...params.inputProps,
            "aria-label": getDoublesSelectAriaLabel(isHome),
          }}
        />
      )}
    />
  );
}
interface DoublesSelectProps {
  home: Omit<TeamDoublesSelectProps, "isHome">;
  away: Omit<TeamDoublesSelectProps, "isHome">;
  autoCompleteProps?: AutoCompleteProps<AvailableDoubles>;
}
export function DoublesSelect({
  home,
  away,
  autoCompleteProps = {},
}: DoublesSelectProps) {
  return (
    <Box display="flex" justifyContent="space-between">
      <div style={{ flexGrow: 1, flexBasis: "50%" }}>
        <TeamDoublesSelect
          isHome={true}
          {...home}
          autoCompleteProps={autoCompleteProps}
        ></TeamDoublesSelect>
      </div>
      <div style={{ flexGrow: 1, flexBasis: "50%" }}>
        <TeamDoublesSelect
          isHome={false}
          {...away}
          autoCompleteProps={autoCompleteProps}
        ></TeamDoublesSelect>
      </div>
    </Box>
  );
}
