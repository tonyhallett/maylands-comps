import { initializeApp } from "firebase/app";
import {
  getFirestore,
  connectFirestoreEmulator,
  Firestore,
} from "firebase/firestore";
import firebaseConfig from "./firebaseConfig";
import { createContext, ReactNode, useContext } from "react";

export function getMaylandsCompFirestore() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  if (process.env.NODE_ENV === "development") {
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
  }
  return db;
}

const FirestoreContext = createContext<Firestore | null>(null);
export function useFirestore() {
  return useContext(FirestoreContext) as Firestore;
}
const FirestoreProviderX = FirestoreContext.Provider;
export function FirestoreProvider({ children }: { children?: ReactNode }) {
  return (
    <FirestoreProviderX value={getMaylandsCompFirestore()}>
      {children}
    </FirestoreProviderX>
  );
}
