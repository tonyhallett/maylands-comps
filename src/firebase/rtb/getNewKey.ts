import { Database, push, ref } from "firebase/database";

export const getNewKey = (database: Database) => {
  return push(ref(database, "___")).key!;
};
