import { Database, ref, set } from "firebase/database";
import { Root } from "../src/firebase/rtb/root";

export function setRoot(database: Database, root: Root | null) {
  return set(ref(database), root);
}
