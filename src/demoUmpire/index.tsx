import { useState } from "react";
import { MatchOptions, UmpireManager } from "./UmpireManager";
import { MatchSetup } from "./MatchSetup";

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
    <div>
      <MatchSetup
        setMatchOptions={(matchOptions) => {
          setMatchOptions(matchOptions);
          setDemoKey(demoKey + 1);
        }}
      />

      {matchOptions && <UmpireManager key={demoKey} options={matchOptions} />}
    </div>
  );
}
