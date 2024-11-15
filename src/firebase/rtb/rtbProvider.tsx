import { initializeApp } from "firebase/app";
import firebaseConfig from "../firebaseConfig";
import { createContext, ReactNode, useContext } from "react";
import {
  connectDatabaseEmulator,
  Database,
  getDatabase,
} from "firebase/database";
import { getNewKey } from "./getNewKey";
import { createRootUpdater } from "./match/db-helpers/createRootUpdater";

export function getMaylandsCompRTB() {
  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);
  /*
    alternative - from docs
    if(location.hostname === "localhost")
  */
  console.log(`process.env.EMULATOR_HOST = ${process.env.EMULATOR_HOST}`);
  if (process.env.EMULATOR_HOST !== undefined) {
    connectDatabaseEmulator(db, process.env.EMULATOR_HOST, 9000);
  }
  return db;
}

const DatabaseContext = createContext<Database | null>(null);
export function useRTB() {
  return useContext(DatabaseContext) as Database;
}
export function useRTBGetNewKey() {
  const db = useRTB();
  return {
    db,
    getNewKey: () => getNewKey(db),
    createRootUpdater: () => createRootUpdater(db),
  };
}
const DatabaseProviderX = DatabaseContext.Provider;
export function DatabaseProvider({
  children,
  database,
}: {
  children?: ReactNode;
  database?: Database;
}) {
  database = database || getMaylandsCompRTB();
  return <DatabaseProviderX value={database}>{children}</DatabaseProviderX>;
}
