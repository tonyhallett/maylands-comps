import { GameScore, GameWonState } from "../../../../../umpire";
import { getGameWonState } from "../../../../../umpire/getGameWonState";
import { Score } from "../../../scorecardToClipboard/drawTable";
import { ScoreKey } from "./ScoreKey";

const removeZeroZeroScores = (gameScores: GameScore[]) =>
  gameScores.filter(
    (gameScore) =>
      !(gameScore.team1Points === 0 && gameScore.team2Points === 0),
  );

interface ConcededScores {
  scores: Score[];
  homeWinCount: number;
  awayWinCount: number;
}

const concededGameNotWon = (
  acc: ConcededScores,
  homeConcede: boolean,
  gameScore: GameScore,
) => {
  const { scoreConcededKey, scoreNotConcededKey } = getConcedeKeys(homeConcede);
  if (homeConcede) {
    acc.awayWinCount++;
  } else {
    acc.homeWinCount++;
  }
  const concedePoints = homeConcede
    ? gameScore.team1Points
    : gameScore.team2Points;

  let notConcedePoints = 11;
  if (concedePoints >= 10) {
    notConcedePoints = concedePoints + 2;
  }
  const score = {
    [scoreConcededKey]: concedePoints,
    [scoreNotConcededKey]: notConcedePoints,
  } as unknown as Score;
  acc.scores.push(score);
};

const concededGameWon = (
  acc: ConcededScores,
  homeWon: boolean,
  gameScore: GameScore,
) => {
  if (homeWon) {
    acc.homeWinCount++;
  } else {
    acc.awayWinCount++;
  }
  const score: Score = {
    home: gameScore.team1Points,
    away: gameScore.team2Points,
  };
  acc.scores.push(score);
};

const getConcededScoresForGamesPlayed = (
  homeConcede: boolean,
  gameScores: GameScore[],
): ConcededScores => {
  return gameScores.reduce<ConcededScores>(
    (acc, gameScore) => {
      const gameWonState = getGameWonState(
        gameScore.team1Points,
        gameScore.team2Points,
        11,
        true,
      );
      if (gameWonState === GameWonState.NotWon) {
        concededGameNotWon(acc, homeConcede, gameScore);
      } else {
        concededGameWon(acc, gameWonState === GameWonState.Team1Won, gameScore);
      }
      return acc;
    },
    {
      scores: [],
      homeWinCount: 0,
      awayWinCount: 0,
    },
  );
};

export function getConcededScores(
  gameScores: GameScore[],
  homeConcede: boolean,
): Score[] {
  //should only be the one to filter out
  gameScores = removeZeroZeroScores(gameScores);

  const { scores, homeWinCount, awayWinCount } =
    getConcededScoresForGamesPlayed(homeConcede, gameScores);

  addScoresForConcededToLose(homeConcede, homeWinCount, awayWinCount, scores);
  return scores;
}

function getConcedeKeys(homeConcede: boolean) {
  const scoreConcededKey: ScoreKey = homeConcede ? "home" : "away";
  const scoreNotConcededKey: ScoreKey = homeConcede ? "away" : "home";
  return { scoreConcededKey, scoreNotConcededKey };
}

function addScoresForConcededToLose(
  homeConcede: boolean,
  homeWinCount: number,
  awayWinCount: number,
  scores: Score[],
) {
  const { scoreConcededKey, scoreNotConcededKey } = getConcedeKeys(homeConcede);
  const nonConcededWinCount = homeConcede ? awayWinCount : homeWinCount;
  let remaining = 3 - nonConcededWinCount;
  while (remaining > 0) {
    scores.push({
      [scoreConcededKey]: 0,
      [scoreNotConcededKey]: 11,
    } as unknown as Score);
    remaining--;
  }
}
