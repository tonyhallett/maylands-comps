import TextField from "@mui/material/TextField/TextField";
import { useState } from "react";
import NumberInput from "../NumberInput";
import { Form } from "react-router-dom";
import Button from "@mui/material/Button/Button";
import { FreeScoringPlayersLoaderData } from "./route";
import { useLoaderDataT } from "./hooks/useLoaderDataT";

export default function CreateFreeScoringPlayer() {
  const { players } = useLoaderDataT<FreeScoringPlayersLoaderData>();
  const [name, setName] = useState("");
  const [handicap, setHandicap] = useState(0);
  const duplicateName = players.some((player) => player.name === name);
  return (
    <Form method="post">
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
      <NumberInput
        slotProps={{
          input: {
            name: "handicap",
          },
        }}
        aria-label="Player handicao"
        placeholder="Handicap"
        value={handicap}
        onChange={(event, val) => setHandicap(val)}
      />
      <Button
        disabled={name.trim().length === 0 || duplicateName}
        type="submit"
      >
        Create
      </Button>
    </Form>
  );
}
