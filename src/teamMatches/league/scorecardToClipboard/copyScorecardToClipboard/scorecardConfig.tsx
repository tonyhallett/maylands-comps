import { ScorecardConfig } from "../generateScorecard";

export const scorecardConfig: ScorecardConfig = {
  fontFamily: "Times New Roman",
  penColors: {
    title: "black",
    entry: "blue",
  },
  backgroundColor: "white",
  paddingTop: 20,
  paddingLeftRight: 20,
  heightWithoutSignatures: 500,
  leagueAndDate: {
    marginBottom: 20,
    league: {
      size: 18,
      isBold: true,
      x: 100,
    },
    date: {
      x: 488,
      titleMarginRight: 5,
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
  teams: {
    homeTeam: {
      marginBottom: 30,
      titleEntryMarginBottom: 10,
      title: {
        size: 16,
        isBold: true,
      },
      titleMarginRight: 5,
      entry: {
        size: 16,
        isBold: false,
      },
    },
    awayTeam: {
      marginBottom: 30,
      titleEntryMarginBottom: 10,
      titleMarginRight: 5,
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
      titleMarginRight: 5,
      entryMarginRight: 5,
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
    marginBottom: 20,
    paddingTopBottom: 5,
    game: {
      gamePointsPadding: 5,
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
  signature: {
    title: {
      size: 14,
      isBold: true,
    },
    titleMarginRight: 5,
  },
  resultWon: {
    marginBottom: 20,
    result: {
      title: {
        size: 14,
        isBold: true,
      },
      titleMarginRight: 5,
      entryMarginRight: 5,
      entry: {
        size: 14,
        isBold: false,
      },
    },
    won: {
      titleMarginRight: 5,
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
};
