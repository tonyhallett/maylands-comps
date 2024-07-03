import { useState } from "react";
import { UmpireManagerOptions, UmpireManager } from "./UmpireManager";
import DraggableMatchSetup from "./DraggableMatchSetup";

export function DemoUmpire() {
  const [demoKey, setDemoKey] = useState(0);
  const [matchOptions, setMatchOptions] = useState<
    UmpireManagerOptions | undefined
  >(undefined);

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
