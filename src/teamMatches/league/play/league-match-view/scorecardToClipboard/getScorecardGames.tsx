import {
  ResultsModel,
  TeamGamesWonState,
} from "../scoresheet/model/getResultsModel";
import { GameScore } from "../../../../../umpire";
import { leagueMatchPlayersPositionDisplays } from "../../format/singlesLeagueMatchPlayers";
import { getTeamForfeitedScores } from "./getTeamForfeitedScores";
import { getConcededScores } from "./getConcededScores";
import { GameWithoutOrderOfPlay } from "../../../scorecardToClipboard/copyScorecardToClipboard";
import { Game } from "../../../scorecardToClipboard/drawTable";
import { getAllSurnames, getSurname, getWinnerSurname } from "./winnerSurname";
import { PlayerNameOrUndefineds } from "../../../scorecardToClipboard/drawTeam";

const getScorecardGame = (
  resultsModel: ResultsModel,
  homeTeamName: string,
  awayTeamName: string,
  gameScores: GameScore[],
  getHomeWinnerSurname: () => string,
  getAwayWinnerSurname: () => string,
): GameWithoutOrderOfPlay => {
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
  return {
    scores: gameScores.map((gameScore) => {
      return {
        home: gameScore.team1Points,
        away: gameScore.team2Points,
      };
    }),
    winnersSurname,
  };
};

type PositionIdentifiers = [string, string];
export type DoublesGamePositionIdentifiers = {
  home: PositionIdentifiers;
  away: PositionIdentifiers;
};

function getDoublesGame(
  doublesGamePositionIdentifiers: DoublesGamePositionIdentifiers | undefined,
  doublesResultsModel: ResultsModel,
  homeTeamName: string,
  awayTeamName: string,
  doublesGameScores: GameScore[],
) {
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
  return doublesGame;
}

export function getSinglesGames(
  homePlayerNames: PlayerNameOrUndefineds,
  awayPlayerNames: PlayerNameOrUndefineds,
  gameScores: GameScore[][],
  resultsModels: ResultsModel[],
  homeTeamName: string,
  awayTeamName: string,
) {
  const allSurnames = getAllSurnames(homePlayerNames, awayPlayerNames);
  const singles: GameWithoutOrderOfPlay[] = gameScores.map(
    (gameScores, index) => {
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
    },
  );
  return singles;
}

interface ScorecardGames {
  singles: GameWithoutOrderOfPlay[];
  doubles: Game;
}

export function getScorecardGames(
  homePlayerNames: PlayerNameOrUndefineds,
  awayPlayerNames: PlayerNameOrUndefineds,
  allGameScores: GameScore[][],
  resultsModels: ResultsModel[],
  homeTeamName: string,
  awayTeamName: string,
  doublesGamePositionIdentifiers: DoublesGamePositionIdentifiers | undefined,
): ScorecardGames {
  const doublesGame = getDoublesGame(
    doublesGamePositionIdentifiers,
    resultsModels[9],
    homeTeamName,
    awayTeamName,
    allGameScores[9],
  );

  const singles = getSinglesGames(
    homePlayerNames,
    awayPlayerNames,
    allGameScores.slice(0, 9),
    resultsModels,
    homeTeamName,
    awayTeamName,
  );

  const games: ScorecardGames = {
    singles,
    doubles: doublesGame,
  };
  return games;
}
