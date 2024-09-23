import { fireEvent, screen } from "@testing-library/react";

//https://github.com/mui/material-ui/blob/master/packages/mui-material/src/Autocomplete/Autocomplete.test.js

export function openAutocompleteAndGetOptions(inputElement: HTMLInputElement) {
  fireEvent.keyDown(inputElement, { key: "ArrowDown" });
  const listbox = screen.getByRole("listbox");
  return [...listbox.querySelectorAll("li")];
}
export function clearOptions(autocompleteInput: HTMLInputElement) {
  fireEvent.keyDown(autocompleteInput, { key: "Escape" });
}
export function selectNthOption(
  autocompleteInput: HTMLInputElement,
  nth: number,
) {
  for (let i = 0; i < nth; i++) {
    fireEvent.keyDown(autocompleteInput, { key: "ArrowDown" });
  }
  fireEvent.keyDown(autocompleteInput, { key: "Enter" });
}
