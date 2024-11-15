import * as cp from "child_process";
import * as fs from "fs";
import escapeTestPathPattern from "./escapeTestPathPattern";

const processArgs = process.argv.slice(2);
const filePath = processArgs[0];
let argsStr = fs.readFileSync(filePath, "utf8");
const args = JSON.parse(argsStr);
argsStr = escapeTestPathPattern(args);

const command = `jest --runInBand --selectProjects emulator ${argsStr}`;

cp.spawn(command, { shell: true, detached: false, stdio: "inherit" });
