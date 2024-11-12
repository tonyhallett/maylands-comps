import * as cp from "child_process";
import * as fs from "fs";
import escapeTestPathPattern from "./escapeTestPathPattern";

const commandArgs = escapeTestPathPattern(process.argv.slice(2));
const isListTests = commandArgs.includes("--listTests");
const command = isListTests
  ? `npx jest --selectProjects emulator ${commandArgs}`
  : `npm run jest-emulator-test -- ${commandArgs}`;
fs.writeFileSync(
  "C:\\Users\\tonyh\\Downloads\\test\\vscode-jest-emulators2.txt",
  command,
);
cp.spawn(command, { shell: true, detached: false, stdio: "inherit" });
