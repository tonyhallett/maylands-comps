import TextField from "@mui/material/TextField/TextField";
import { useState } from "react";
import { Form } from "react-router-dom";
import Button from "@mui/material/Button/Button";
import { FreeScoringPlayersLoaderData } from "./route";
import { useLoaderDataT } from "./hooks/useLoaderDataT";
import { LabelledNumberInput } from "./LabelledNumberInput";
import { Box } from "@mui/material";
import { MarginDivider } from "./MarginDivider";

export default function CreateFreeScoringPlayer() {
  const { players } = useLoaderDataT<FreeScoringPlayersLoaderData>();
  const [name, setName] = useState("");
  const [handicap, setHandicap] = useState(0);
  const duplicateName = players.some((player) => player.name === name);
  return (
    <Form method="post">
      <Box mb={1}>
        <TextField
          label="Name"
          name="name"
          value={name}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setName(event.target.value);
          }}
          variant="outlined"
          error={duplicateName}
          helperText={duplicateName ? "Name already exists" : ""}
        />
      </Box>
      <LabelledNumberInput
        label="Handicap"
        numberInputProps={{
          slotProps: {
            input: {
              name: "handicap",
            },
          },
          "aria-label": "Player handicap",
          placeholder: "Handicap",
          value: handicap,
          onChange: (event, val) => setHandicap(val!),
        }}
      />
      <MarginDivider />
      <Button
        disabled={name.trim().length === 0 || duplicateName}
        type="submit"
      >
        Create Player
      </Button>
    </Form>
  );
}
