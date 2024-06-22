import { Box, Card } from "@mui/material";
import { ServerReceiverPlayer } from "./ServerReceiverPlayer";
import { PlayerPrefix } from "./PlayerPrefix";

export interface TeamViewProps {
  player1: PlayerPrefix;
  player2: PlayerPrefix | undefined;
}

export function TeamView({ player1, player2 }: TeamViewProps) {
  return (
    <Card variant="outlined">
      <Box p={1}>
        <ServerReceiverPlayer name={player1.name} prefix={player1.prefix} />
        {player2 && (
          <ServerReceiverPlayer name={player2.name} prefix={player2.prefix} />
        )}
      </Box>
    </Card>
  );
}
