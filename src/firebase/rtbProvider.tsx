import { initializeApp } from "firebase/app";
import firebaseConfig from "./firebaseConfig";
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
    from docs
    if(location.hostname === "localhost")
  */
  if (process.env.NODE_ENV === "development") {
    connectDatabaseEmulator(db, "127.0.0.1", 9000);
  }
  return db;
}

const DatabaseContext = createContext<Database>(null);
export function useRTB() {
  return useContext(DatabaseContext);
}
const DatabaseProviderX = DatabaseContext.Provider;
export function DatabaseProvider({ children }: { children?: ReactNode }) {
  return (
    <DatabaseProviderX value={getMaylandsCompRTB()}>
      {children}
    </DatabaseProviderX>
  );
}
