import { KeyedSinglesMatchNamePositionDisplay } from "../../league-match-selection/renderScoresheet-type";

//#endregion
export function getPlayerNames(
  KeyedSinglesMatchNamePositionDisplays: KeyedSinglesMatchNamePositionDisplay[],
) {
  const firstGame = KeyedSinglesMatchNamePositionDisplays[0];
  const secondGame = KeyedSinglesMatchNamePositionDisplays[1];
  const thirdGame = KeyedSinglesMatchNamePositionDisplays[2];

  return {
    home: [
      firstGame.homePlayer1.name,
      secondGame.homePlayer1.name,
      thirdGame.homePlayer1.name,
    ],
    away: [
      firstGame.awayPlayer1.name,
      secondGame.awayPlayer1.name,
      thirdGame.awayPlayer1.name,
    ],
  };
}
