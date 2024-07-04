import {
  CSSProperties,
  PropsWithChildren,
  ReactNode,
  useMemo,
  useState,
} from "react";
import { keyframes } from "@mui/system";
import { Box } from "@mui/material";
import { Keyframes } from "@emotion/react";

interface FlipKeyframes {
  flipHeads: Keyframes;
  flipTails: Keyframes;
}

// in case it is an issue that the keyframes are being created on every render
const keyframesLookup = new Map<number, FlipKeyframes>();
function getFlipKeyframes(numRotations: number) {
  const cached = keyframesLookup.get(numRotations);
  if (cached) {
    return cached;
  }

  const flipHeads = keyframes`
    from {
        transform: rotateY(0deg);
    }
    to {
        transform: rotateY(${numRotations * 180}deg);
    }
`;

  const flipTails = keyframes`
    from {
        transform: rotateY(0deg);
    }
    to {
        transform: rotateY(${(numRotations + 1) * 180}deg);
  }
`;
  const keyFrames = { flipHeads, flipTails };

  keyframesLookup.set(numRotations, keyFrames);
  return keyFrames;
}

export function ClickCoinTosser({
  headsSide,
  tailsSide,
  width,
  height,
  flipDurationMilliseconds,
  numRotations,
}: CoinSides & { flipDurationMilliseconds: number; numRotations: number }) {
  const [tossState, toss] = useCoinToss();
  const { flipHeads, flipTails } = useMemo(
    () => getFlipKeyframes(numRotations),
    [numRotations],
  );
  return (
    <div onClick={toss}>
      <Coin
        key={Math.random()}
        tossState={tossState}
        headsSide={headsSide}
        tailsSide={tailsSide}
        width={width}
        height={height}
        flipDurationMilliseconds={flipDurationMilliseconds}
        flipHeads={flipHeads}
        flipTails={flipTails}
      />
    </div>
  );
}

interface Toss {
  heads: boolean;
}

function useCoinToss() {
  const [tossState, setTossState] = useState<Toss | undefined>(undefined);
  const toss = () => {
    setTossState({ heads: Math.random() > 0.5 });
  };
  return [tossState, toss] as const;
}

interface CoinSides {
  headsSide: ReactNode;
  tailsSide: ReactNode;
  width: CSSProperties["width"];
  height: CSSProperties["height"];
}

function Coin({
  tossState,
  headsSide,
  tailsSide,
  width,
  height,
  flipDurationMilliseconds,
  flipHeads,
  flipTails,
}: {
  tossState: Toss;
  flipDurationMilliseconds: number;
  flipHeads: Keyframes;
  flipTails: Keyframes;
} & CoinSides) {
  return (
    <Box
      sx={{
        width,
        height,
        transformStyle: "preserve-3d",
        animation:
          tossState === undefined
            ? undefined
            : `${tossState.heads ? flipHeads : flipTails} ${flipDurationMilliseconds}ms ease-out forwards`,
      }}
    >
      <Side isTop>{headsSide}</Side>
      <Side isTop={false}>{tailsSide}</Side>
    </Box>
  );
}

interface SideProps {
  isTop: boolean;
}

function Side({ children, isTop }: PropsWithChildren<SideProps>) {
  return (
    <div
      style={{
        position: "fixed",
        transform: `rotateY(${isTop ? 0 : 180}deg)`,
        backfaceVisibility: "hidden",
        zIndex: isTop ? 100 : 0,
      }}
    >
      {children}
    </div>
  );
}
