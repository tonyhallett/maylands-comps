import { canvasToBlobAsync } from "../teamMatches/league/play/league-match-view/screenshot";
import { Game } from "./drawTable";
import { Team } from "./drawTeam";
import { generateScorecard } from "./generateScorecard";

export function getScore(highest: number, lowest?: number) {
  return `${highest} - ${lowest === undefined ? highest : lowest}`;
}
export type GameWithoutOrderOfPlay = Omit<Game, "orderOfPlay">;

export async function copyToClipboardScorecard(
  homeTeam: Team,
  awayTeam: Team,
  homeTeamScore: number,
  awayTeamScore: number,
  games: GameWithoutOrderOfPlay[],
  doubles: Game,
) {
  let result = "";
  let score = "";
  if (homeTeamScore === awayTeamScore) {
    result = "Draw";
    score = getScore(homeTeamScore);
  } else {
    // will restrict to initials or via drawing
    result = homeTeamScore > awayTeamScore ? homeTeam.name : awayTeam.name;
    const winnerScore = Math.max(homeTeamScore, awayTeamScore);
    const loserScore = Math.min(homeTeamScore, awayTeamScore);
    score = getScore(winnerScore, loserScore);
  }
  const canvas = generateScorecard(
    {
      fontFamily: "Times New Roman",
      penColors: {
        title: "black",
        entry: "blue",
      },
      backgroundColor: "white",
      leagueAndDate: {
        paddingTopBottom: 20,
        league: {
          size: 18,
          isBold: true,
          x: 100,
        },
        date: {
          x: 488,
          title: {
            size: 14,
            isBold: true,
          },
          entry: {
            size: 14,
            isBold: false,
          },
        },
      },
      fontFomat: {
        homeTeam: {
          title: {
            size: 16,
            isBold: true,
          },
          entry: {
            size: 16,
            isBold: false,
          },
        },
        awayTeam: {
          title: {
            size: 16,
            isBold: true,
          },
          entry: {
            size: 16,
            isBold: false,
          },
        },
        players: {
          title: {
            size: 14,
            isBold: true,
          },
          entry: {
            size: 14,
            isBold: false,
          },
        },
      },
      table: {
        paddingTopBottom: 5,
        gridLineSize: 2, // needs to be an even number
        game: {
          header: {
            size: 11,
            isBold: true,
          },
          row: {
            size: 11,
            isBold: false,
          },
          width: 80,
        },
        orderOfPlay: {
          header: {
            size: 11,
            isBold: true,
          },
          row: {
            size: 11,
            isBold: true,
          },
          width: 85,
        },
        winnersSurname: {
          header: {
            size: 11,
            isBold: true,
          },
          row: {
            size: 11,
            isBold: false,
          },
          width: 211,
        },
      },
      signatureTitle: {
        size: 14,
        isBold: true,
      },
      result: {
        title: {
          size: 14,
          isBold: true,
        },
        entry: {
          size: 14,
          isBold: false,
        },
      },
      won: {
        title: {
          size: 14,
          isBold: true,
        },
        entry: {
          size: 14,
          isBold: false,
        },
      },
    },
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
    document.getElementById("homeSignature")! as HTMLImageElement,
    document.getElementById("awaySignature")! as HTMLImageElement,
  );
  const blob = await canvasToBlobAsync(canvas);
  navigator.clipboard
    .write([new ClipboardItem({ "image/png": blob! })])
    .catch(() => {});
}
