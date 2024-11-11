import type { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  testEnvironment: "jsdom",
  projects: [
    {
      preset: "ts-jest",
      displayName: "emulator",
      // prettier-ignore
      // eslint-disable-next-line no-useless-escape
      testRegex: ["/__emulator-tests__\/.*.emulatortest.tsx"],
      setupFilesAfterEnv: ["<rootDir>/jest-setup.ts"],
      setupFiles: ["jest-canvas-mock"],
    },
    {
      preset: "ts-jest",
      displayName: "not-emulator",
      testRegex: ["/__tests__/.*.test.ts$"],
      setupFilesAfterEnv: ["<rootDir>/jest-setup.ts"],
    },
    // https://github.com/mui/mui-x/issues/11568 [charts][ESM] @mui/x-charts does not work with jest
    {
      displayName: "hacky-mui-tests",
      transformIgnorePatterns: [
        "/node_modules/(?!@mui/x-charts|@mui/material|@babel/runtime|d3-(color|format|interpolate|scale|shape|time|time-format|path|array)|internmap)",
      ],
      testRegex: ["__hacky-mui-tests__/.*.test.ts"],
    },
  ],
};

export default config;
