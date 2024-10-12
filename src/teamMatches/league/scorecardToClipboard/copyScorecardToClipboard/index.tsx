import { canvasToBlobAsync } from "../../../../helpers/screenshot";
import { Game } from "../drawTable";
import { Team } from "../drawTeam";
import { Signature, generateScorecard } from "../generateScorecard";
import { changeSignatureColors } from "./changeSignatureColors";
import { colorToRGB } from "./colorToRGB";
import { getResultAndScore } from "./getResultAndScore";
import { scorecardConfig } from "./scorecardConfig";

export type GameWithoutOrderOfPlay = Omit<Game, "orderOfPlay">;

export async function copyToClipboardScorecard(
  homeTeam: Team,
  awayTeam: Team,
  homeTeamScore: number,
  awayTeamScore: number,
  games: GameWithoutOrderOfPlay[],
  doubles: Game,
) {
  const { result, score } = getResultAndScore(
    homeTeamScore,
    awayTeamScore,
    homeTeam.name,
    awayTeam.name,
  );

  const { homeSignature, awaySignature } = await changeSignatureColors(
    document.getElementById("homeSignature") as Signature,
    document.getElementById("awaySignature") as Signature,
    colorToRGB(scorecardConfig.penColors.entry),
  );

  const canvas = generateScorecard(
    scorecardConfig,
    new Date(),
    homeTeam,
    awayTeam,
    [
      {
        orderOfPlay: "A V X",
        ...games[0],
      },
      {
        orderOfPlay: "B V Y",
        ...games[1],
      },
      {
        orderOfPlay: "C V Z",
        ...games[2],
      },
      {
        orderOfPlay: "B V X",
        ...games[3],
      },
      {
        orderOfPlay: "A V Z",
        ...games[4],
      },
      {
        orderOfPlay: "C V Y",
        ...games[5],
      },
      {
        orderOfPlay: "B V Z",
        ...games[6],
      },
      {
        orderOfPlay: "C V X",
        ...games[7],
      },
      {
        orderOfPlay: "A V Y",
        ...games[8],
      },
      // doubles
      doubles,
    ],
    result,
    score,
    homeSignature,
    awaySignature,
  );
  const blob = await canvasToBlobAsync(canvas);
  navigator.clipboard
    .write([new ClipboardItem({ "image/png": blob! })])
    .catch(() => {});
}
