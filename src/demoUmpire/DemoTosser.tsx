import { CSSProperties, PropsWithChildren, ReactNode, useState } from "react";
import { keyframes } from "@mui/system";
import { Box } from "@mui/material";

const rotations = 8;
function getFlipKeyframes(numRotations: number) {
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
  return { flipHeads, flipTails };
}

const { flipHeads, flipTails } = getFlipKeyframes(rotations);

interface CoinSidesUrls {
  headsSideUrl: string;
  tailsSideUrl: string;
}

const coinSidesUrls: CoinSidesUrls[] = [
  {
    tailsSideUrl:
      "https://www.royalmint.com/globalassets/__rebrand/_structure/shop/editions/_historic-coins/_product-image/hisgssf-george-i-silver-shillings-reverse.jpg",
    headsSideUrl:
      "https://www.royalmint.com/globalassets/__rebrand/_structure/shop/editions/_historic-coins/_product-image/hisgssf-george-i-silver-shillings-obverse.jpg",
  },
  // unfortunately has white surround
  /* {
    headsSideUrl:
      "https://www.royalmint.com/globalassets/consumer/_campaigns/2023/coronation/product-images/50p/uk23k50bu_50p_brilliant_uncirculated_coin_obverse.jpg",
    tailsSideUrl:
      "https://www.royalmint.com/globalassets/consumer/_campaigns/2023/coronation/product-images/50p/uk23k50bu_50p_brilliant_uncirculated_coin_reverse.jpg",
  }, */
  {
    headsSideUrl:
      "https://www.royalmint.com/globalassets/bullion/images/products/coronation/bkcc23gt-obverse.png",
    tailsSideUrl:
      "https://www.royalmint.com/globalassets/bullion/images/products/coronation/bkcc23gt-reverse.png",
  },
];

export function ClickKingTosser() {
  const coinSides = coinSidesUrls[1];
  return (
    <ClickCoinTosser
      width={96}
      height={96}
      headsSide={<img width={96} height={96} src={coinSides.headsSideUrl} />}
      tailsSide={<img width={96} height={96} src={coinSides.tailsSideUrl} />}
      flipDurationMilliseconds={2500}
    />
  );
}

export function ClickCoinTosser({
  headsSide,
  tailsSide,
  width,
  height,
  flipDurationMilliseconds,
}: CoinSides & { flipDurationMilliseconds: number }) {
  const [tossState, toss] = useCoinToss();
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
      />
    </div>
  );
}

export function Tosser({ headsSide, tailsSide, width, height }: CoinSides) {
  const [tossState, toss] = useCoinToss();
  return (
    <>
      <button onClick={toss}>Toss</button>
      <Coin
        key={Math.random()}
        tossState={tossState}
        headsSide={headsSide}
        tailsSide={tailsSide}
        width={width}
        height={height}
        flipDurationMilliseconds={2000}
      />
    </>
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
}: {
  tossState: Toss;
  flipDurationMilliseconds: number;
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
