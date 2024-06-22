import { useState } from "react";
import { MatchOptions, UmpireManager } from "./UmpireManager";
import DraggableMatchSetup from "./DraggableMatchSetup";

export interface PlayerNames {
  team1Player1Name: string;
  team2Player1Name: string;
  team1Player2Name?: string;
  team2Player2Name?: string;
}

export function DemoUmpire() {
  const [demoKey, setDemoKey] = useState(0);
  const [matchOptions, setMatchOptions] = useState<MatchOptions | undefined>(
    undefined,
  );

  return (
    <>
      <DraggableMatchSetup
        setMatchOptions={(matchOptions) => {
          setMatchOptions(matchOptions);
          setDemoKey(demoKey + 1);
        }}
      />
      {matchOptions && <UmpireManager key={demoKey} options={matchOptions} />}
    </>
  );
}
