import { useEffect, useRef, useState } from "react";
import NumberInput from "./NumberInput";
import { Button, Divider } from "@mui/material";

interface ManualScoresInputProps {
  bestOf: number;
  upTo: number;
  clearBy2: boolean;
  submit: (gameScores: GameScoreInput[]) => void;
  // could have initial game scores
}
export interface GameScoreInput {
  homePoints: number;
  awayPoints: number;
}
interface ManualScoresInputState {
  gameScores: GameScoreInput[];
}
export function ManualScoresInput({
  bestOf,
  upTo,
  clearBy2,
  submit,
}: ManualScoresInputProps) {
  const homeRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const [shouldFocusHome, setShouldFocusHome] = useState(true);
  const [possiblyFocusNext, setPossiblyFocusNext] = useState(false);
  useEffect(() => {
    if (shouldFocusHome) {
      homeRef.current?.focus();
      setShouldFocusHome(false);
    }
  }, [setShouldFocusHome, shouldFocusHome]);
  const [state, setState] = useState<ManualScoresInputState>({
    gameScores: [
      {
        homePoints: 0,
        awayPoints: 0,
      },
    ],
  });
  const lastGameScore = state.gameScores[state.gameScores.length - 1];
  const pointsChanged = (isHome: boolean, points: number | null) => {
    if (points === null) {
      return;
    }
    const gameScores = [...state.gameScores];
    gameScores[gameScores.length - 1] = {
      ...gameScores[gameScores.length - 1],
      [isHome ? "homePoints" : "awayPoints"]: points,
    };
    setState((prev) => {
      return {
        ...prev,
        gameScores,
      };
    });
    if (!isHome) {
      setPossiblyFocusNext(true);
    }
  };

  const scoredUpTo =
    lastGameScore.homePoints >= upTo || lastGameScore.awayPoints >= upTo;

  const isWinScore = (homePoints: number, awayPoints: number) => {
    const difference = Math.abs(homePoints - awayPoints);
    const maxPoints = Math.max(homePoints, awayPoints);
    const expectedMinDifference = clearBy2 ? 2 : 1;
    if (maxPoints === upTo) {
      return difference >= expectedMinDifference;
    }
    return difference === expectedMinDifference;
  };

  const matchNotWon = () => {
    const currentScore = state.gameScores.reduce(
      (acc, gameScore) => {
        const addPointToHome =
          gameScore.homePoints > gameScore.awayPoints ? 1 : 0;
        const addPointToAway =
          gameScore.awayPoints > gameScore.homePoints ? 1 : 0;
        return {
          homePoints: acc.homePoints + addPointToHome,
          awayPoints: acc.awayPoints + addPointToAway,
        };
      },
      { homePoints: 0, awayPoints: 0 },
    );
    const maxPoints = Math.max(
      currentScore.homePoints,
      currentScore.awayPoints,
    );
    return maxPoints < (bestOf + 1) / 2;
  };

  const canGoNext =
    scoredUpTo &&
    isWinScore(lastGameScore.homePoints, lastGameScore.awayPoints) &&
    matchNotWon();

  useEffect(() => {
    if (possiblyFocusNext) {
      if (canGoNext) {
        nextRef.current?.focus();
      }
      setPossiblyFocusNext(false);
    }
  }, [setPossiblyFocusNext, possiblyFocusNext, canGoNext]);

  const next = () => {
    setShouldFocusHome(true);
    setState((prev) => {
      return {
        ...prev,
        gameScores: [
          ...prev.gameScores,
          {
            homePoints: 0,
            awayPoints: 0,
          },
        ],
      };
    });
  };

  const canDelete = state.gameScores.length > 1;
  const deleteGame = () => {
    setState((prev) => {
      return {
        ...prev,
        gameScores: state.gameScores.slice(0, state.gameScores.length - 1),
      };
    });
    setShouldFocusHome(true);
  };

  const scoredAPoint =
    lastGameScore.homePoints > 0 || lastGameScore.awayPoints > 0;

  const canSubmit = scoredUpTo
    ? isWinScore(lastGameScore.homePoints, lastGameScore.awayPoints)
    : scoredAPoint;

  return (
    <>
      <div style={{ marginBottom: 10 }}>
        <div>
          <span style={{ marginRight: 5 }}>H</span>
          {state.gameScores.map((gameScore, index) => {
            return (
              <span
                key={index}
                style={{
                  marginRight: 2,
                  width: "2em",
                  display: "inline-block",
                  textAlign: "right",
                }}
              >
                {gameScore.homePoints}
              </span>
            );
          })}
        </div>
        <div>
          <span style={{ marginRight: 5 }}>A</span>
          {state.gameScores.map((gameScore, index) => {
            return (
              <span
                key={index}
                style={{
                  marginRight: 2,
                  width: "2em",
                  display: "inline-block",
                  textAlign: "right",
                }}
              >
                {gameScore.awayPoints}
              </span>
            );
          })}
        </div>

        <Divider />
      </div>

      <div>
        <div>Home</div>
        <NumberInput
          key="H"
          min={0}
          value={lastGameScore.homePoints}
          slotProps={{
            input: {
              ref: homeRef,
            },
          }}
          onChange={(evt, homePoints) => {
            pointsChanged(true, homePoints);
          }}
        />
        <div>Away</div>
        <NumberInput
          key="A"
          min={0}
          value={lastGameScore.awayPoints}
          onChange={(evt, awayPoints) => {
            pointsChanged(false, awayPoints);
          }}
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <Divider />
        <Button ref={nextRef} onClick={next} disabled={!canGoNext}>
          Next
        </Button>
        <Button onClick={deleteGame} disabled={!canDelete}>
          Delete
        </Button>
        <Button onClick={() => submit(state.gameScores)} disabled={!canSubmit}>
          Submit
        </Button>
      </div>
    </>
  );
}
// should adjust the max as go
