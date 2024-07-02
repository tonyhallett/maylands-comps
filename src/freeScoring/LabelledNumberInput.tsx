import NumberInput from "../NumberInput";
import { Box, Typography } from "@mui/material";

export function LabelledNumberInput(props: {
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
