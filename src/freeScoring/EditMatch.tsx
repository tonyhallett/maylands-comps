import { Button } from "@mui/material";
import { useState } from "react";
import { FreeScoringMatchState } from "./FreeScoringMatches";
import { useLoaderDataT } from "./hooks/useLoaderDataT";
import { usePostJson } from "./hooks/usePostJson";
import { LabelledNumberInput } from "./LabelledNumberInput";

export interface BestOfMatchEdit {
  bestOf: number;
  id: string;
}

export function EditMatch() {
  const matchState = useLoaderDataT<FreeScoringMatchState>();
  const postJson = usePostJson();
  const [bestOf, setBestOf] = useState(matchState.bestOf);
  return (
    <>
      <LabelledNumberInput
        label="Best of"
        numberInputProps={{
          "aria-label": "Best of",
          placeholder: "Best of",
          value: bestOf,
          min: 1,
          onChange: (event, val) => {
            if (val !== null) {
              /*
            this "fixes" broken behaviour with step
            https://github.com/mui/base-ui/issues/471   my issue
            This can occur for typing as well as buttons.
            Using previous value to work with buttons.
  
          */
              const isEven = val % 2 === 0;
              if (isEven) {
                if (val > bestOf) {
                  val = val + 1;
                } else {
                  val = val - 1;
                }
              }
            }
            setBestOf(val!);
          },
        }}
      />

      <Button
        sx={{ mt: 1 }}
        disabled={bestOf === matchState.bestOf}
        onClick={() => {
          const edit: BestOfMatchEdit = {
            bestOf,
            id: matchState.id,
          };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          postJson(edit as any);
        }}
      >
        Change best of
      </Button>
    </>
  );
}
