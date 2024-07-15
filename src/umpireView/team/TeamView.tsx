import { Box, Card } from "@mui/material";
import { ServerReceiverPlayer } from "./ServerReceiverPlayer";
import { PlayerPrefix } from "./PlayerPrefix";

export interface TeamViewProps {
  player1: PlayerPrefix;
  player2: PlayerPrefix | undefined;
  player1Bottom: boolean;
}

export function TeamView({ player1, player2, player1Bottom }: TeamViewProps) {
  const serverReceiverPlayer1 = (
    <ServerReceiverPlayer name={player1.name} prefix={player1.prefix} />
  );
  const serverReceiverPlayer2 = player2 && (
    <ServerReceiverPlayer name={player2.name} prefix={player2.prefix} />
  );
  return (
    <Card variant="outlined">
      <Box p={1}>
        {!player1Bottom ? serverReceiverPlayer1 : serverReceiverPlayer2}
        {player1Bottom ? serverReceiverPlayer1 : serverReceiverPlayer2}
      </Box>
    </Card>
  );
}
