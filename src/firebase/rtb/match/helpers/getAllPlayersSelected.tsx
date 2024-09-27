import { DbMatch } from "../dbMatch";

export const getAreAllPlayersSelected = (match: DbMatch): boolean => {
  const player1sSelected =
    match.team1Player1Id !== undefined && match.team2Player1Id !== undefined;
  if (!player1sSelected) {
    return false;
  }
  if (match.isDoubles) {
    const player2sSelected =
      match.team1Player2Id !== undefined && match.team2Player2Id !== undefined;
    return player2sSelected;
  }
  return true;
};
