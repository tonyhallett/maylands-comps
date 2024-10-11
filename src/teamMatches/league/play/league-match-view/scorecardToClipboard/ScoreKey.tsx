import { ExtractKey } from "../../../../../firebase/rtb/typeHelpers";
import { Score } from "../../../scorecardToClipboard/drawTable";

export type ScoreKey = ExtractKey<Score, "home" | "away">;
