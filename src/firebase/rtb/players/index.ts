import { Root } from "../root";
import { nameof } from "../typeHelpers";

export const playersKey = nameof<Root>("players");
export interface DbPlayer {
  name: string;
}
