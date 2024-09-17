import { Autocomplete, Box, TextField } from "@mui/material";
import { AutoCompleteProps } from "../teamMatchPlayerSelect";

export interface AvailableDoubles {
  player1Name: string;
  player1Id: string;
  player2Name: string;
  player2Id: string;
}

interface TeamDoublesSelectProps {
  availableDoubles: AvailableDoubles[];
  selectedDoubles: AvailableDoubles | null;
  disabled?: boolean;
  onChange: (availableDoubles: AvailableDoubles | null) => void;
  autoCompleteProps?: AutoCompleteProps<AvailableDoubles>;
}
function TeamDoublesSelect({
  availableDoubles,
  selectedDoubles,
  disabled = false,
  onChange,
  autoCompleteProps = {},
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
        <TextField {...params} label="Doubles" variant="standard" />
      )}
    />
  );
}
interface DoublesSelectProps {
  home: TeamDoublesSelectProps;
  away: TeamDoublesSelectProps;
  autoCompleteProps?: AutoCompleteProps<AvailableDoubles>;
}
export function DoublesSelect({
  home,
  away,
  autoCompleteProps = {},
}: DoublesSelectProps) {
  return (
    <Box display="flex" justifyContent="space-between">
      <div style={{ flexGrow: 1 }}>
        <TeamDoublesSelect
          {...home}
          autoCompleteProps={autoCompleteProps}
        ></TeamDoublesSelect>
      </div>
      <div style={{ flexGrow: 1 }}>
        <TeamDoublesSelect
          {...away}
          autoCompleteProps={autoCompleteProps}
        ></TeamDoublesSelect>
      </div>
    </Box>
  );
}
