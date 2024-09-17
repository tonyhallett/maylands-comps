import { useState } from "react";
import { webSafeFonts } from "./webSafeFonts";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

export function useWebSafeFontSelection() {
  const [html, selectedFont] = useFontSelection(
    webSafeFonts.map((font) => ({ name: font })),
  );
  return [html, selectedFont?.name] as const;
}

export function useFontSelection<T extends NamedOption>(fontOptions: T[]) {
  return useSelect("Select font", fontOptions);
}

interface NamedOption {
  name: string;
}

export function useSelect<T extends NamedOption>(label: string, items: T[]) {
  const [selected, setSelected] = useState<T | undefined>(undefined);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const html = (
    <>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">{label}</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={selectedIndex}
          label={label}
          onChange={(e) => {
            const index = Number.parseInt(e.target.value as string);
            const selectedItem = items[index];
            setSelected(selectedItem);
            setSelectedIndex(index);
          }}
        >
          {items.map((item, i) => (
            <MenuItem key={i} value={i}>
              {item.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
  return [html, selected] as const;
}
