import { Signature, SignatureConfig } from "./generateScorecard";
import { fillTextWithColor } from "./helpers/fillTextWithColor";
import { getSuffixedTitle } from "./helpers/getSuffixedTitle";
import { measureText } from "./helpers/measureTexts";
import { saveRestore } from "./helpers/saveRestore";

export function getMaxHeight(
  homeSignature: Signature,
  awaySignature: Signature,
) {
  return Math.max(homeSignature?.height ?? 0, awaySignature?.height ?? 0);
}

export function drawSignature(
  ctx: CanvasRenderingContext2D,
  config: SignatureConfig,
  fontFamily: string,
  titleColor: string,
  availableWidth: number,
  homeSignature: Signature,
  awaySignature: Signature,
) {
  const { canvasFont, metrics, text } = measureText(
    ctx,
    config.title,
    fontFamily,
    getSuffixedTitle("Signed"),
  );
  ctx.translate(0, getMaxHeight(homeSignature, awaySignature));

  const drawTitleAndSignature = (signature: Signature) => {
    fillTextWithColor(ctx, text, 0, 0, titleColor, canvasFont);

    if (signature) {
      saveRestore(ctx, () => {
        ctx.translate(metrics.width + config.titleMarginRight, 0);
        ctx.drawImage(
          signature,
          0,
          -signature.height,
          signature.width,
          signature.height,
        );
      });
    }
  };

  drawTitleAndSignature(homeSignature);

  ctx.translate(availableWidth / 2, 0);

  drawTitleAndSignature(awaySignature);
}
