interface PlayerMatchDetails {
  matchIndices: number[];
  positionDisplay: string;
}
export const homePlayerMatchDetails: PlayerMatchDetails[] = [
  { matchIndices: [0, 4, 8], positionDisplay: "A" },
  { matchIndices: [1, 3, 6], positionDisplay: "B" },
  { matchIndices: [2, 5, 7], positionDisplay: "C" },
];
export const awayPlayerMatchDetails: PlayerMatchDetails[] = [
  { matchIndices: [0, 3, 7], positionDisplay: "X" },
  { matchIndices: [1, 5, 8], positionDisplay: "Y" },
  { matchIndices: [2, 4, 6], positionDisplay: "Z" },
];
