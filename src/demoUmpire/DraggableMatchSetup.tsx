import { MatchSetup } from "./MatchSetup";
import { MatchOptions } from "./UmpireManager";
import { CardContent } from "@mui/material";
import { DraggableCard } from "./DraggableCard";

export default function DraggableMatchSetup({
  setMatchOptions,
}: {
  setMatchOptions: (matchOptions: MatchOptions) => void;
}) {
  return (
    <DraggableCard
      cardStyle={{
        position: "fixed",
        bottom: 10,
        left: 10,
      }}
    >
      <CardContent>
        <MatchSetup setMatchOptions={setMatchOptions} />
      </CardContent>
    </DraggableCard>
  );
}
