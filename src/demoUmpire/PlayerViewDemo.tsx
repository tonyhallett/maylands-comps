import PlayerView from "./PlayerView";
import { LeftRightMatchWinState } from "./UmpireView";

export default function PlayerViewDemo() {
  return (
    <PlayerView
      leftPlayer1Name="T Hallett"
      leftPlayer2Name={undefined}
      rightPlayer1Name="A Bonnici"
      rightPlayer2Name={undefined}
      matchWinState={LeftRightMatchWinState.NotWon}
      serverName="T Hallett"
      receiverName="A Bonnici"
      remainingServes={2}
      leftScore={{ games: 2, points: 8 }}
      rightScore={{ games: 1, points: 6 }}
    />
  );
}
