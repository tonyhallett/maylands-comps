export interface WeightHasItalic {
  weight: number;
  italic: boolean;
}
export interface FontFamily {
  name: string;
  variants: WeightHasItalic[];
}

export const monospaceFonts: FontFamily[] = [
  {
    name: "Roboto Mono",
    variants: [
      { weight: 100, italic: true },
      { weight: 200, italic: true },
      { weight: 300, italic: true },
      { weight: 400, italic: true },
      { weight: 500, italic: true },
      { weight: 600, italic: true },
      { weight: 700, italic: true },
    ],
  },
  {
    name: "Inconsolata",
    variants: [
      { weight: 200, italic: false },
      { weight: 300, italic: false },
      { weight: 400, italic: false },
      { weight: 500, italic: false },
      { weight: 600, italic: false },
      { weight: 700, italic: false },
      { weight: 800, italic: false },
      { weight: 900, italic: false },
    ],
  },
  {
    name: "Rubik Mono One",
    variants: [{ weight: 400, italic: false }],
  },
  {
    name: "Chivo Mono",
    variants: [
      { weight: 100, italic: true },
      { weight: 200, italic: true },
      { weight: 300, italic: true },
      { weight: 400, italic: true },
      { weight: 500, italic: true },
      { weight: 600, italic: true },
      { weight: 700, italic: true },
      { weight: 800, italic: true },
      { weight: 900, italic: true },
    ],
  },
  {
    name: "Anonymous Pro",
    variants: [
      { weight: 400, italic: true },
      { weight: 700, italic: true },
    ],
  },
  {
    name: "Cutive Mono",
    variants: [{ weight: 400, italic: false }],
  },
  {
    name: "VT323",
    variants: [{ weight: 400, italic: false }],
  },
  {
    name: "B612 Mono",
    variants: [
      { weight: 400, italic: true },
      { weight: 700, italic: true },
    ],
  },
  {
    name: "Lekton",
    variants: [
      { weight: 400, italic: true },
      { weight: 700, italic: false },
    ],
  },
  {
    name: "Major Mono Display",
    variants: [{ weight: 400, italic: false }],
  },
  {
    name: "Martian Mono",
    variants: [
      { weight: 100, italic: false },
      { weight: 200, italic: false },
      { weight: 300, italic: false },
      { weight: 400, italic: false },
      { weight: 500, italic: false },
      { weight: 600, italic: false },
      { weight: 700, italic: false },
    ],
  },
  {
    name: "Sometype Mono",
    variants: [
      { weight: 400, italic: true },
      { weight: 500, italic: true },
      { weight: 600, italic: true },
      { weight: 700, italic: true },
    ],
  },
  {
    name: "Fragment Mono",
    variants: [{ weight: 400, italic: true }],
  },
];
