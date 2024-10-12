import { canvasToBlobAsync } from "../../../../helpers/screenshot";
import { Game } from "../drawTable";
import { Team } from "../drawTeam";
import { Signature, generateScorecard } from "../generateScorecard";
import { getResultAndScore } from "./getResultAndScore";
import { scorecardConfig } from "./scorecardConfig";

export type GameWithoutOrderOfPlay = Omit<Game, "orderOfPlay">;

/* interface RGB {
  r: number;
  g: number;
  b: number;
}
function changeSignatureColor(
  signature: HTMLImageElement,
  newRGB: RGB,
  replaceRGB?: RGB,
): HTMLImageElement {
  const canvas = document.createElement("canvas");
  canvas.width = signature.width;
  canvas.height = signature.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(signature, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  let replaced = false;
  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i + 0];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    const a = imageData.data[i + 3];
    if (replaceRGB === undefined) {
      if (a !== 0) {
        imageData.data[i + 0] = newRGB.r;
        imageData.data[i + 1] = newRGB.g;
        imageData.data[i + 2] = newRGB.b;
        replaced = true;
      }
    } else {
      if (r === replaceRGB.r && g === replaceRGB.g && b === replaceRGB.b) {
        imageData.data[i + 0] = newRGB.r;
        imageData.data[i + 1] = newRGB.g;
        imageData.data[i + 2] = newRGB.b;
        replaced = true;
      }
    }
  }
  if (replaced) {
    ctx.putImageData(imageData, 0, 0);
    signature.src = canvas.toDataURL();
  }
  return signature;
}

function changeSignatureColors(
  home: Signature,
  away: Signature,
  newRGB: RGB,
  replaceRGB?: RGB,
) {
  if (home) {
    home = changeSignatureColor(home, newRGB, replaceRGB);
  }
  if (away) {
    away = changeSignatureColor(away, newRGB, replaceRGB);
  }
  return { homeSignature: home, awaySignature: away };
}

function colorToRGB(color: string): RGB {
  throw new Error("Function not implemented.");
} */

/*
  is there a better of way of doing this ?
  How is the colour provided to the signature ?
  If I use the points then could I use the points to change the colour ?
*/

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
  /* 
  const { homeSignature, awaySignature } = changeSignatureColors(
    document.getElementById("homeSignature") as Signature,
    document.getElementById("awaySignature") as Signature,
    colorToRGB(scorecardConfig.penColors.entry),
  ); */
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
    document.getElementById("homeSignature") as Signature,
    document.getElementById("awaySignature") as Signature,
  );
  const blob = await canvasToBlobAsync(canvas);
  navigator.clipboard
    .write([new ClipboardItem({ "image/png": blob! })])
    .catch(() => {});
}
