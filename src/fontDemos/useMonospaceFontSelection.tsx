import { monospaceFonts } from "./monospaceFonts";
import { useFontSelection } from "./useFontSelection";

interface MonospaceOption {
  name: string;
  weight: number;
  italic: boolean;
  family: string;
}
export const monoSpaceOptions: MonospaceOption[] = [];
monospaceFonts.forEach((monospaceFont) => {
  monospaceFont.variants.forEach((variant) => {
    const add = (italic: boolean) => {
      const italicDisplay = italic ? "italic" : "";
      monoSpaceOptions.push({
        name: `${monospaceFont.name} ${variant.weight} ${italicDisplay}`,
        weight: variant.weight,
        italic,
        family: monospaceFont.name,
      });
    };

    add(false);
    if (variant.italic) {
      add(true);
    }
  });
});

export function useMonospaceFontSelection() {
  return useFontSelection(monoSpaceOptions);
}
