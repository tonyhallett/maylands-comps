import { screen, within } from "@testing-library/react";

export const from = (withinElement?: HTMLElement) =>
  withinElement === undefined ? screen : within(withinElement);
