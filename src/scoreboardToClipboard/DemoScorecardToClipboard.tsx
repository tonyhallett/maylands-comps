import { generateScorecard } from "./generateScorecard";

export function DemoScorecardToClipboard() {
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
    {
      name: "Home team",
      players: ["Chinmai Aditya Baddepuram", "Player 2"],
    },
    {
      name: "Away team",
      players: ["Player 3", "Player 4"],
    },
    [
      {
        orderOfPlay: "A V X",
        scores: [
          { home: 11, away: 9 },
          { home: 11, away: 9 },
          { home: 11, away: 9 },
        ],
        winnersSurname: "Petcu-Cislaru",
      },
      {
        orderOfPlay: "B V Y",
        scores: [
          { home: 11, away: 9 },
          { home: 11, away: 9 },
          { home: 11, away: 9 },
        ],
        winnersSurname: "Player 2",
      },
      {
        orderOfPlay: "C V Z",
        scores: [
          { home: 11, away: 9 },
          { home: 11, away: 9 },
          { home: 11, away: 9 },
        ],
        winnersSurname: "Player 2",
      },
      {
        orderOfPlay: "B V X",
        scores: [
          { home: 11, away: 9 },
          { home: 11, away: 9 },
          { home: 11, away: 9 },
        ],
        winnersSurname: "Player 2",
      },
      {
        orderOfPlay: "A V Z",
        scores: [
          { home: 11, away: 9 },
          { home: 11, away: 9 },
          { home: 11, away: 9 },
        ],
        winnersSurname: "Player 2",
      },
      {
        orderOfPlay: "C V Y",
        scores: [
          { home: 11, away: 9 },
          { home: 11, away: 9 },
          { home: 11, away: 9 },
        ],
        winnersSurname: "Player 2",
      },
      {
        orderOfPlay: "B V Z",
        scores: [
          { home: 11, away: 9 },
          { home: 11, away: 9 },
          { home: 11, away: 9 },
        ],
        winnersSurname: "Player 2",
      },
      {
        orderOfPlay: "C V X",
        scores: [
          { home: 11, away: 9 },
          { home: 11, away: 9 },
          { home: 11, away: 9 },
        ],
        winnersSurname: "Player 2",
      },
      {
        orderOfPlay: "A V Y",
        scores: [
          { home: 11, away: 9 },
          { home: 11, away: 9 },
          { home: 11, away: 9 },
        ],
        winnersSurname: "Player 2",
      },
      // doubles
      {
        orderOfPlay: "AB V XY",
        scores: [
          { home: 11, away: 9 },
          { home: 11, away: 9 },
          { home: 11, away: 9 },
        ],
        winnersSurname: "Player 2",
      },
    ],
    "MG 6",
    "8 - 2",
    document.createElement("img"),
  );

  const dataUrl = canvas.toDataURL();
  return <img src={dataUrl} />;
}
