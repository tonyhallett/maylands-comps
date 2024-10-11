import {
  ResultsModel,
  TeamGamesWonState,
} from "./scoresheet/model/getResultsModel";
import { GameScore } from "../../../../umpire";
import { GameWithoutOrderOfPlay } from "../../../../scoreboardToClipboard/copyToClipboardScorecard";
import { Game } from "../../../../scoreboardToClipboard/drawTable";
import { leagueMatchPlayersPositionDisplays } from "../format/singlesLeagueMatchPlayers";
import { isNotUndefined } from "../../../../helpers/isNotTypeGuards";
import { getTeamForfeitedScores } from "./getTeamForfeitedScores";
import { getConcededScores } from "./getConcededScores";

function getSurname(name: string) {
  const parts = name.split(" ");
  return parts[parts.length - 1];
}
function getWinnerSurname(
  allSurnames: string[],
  winnerSurname: string,
  positionIdentifier: string,
): string {
  if (allSurnames.filter((surname) => surname === winnerSurname).length === 1) {
    return winnerSurname;
  }
  return `${winnerSurname} ( ${positionIdentifier} )`;
}
const getScorecardGame = (
  resultsModel: ResultsModel,
  homeTeamName: string,
  awayTeamName: string,
  gameScores: GameScore[],
  getHomeWinnerSurname: () => string,
  getAwayWinnerSurname: () => string,
) => {
  const homeState = resultsModel.home.state;
  const awayState = resultsModel.away.state;

  let winnersSurname = "";
  if (
    homeState === TeamGamesWonState.Forfeited &&
    awayState === TeamGamesWonState.Forfeited
  ) {
    return {
      scores: [],
      winnersSurname: "---",
    };
  }
  if (homeState === TeamGamesWonState.Forfeited) {
    return {
      scores: getTeamForfeitedScores(true),
      winnersSurname: awayTeamName,
    };
  }
  if (awayState === TeamGamesWonState.Forfeited) {
    return {
      scores: getTeamForfeitedScores(false),
      winnersSurname: homeTeamName,
    };
  }

  if (homeState === TeamGamesWonState.MatchWon) {
    winnersSurname = getHomeWinnerSurname();
  } else if (awayState === TeamGamesWonState.MatchWon) {
    winnersSurname = getAwayWinnerSurname();
  }
  if (
    homeState === TeamGamesWonState.Conceded ||
    awayState === TeamGamesWonState.Conceded
  ) {
    const homeConcede = homeState === TeamGamesWonState.Conceded;

    const scores = getConcededScores(gameScores, homeConcede);
    return {
      scores,
      winnersSurname,
    };
  }
  const gameWithoutOrderOfPlay: GameWithoutOrderOfPlay = {
    scores: gameScores.map((gameScore) => {
      return {
        home: gameScore.team1Points,
        away: gameScore.team2Points,
      };
    }),
    winnersSurname,
  };
  return gameWithoutOrderOfPlay;
};
type PositionIdentifiers = [string, string];
export type DoublesGamePositionIdentifiers = {
  home: PositionIdentifiers;
  away: PositionIdentifiers;
};
export function getScorecardGames(
  homePlayerNames: (string | undefined)[],
  awayPlayerNames: (string | undefined)[],
  allGameScores: GameScore[][],
  resultsModels: ResultsModel[],
  homeTeamName: string,
  awayTeamName: string,
  doublesGamePositionIdentifiers: DoublesGamePositionIdentifiers | undefined,
) {
  const allNames = homePlayerNames
    .filter(isNotUndefined)
    .concat(awayPlayerNames.filter(isNotUndefined));
  const allSurnames = allNames.map((name) => {
    return getSurname(name);
  });
  const doublesGameScores = allGameScores[9];
  const doublesResultsModel = resultsModels[9];

  let doublesOrderOfPlay = " V ";
  if (doublesGamePositionIdentifiers !== undefined) {
    doublesOrderOfPlay = `${doublesGamePositionIdentifiers.home[0]}${doublesGamePositionIdentifiers.home[1]} V ${doublesGamePositionIdentifiers.away[0]}${doublesGamePositionIdentifiers.away[1]}`;
  }
  const doublesGame: Game = {
    orderOfPlay: doublesOrderOfPlay,
    ...getScorecardGame(
      doublesResultsModel,
      homeTeamName,
      awayTeamName,
      doublesGameScores,
      () => homeTeamName,
      () => awayTeamName,
    ),
  };

  const singles: GameWithoutOrderOfPlay[] = allGameScores
    .slice(0, 9)
    .map((gameScores, index) => {
      const playerPositionDisplays = leagueMatchPlayersPositionDisplays[index];
      const resultsModel = resultsModels[index];
      return getScorecardGame(
        resultsModel,
        homeTeamName,
        awayTeamName,
        gameScores,
        () => {
          return getWinnerSurname(
            allSurnames,
            getSurname(
              homePlayerNames[
                playerPositionDisplays.homePositionDisplay.position
              ]!,
            ),
            playerPositionDisplays.homePositionDisplay.display,
          );
        },
        () => {
          return getWinnerSurname(
            allSurnames,
            getSurname(
              awayPlayerNames[
                playerPositionDisplays.awayPositionDisplay.position
              ]!,
            ),
            playerPositionDisplays.awayPositionDisplay.display,
          );
        },
      );
    });

  const games: {
    singles: GameWithoutOrderOfPlay[];
    doubles: Game;
  } = {
    singles,
    doubles: doublesGame,
  };
  return games;
}
