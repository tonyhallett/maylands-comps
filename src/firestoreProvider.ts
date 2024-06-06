import { initializeApp } from "firebase/app";
import {
  getFirestore as firebaseGetFirestore,
  connectFirestoreEmulator,
} from "firebase/firestore";
import firebaseConfig from "./firebaseConfig";

export function getFirestore() {
  const app = initializeApp(firebaseConfig);
  const db = firebaseGetFirestore(app);
  if (process.env.NODE_ENV === "development") {
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
  }
  return db;
}
