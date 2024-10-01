import { fireEvent, screen } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

type ExtendedExpect = jest.ExtendedExpectFunction<typeof matchers>;
const extendedExpect: ExtendedExpect = expect as unknown as ExtendedExpect;
const openMenuGetMenuItem = (menuButton: HTMLElement, name: string) => {
  fireEvent.click(menuButton);
  return screen.getByRole("menuitem", { name });
};

export const openMenuClickMenuItem = (
  menuButton: HTMLElement,
  name: string,
) => {
  fireEvent.click(menuButton);
  const menuItem = screen.getByRole("menuitem", { name });
  fireEvent.click(menuItem);
};

export const openMenuExpectMenuItemDisabled = (
  menuButton: HTMLElement,
  name: string,
  disabled = true,
) => {
  const menuItem = openMenuGetMenuItem(menuButton, name);
  if (disabled) {
    extendedExpect(menuItem).toHaveAttribute("aria-disabled", "true");
  } else {
    extendedExpect(menuItem).not.toHaveAttribute("aria-disabled", "true");
  }
};
