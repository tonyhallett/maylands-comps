import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  transformIgnorePatterns: [
    "/node_modules/(?!@mui/x-charts|@mui/material|@babel/runtime|d3-(color|format|interpolate|scale|shape|time|time-format|path|array)|internmap)",
  ],
};

export default config;
