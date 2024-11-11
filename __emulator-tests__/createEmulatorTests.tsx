/**
 * @jest-environment jsdom
 */
import { CssBaseline } from "@mui/material";
import MaylandsThemeProvider from "../src/MaylandsTheming/MaylandsThemeProvider";
import {
  DatabaseProvider,
  getMaylandsCompRTB,
} from "../src/firebase/rtb/rtbProvider";
import { ReactNode } from "react";
import { setRoot } from "./setRoot";

export default function createEmulatorTests() {
  const database = getMaylandsCompRTB();

  beforeEach(async () => {
    await setRoot(database, null);
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
