import { fireEvent, screen } from "@testing-library/react";

export function openAutocompleteAndGetOptions(inputElement: HTMLInputElement) {
  fireEvent.keyDown(inputElement, { key: "ArrowDown" });
  const listbox = screen.getByRole("listbox");
  return [...listbox.querySelectorAll("li")];
}

export function selectNthOption(element: HTMLInputElement, nth: number) {
  for (let i = 0; i < nth; i++) {
    fireEvent.keyDown(element, { key: "ArrowDown" });
  }
  fireEvent.keyDown(element, { key: "Enter" });
}
