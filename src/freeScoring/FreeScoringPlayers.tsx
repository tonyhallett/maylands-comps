import { FreeScoringPlayersAndTeamsLoaderData } from "./route";
import { useLoaderDataT } from "./useLoaderDataT";

export default function FreeScoringPlayers() {
  const { players, teams } =
    useLoaderDataT<FreeScoringPlayersAndTeamsLoaderData>();

  return (
    <>
      <div>{`Num players ${players.length}`}</div>
      <div>{`Num teams ${teams.length}`}</div>
    </>
  );
}
