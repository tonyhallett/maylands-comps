import { FontFormat, Signature } from "./generateScorecard";
import { fillTextWithColor } from "./helpers/fillTextWithColor";
import { getScorecardCanvasFont } from "./helpers/getCanvasFont";
import { getSuffixedTitle } from "./helpers/getSuffixedTitle";

export function drawSignature(
  ctx: CanvasRenderingContext2D,
  fontFormat: FontFormat,
  fontFamily: string,
  titleColor: string,
  availableWidth: number,
  homeSignature: Signature,
  awaySignature?: Signature,
) {
  const canvasFont = getScorecardCanvasFont(fontFormat, fontFamily);
  ctx.font = canvasFont;
  ctx.fillStyle = titleColor;
  const signatureTitle = getSuffixedTitle("Signed");
  const signatureTitleMetrics = ctx.measureText(signatureTitle);

  ctx.translate(0, homeSignature.height);

  const drawTitleAndSignature = (signature: Signature | undefined) => {
    fillTextWithColor(ctx, signatureTitle, 0, 0, titleColor, canvasFont);

    if (signature) {
      ctx.save();
      ctx.translate(signatureTitleMetrics.width + 5, 0);
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
