/**
 * @jest-environment jsdom
 */
import { CssBaseline } from "@mui/material";
import MaylandsThemeProvider from "../src/MaylandsTheming/MaylandsThemeProvider";
import {
  DatabaseProvider,
  getMaylandsCompRTB,
} from "../src/firebase/rtb/rtbProvider";
import { ref, set } from "firebase/database";
import { ReactNode } from "react";

export default function createEmulatorTests() {
  const database = getMaylandsCompRTB();

  beforeEach(async () => {
    await set(ref(database), null);
  });

  //afterAll(async () => {}); // database coverage

  const createMaylandsComps = (node: ReactNode) => {
    return (
      <DatabaseProvider database={database}>
        <MaylandsThemeProvider>
          <CssBaseline enableColorScheme />
          {node}
        </MaylandsThemeProvider>
      </DatabaseProvider>
    );
  };
  return {
    createMaylandsComps,
    database,
  };
}
