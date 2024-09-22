import { fireEvent, screen } from "@testing-library/react";

export function openAutocompleteAndGetOptions(inputElement: HTMLInputElement) {
  fireEvent.keyDown(inputElement, { key: "ArrowDown" });
  const listbox = screen.getByRole("listbox");
  return [...listbox.querySelectorAll("li")];
}
