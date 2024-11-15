import * as cp from "child_process";
import * as fs from "fs";
import * as os from "os";

const params = process.argv.slice(2);
const jsonParams = JSON.stringify(params);
const tmpDir = os.tmpdir();
const tmpFile = `${tmpDir}\\jest-emulator-test.txt`;
fs.writeFileSync(tmpFile, jsonParams);
const command = `firebase emulators:exec --only database "npm run test-emulator-escaped-args-from-file ${tmpFile} "`;

cp.spawn(command, {
  shell: true,
  detached: false,
  stdio: ["inherit", "inherit", "inherit"],
});
