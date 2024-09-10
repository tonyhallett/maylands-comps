import {
  WidthHeight,
  CanvasFontMaxImpl,
  GetCanvasFontString,
} from "./CanvasFontMax";
import { Score } from "./Scoreboard";
import { getDigit } from "./getDigit";
import { DigitsMaxMetrics, getDigitsMax } from "./getDigitsMax";
import { inRange } from "./inRange";

interface Position {
  x: number;
  y: number;
}

interface PointsWonDigitSpacing {
  digitSpacing: number;
}

interface BaseCardInstructions {
  fontSize: number;
  strokeWidth: number;
  padding: number;
}
//#region measurement / instructions interfaces

interface BaseMeasurementCardInstructions extends BaseCardInstructions {
  metrics: DigitsMaxMetrics;
}

interface PointsWonCardInstruction
  extends BaseMeasurementCardInstructions,
    PointsWonDigitSpacing {}

interface PointsWonCardMeasurement {
  instructions: PointsWonCardInstruction;
  size: WidthHeight;
}

type GamesWonCardInstructions = BaseMeasurementCardInstructions;

interface GamesWonCardMeasurement {
  width: number;
  instructions: GamesWonCardInstructions;
}

interface UncalculatedInstructions {
  pointsWonCard: PointsWonCardInstruction;
  gamesWonCard: GamesWonCardInstructions;
  canvasSize: WidthHeight;
  cardGap: number;
  fullWidth: number;
  fullHeight: number;
}
//#endregion

//#region calculated instructions interfaces
interface DigitInstructions {
  0: Position;
  1: Position;
  2: Position;
  3: Position;
  4: Position;
  5: Position;
  6: Position;
  7: Position;
  8: Position;
  9: Position;
}

interface BaseCalculatedCardInstructions extends BaseCardInstructions {
  digitInstructions: {
    max: WidthHeight;
    digitInstructions: DigitInstructions;
  };
}

interface PointsWonCalculatedCardInstructions
  extends BaseCalculatedCardInstructions,
    PointsWonDigitSpacing {}
interface GameWonCalculatedCardInstructions
  extends BaseCalculatedCardInstructions {}

export interface CalculatedInstructions {
  cardGap: number;
  centerTranslation: Position;
  pointsWonCard: PointsWonCalculatedCardInstructions;
  gamesWonCard: GameWonCalculatedCardInstructions;
}
//#endregion

