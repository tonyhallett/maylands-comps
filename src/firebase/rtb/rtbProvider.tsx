import { initializeApp } from "firebase/app";
import firebaseConfig from "../firebaseConfig";
import { createContext, ReactNode, useContext } from "react";
import {
  connectDatabaseEmulator,
  Database,
  getDatabase,
} from "firebase/database";

export function getMaylandsCompRTB() {
  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);
  /*
    alternative - from docs
    if(location.hostname === "localhost")
  */
  if (process.env.NODE_ENV === "development") {
    connectDatabaseEmulator(db, "127.0.0.1", 9000);
  }
  return db;
}

const DatabaseContext = createContext<Database | null>(null);
export function useRTB() {
  return useContext(DatabaseContext) as Database;
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
