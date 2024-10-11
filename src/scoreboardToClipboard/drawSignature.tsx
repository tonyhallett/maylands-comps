import { FontFormat, Signature } from "./generateScorecard";
import { fillTextWithColor } from "./helpers/fillTextWithColor";
import { getSuffixedTitle } from "./helpers/getSuffixedTitle";
import { measureText } from "./helpers/measureTexts";

export function drawSignature(
  ctx: CanvasRenderingContext2D,
  fontFormat: FontFormat,
  fontFamily: string,
  titleColor: string,
  availableWidth: number,
  homeSignature: Signature,
  awaySignature?: Signature,
) {
  const { canvasFont, metrics, text } = measureText(
    ctx,
    fontFormat,
    fontFamily,
    getSuffixedTitle("Signed"),
  );
  ctx.translate(0, homeSignature.height);

  const drawTitleAndSignature = (signature: Signature | undefined) => {
    fillTextWithColor(ctx, text, 0, 0, titleColor, canvasFont);

    if (signature) {
      ctx.save();
      ctx.translate(metrics.width + 5, 0);
      ctx.drawImage(
        signature,
        0,
        -signature.height,
        signature.width,
        signature.height,
      );
      ctx.restore();
    }
  };

  drawTitleAndSignature(homeSignature);

  ctx.translate(availableWidth / 2, 0);
  drawTitleAndSignature(awaySignature);
}
