import { Box, Button, TextField } from "@mui/material";
import { useLoaderDataT } from "./hooks/useLoaderDataT";
import { FreeScoringPlayer } from "./types";
import { useState } from "react";
import { LabelledNumberInput } from "./LabelledNumberInput";
import { usePostJson } from "./hooks/usePostJson";
import { MarginDivider } from "./MarginDivider";

export default function EditPlayer() {
  const { player } = useLoaderDataT<{ player: FreeScoringPlayer }>();
  const postJson = usePostJson();

  const [newPlayer, setNewPlayer] = useState(player);
  const hasChanged =
    newPlayer.name !== player.name || newPlayer.handicap !== player.handicap;
  const canSubmit =
    hasChanged && newPlayer.name.length > 0 && newPlayer.handicap !== null;

  return (
    <>
      <Box mb={1}>
        <TextField
          onChange={(evt) =>
            setNewPlayer({ ...newPlayer, name: evt.target.value })
          }
          value={newPlayer.name}
          label="Name"
        />
      </Box>
      <LabelledNumberInput
        label="Handicap"
        numberInputProps={{
          "aria-label": "Edit Player handicap",
          placeholder: "Handicap",
          value: newPlayer.handicap,
          onChange: (event, val) =>
            setNewPlayer({ ...newPlayer, handicap: val }),
        }}
      />
      <MarginDivider />
      <Button
        onClick={() =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          postJson(newPlayer as any)
        }
        disabled={!canSubmit}
      >
        Update player
      </Button>
    </>
  );
}