export class DemoScoreDrawer
  implements CanvasFontMaxImpl<CalculatedInstructions>
{
  score: Score;
  private gamesWonFontSizeProportion: number = 0.5;
  public cardBorderColor = "yellow";
  public digitColor = "limegreen";
  private uncalculatedInstructions: UncalculatedInstructions | undefined;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static getCardGap(maxDigit: WidthHeight) {
    return 20;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static getPadding(maxDigit: WidthHeight): number {
    return 20;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static getDoubleDigitSpacing(maxDigit: WidthHeight): number {
    return 20;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static getStrokeWidth(maxDigit: WidthHeight): number {
    return 10;
  }

  private static getPointsWonCardMeasurement(
    fontSize: number,
    context: CanvasRenderingContext2D,
    getCanvasFontString: GetCanvasFontString,
    canvasSize: WidthHeight,
  ): PointsWonCardMeasurement | undefined {
    const digitsMax = getDigitsMax(fontSize, context, getCanvasFontString);
    const max = digitsMax.max;
    if (!inRange(max, canvasSize)) {
      return undefined;
    }
    const doubleDigitSpacing = DemoScoreDrawer.getDoubleDigitSpacing(max);
    const padding = DemoScoreDrawer.getPadding(max);
    const strokeWidth = DemoScoreDrawer.getStrokeWidth(max);

    const paddingAndStroke = 2 * (strokeWidth + padding);
    const cardWidth = max.width * 2 + doubleDigitSpacing + paddingAndStroke;
    if (cardWidth > canvasSize.width) {
      return undefined;
    }
    const cardHeight = max.height + paddingAndStroke;
    if (cardHeight > canvasSize.height) {
      return undefined;
    }

    const pointsWonCardInstruction: PointsWonCardInstruction = {
      digitSpacing: doubleDigitSpacing,
      padding,
      strokeWidth,
      metrics: digitsMax,
      fontSize,
    };
    return {
      instructions: pointsWonCardInstruction,
      size: {
        width: cardWidth,
        height: cardHeight,
      },
    };
  }

  private getGamesWonCardMeasurement(
    fontSize: number,
    pointsWonStrokeWidth: number,
    pointsWonPadding: number,
    context: CanvasRenderingContext2D,
    getCanvasFontString: GetCanvasFontString,
  ): GamesWonCardMeasurement {
    fontSize = fontSize * this.gamesWonFontSizeProportion;
    const digitsMax = getDigitsMax(fontSize, context, getCanvasFontString);
    const max = digitsMax.max;
    const padding = pointsWonPadding;
    const strokeWidth = pointsWonStrokeWidth;
    const paddingAndStroke = 2 * (strokeWidth + padding);
    const cardWidth = max.width + paddingAndStroke;

    //const cardHeight = max.height + paddingAndStroke;

    return {
      instructions: {
        metrics: digitsMax,
        fontSize,
        padding,
        strokeWidth,
      },
      width: cardWidth, //tbd
    };
  }

  measurer(
    fontSize: number,
    canvasSize: WidthHeight,
    context: CanvasRenderingContext2D,
    getCanvasFontString: GetCanvasFontString,
  ): boolean {
    const pointsWonCardMeasurement =
      DemoScoreDrawer.getPointsWonCardMeasurement(
        fontSize,
        context,
        getCanvasFontString,
        canvasSize,
      );
    if (pointsWonCardMeasurement == undefined) {
      return true;
    }
    const cardGap = DemoScoreDrawer.getCardGap(
      pointsWonCardMeasurement.instructions.metrics.max,
    );
    const bothPointsWonCardWidth = 2 * pointsWonCardMeasurement.size.width;
    const bothPointsWonCardWidthAndGaps = bothPointsWonCardWidth + cardGap * 3;
    if (bothPointsWonCardWidthAndGaps > canvasSize.width) {
      return true;
    }

    const gamesWonMeasurement = this.getGamesWonCardMeasurement(
      fontSize,
      pointsWonCardMeasurement.instructions.strokeWidth,
      pointsWonCardMeasurement.instructions.padding,
      context,
      getCanvasFontString,
    );
    const fullWidth =
      bothPointsWonCardWidthAndGaps + 2 * gamesWonMeasurement.width;
    if (fullWidth > canvasSize.width) {
      return true;
    }
    this.uncalculatedInstructions = {
      gamesWonCard: gamesWonMeasurement.instructions,
      pointsWonCard: pointsWonCardMeasurement.instructions,
      canvasSize,
      cardGap,
      fullWidth,
      fullHeight: pointsWonCardMeasurement.size.height,
    };
    return false;
  }

  private getDigitInstructions(
    digitsMaxMetrics: DigitsMaxMetrics,
  ): DigitInstructions {
    const maxWidth = digitsMaxMetrics.max.width;
    return digitsMaxMetrics.metrics.reduce((digitInsructions, digitMetrics) => {
      const boundingWidth =
        digitMetrics.actualBoundingBoxLeft +
        digitMetrics.actualBoundingBoxRight;
      const digitShift =
        digitMetrics.actualBoundingBoxLeft + (maxWidth - boundingWidth) / 2;
      const position: Position = {
        x: digitShift,
        y: -digitsMaxMetrics.max.descent,
      };
      digitInsructions[digitMetrics.digit] = position;
      return digitInsructions;
    }, {} as DigitInstructions);
  }

  getInstructions(): CalculatedInstructions {
    const pointsWonCardInstructions =
      this.uncalculatedInstructions.pointsWonCard;
    const gamesWonCardInstructions = this.uncalculatedInstructions.gamesWonCard;

    return {
      cardGap: this.uncalculatedInstructions.cardGap,
      centerTranslation: {
        x:
          (this.uncalculatedInstructions.canvasSize.width -
            this.uncalculatedInstructions.fullWidth) /
          2,
        y:
          (this.uncalculatedInstructions.canvasSize.height -
            this.uncalculatedInstructions.fullHeight) /
          2,
      },
      pointsWonCard: {
        digitSpacing: pointsWonCardInstructions.digitSpacing,
        fontSize: pointsWonCardInstructions.fontSize,
        padding: pointsWonCardInstructions.padding,
        strokeWidth: pointsWonCardInstructions.strokeWidth,
        //todo
        digitInstructions: {
          max: pointsWonCardInstructions.metrics.max,
          digitInstructions: this.getDigitInstructions(
            pointsWonCardInstructions.metrics,
          ),
        },
      },
      gamesWonCard: {
        digitInstructions: {
          max: gamesWonCardInstructions.metrics.max,
          digitInstructions: this.getDigitInstructions(
            gamesWonCardInstructions.metrics,
          ),
        },
        fontSize: gamesWonCardInstructions.fontSize,
        padding: gamesWonCardInstructions.padding,
        strokeWidth: gamesWonCardInstructions.strokeWidth,
      },
    };
  }
  //#region draw

  private drawPointsWonCard(
    pointsWonDrawCardInfo: PointsWonCalculatedCardInstructions,
    context: CanvasRenderingContext2D,
    getCanvasFontString: (fontSize: number) => string,
    points: number,
  ) {
    const base =
      2 * pointsWonDrawCardInfo.padding + pointsWonDrawCardInfo.strokeWidth;
    const cardWidth =
      2 * pointsWonDrawCardInfo.digitInstructions.max.width +
      pointsWonDrawCardInfo.digitSpacing +
      base;
    const cardHeight =
      pointsWonDrawCardInfo.digitInstructions.max.height + base;

    this.drawCard(
      pointsWonDrawCardInfo.strokeWidth,
      cardWidth,
      cardHeight,
      context,
    );

    const strokeAndPadding =
      pointsWonDrawCardInfo.strokeWidth / 2 + pointsWonDrawCardInfo.padding;
    const translateToBaseLine =
      strokeAndPadding + pointsWonDrawCardInfo.digitInstructions.max.height;
    const translateToSecondX =
      pointsWonDrawCardInfo.digitInstructions.max.width +
      pointsWonDrawCardInfo.digitSpacing;
    if (points >= 10) {
      context.translate(strokeAndPadding, translateToBaseLine);
      this.drawDigit(
        getDigit(points, 1, true),
        pointsWonDrawCardInfo.fontSize,
        pointsWonDrawCardInfo.digitInstructions.digitInstructions,
        context,
        getCanvasFontString,
      );

      context.translate(translateToSecondX, 0);
      this.drawDigit(
        getDigit(points, 1, false),
        pointsWonDrawCardInfo.fontSize,
        pointsWonDrawCardInfo.digitInstructions.digitInstructions,
        context,
        getCanvasFontString,
      );
    } else {
      context.translate(
        strokeAndPadding + translateToSecondX,
        translateToBaseLine,
      );
      this.drawDigit(
        points,
        pointsWonDrawCardInfo.fontSize,
        pointsWonDrawCardInfo.digitInstructions.digitInstructions,
        context,
        getCanvasFontString,
      );
    }
    return cardWidth;
  }

  private drawGamesWonCard(
    gamesWonDrawCardInfo: GameWonCalculatedCardInstructions,
    context: CanvasRenderingContext2D,
    getCanvasFontString: (fontSize: number) => string,
    games: number,
  ) {
    const base =
      2 * gamesWonDrawCardInfo.padding + gamesWonDrawCardInfo.strokeWidth;

    const cardWidth = gamesWonDrawCardInfo.digitInstructions.max.width + base;
    const cardHeight = gamesWonDrawCardInfo.digitInstructions.max.height + base;

    this.drawCard(
      gamesWonDrawCardInfo.strokeWidth,
      cardWidth,
      cardHeight,
      context,
    );
    const strokeAndPadding =
      gamesWonDrawCardInfo.strokeWidth / 2 + gamesWonDrawCardInfo.padding;
    const translateToBaseLine =
      strokeAndPadding + gamesWonDrawCardInfo.digitInstructions.max.height;
    context.translate(strokeAndPadding, translateToBaseLine);
    this.drawDigit(
      games,
      gamesWonDrawCardInfo.fontSize,
      gamesWonDrawCardInfo.digitInstructions.digitInstructions,
      context,
      getCanvasFontString,
    );
    return cardWidth;
  }

  private drawCard(
    strokeWidth: number,
    width: number,
    height: number,
    context: CanvasRenderingContext2D,
  ) {
    const halfStrokeWidth = strokeWidth / 2;
    context.translate(halfStrokeWidth, halfStrokeWidth);

    context.lineWidth = strokeWidth;
    context.strokeStyle = this.cardBorderColor;
    context.roundRect(0, 0, width, height, 20);
    context.stroke();
  }

  private drawDigit(
    digit: number,
    fontSize: number,
    instructions: DigitInstructions,
    context: CanvasRenderingContext2D,
    getCanvasFontString: GetCanvasFontString,
  ) {
    const contextFont = getCanvasFontString(fontSize);
    context.font = contextFont;
    context.fillStyle = this.digitColor;
    const position = instructions[digit];
    context.fillText(digit.toString(), position.x, position.y);
  }

  private saveAndRestore(context: CanvasRenderingContext2D, draw: () => void) {
    context.save();
    draw();
    context.restore();
  }

  // create a base class or pass in drawer
  draw(
    instructions: CalculatedInstructions,
    context: CanvasRenderingContext2D,
    getCanvasFontString: (fontSize: number) => string,
  ) {
    const ct = instructions.centerTranslation;
    context.translate(ct.x, ct.y);

    let pointsWonCardWidth = 0;
    this.saveAndRestore(
      context,
      () =>
        (pointsWonCardWidth = this.drawPointsWonCard(
          instructions.pointsWonCard,
          context,
          getCanvasFontString,
          this.score.left.points,
        )),
    );

    context.translate(
      pointsWonCardWidth +
        instructions.pointsWonCard.strokeWidth +
        instructions.cardGap,
      0,
    );

    let gamesWonCardWidth = 0;
    this.saveAndRestore(
      context,
      () =>
        (gamesWonCardWidth = this.drawGamesWonCard(
          instructions.gamesWonCard,
          context,
          getCanvasFontString,
          this.score.left.games,
        )),
    );
    const gamesWonCardTranslation =
      gamesWonCardWidth +
      instructions.gamesWonCard.strokeWidth +
      instructions.cardGap;
    context.translate(gamesWonCardTranslation, 0);

    this.saveAndRestore(context, () =>
      this.drawGamesWonCard(
        instructions.gamesWonCard,
        context,
        getCanvasFontString,
        this.score.right.games,
      ),
    );
    context.translate(gamesWonCardTranslation, 0);

    this.drawPointsWonCard(
      instructions.pointsWonCard,
      context,
      getCanvasFontString,
      this.score.right.points,
    );
  }
  //#endregion
}
