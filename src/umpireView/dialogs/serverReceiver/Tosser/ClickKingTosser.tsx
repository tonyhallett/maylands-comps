import { ClickCoinTosser } from ".";

/*
    Do not use template literal !
    https://github.com/parcel-bundler/parcel/issues/7643

    Alternative is //import charlieHeads from "data-url:./CharlieHeads.png?as=webp&width=96&height=96";
*/
const charlieHeads = new URL(
  "./CharlieHeads.png?as=webp&width=96&height=96",
  import.meta.url,
);
const charlieTails = new URL(
  "./CharlieTails.png?as=webp&width=96&height=96",
  import.meta.url,
);
export function ClickKingTosser() {
  return (
    <ClickCoinTosser
      width={96}
      height={96}
      headsSide={<img src={charlieHeads.href} />}
      tailsSide={<img src={charlieTails.href} />}
      flipDurationMilliseconds={2500}
      numRotations={8}
    />
  );
}
