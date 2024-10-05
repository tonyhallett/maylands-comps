import { DbMatch } from "../../../../firebase/rtb/match/dbMatch";

export const getIsManualInput = (dbMatch: DbMatch) => {
  if (dbMatch.gameScores) {
    const firstGame = dbMatch.gameScores["0"];
    const hasScored = firstGame.team1Points + firstGame.team2Points > 0;
    return hasScored && dbMatch.pointHistory["0"] === "empty";
  } else {
    return dbMatch.team1Score.points + dbMatch.team2Score.points > 0;
  }
};
