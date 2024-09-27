import * as matchers from "@testing-library/jest-dom/matchers";

type ExtendedExpect = jest.ExtendedExpectFunction<typeof matchers>;
const extendedExpect: ExtendedExpect = expect as unknown as ExtendedExpect;
export enum TextDecorationLine {
  None,
  Underline,
  Overline,
  LineThrough,
}
const getTextDecorationLine = (textDecorationLine: TextDecorationLine) => {
  switch (textDecorationLine) {
    case TextDecorationLine.None:
      return "none";
    case TextDecorationLine.Underline:
      return "underline";
    case TextDecorationLine.Overline:
      return "overline";
    case TextDecorationLine.LineThrough:
      return "line-through";
  }
};
export const expectSingleTextDecorationLine = (
  element: HTMLElement,
  expectedTextDecorationLine: TextDecorationLine,
) => {
  extendedExpect(element).toHaveStyle(
    `text-decoration-line: ${getTextDecorationLine(expectedTextDecorationLine)}`,
  );
};
export const expectNotSingleTextDecorationLine = (
  element: HTMLElement,
  expectedTextDecorationLine: TextDecorationLine,
) => {
  extendedExpect(element).not.toHaveStyle(
    `text-decoration-line: ${getTextDecorationLine(expectedTextDecorationLine)}`,
  );
};
