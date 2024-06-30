import TextField from "@mui/material/TextField/TextField";
import { useState } from "react";
import NumberInput from "../NumberInput";
import { Form } from "react-router-dom";
import Button from "@mui/material/Button/Button";

export default function CreateFreeScoringPlayer() {
  // will use this to warn about name clashes
  //const { players } = useLoaderDataT<{ players: FreeScoringPlayer[] }>();
  const [name, setName] = useState("");
  const [handicap, setHandicap] = useState(0);
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
      <Button disabled={name.trim().length === 0} type="submit">
        Create
      </Button>
    </Form>
  );
}
