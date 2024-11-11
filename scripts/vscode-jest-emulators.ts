import * as cp from "child_process";
import * as fs from "fs";

const params = process.argv.slice(2);
const commandArgs = params.join(" ");
const isListTests = commandArgs.includes("--listTests");
const command = isListTests
  ? `npx jest --selectProjects emulator ${commandArgs}`
  : `npm run jest-emulator-test --jestargs="${commandArgs}"`;
fs.writeFileSync(
  "C:\\Users\\tonyh\\Downloads\\test\\vscode-jest-emulators-command.txt",
  command,
);
cp.spawn(command, { shell: true, detached: false, stdio: "inherit" });
