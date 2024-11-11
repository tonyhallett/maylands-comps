import * as cp from "child_process";

const params = process.argv.slice(2);
const commandArgs = params.join(" ").replace("%npm_config_jestargs%", "");
const command = `firebase emulators:exec --only database "jest --runInBand --selectProjects emulator ${commandArgs}"`;

cp.spawn(command, {
  shell: true,
  detached: false,
  stdio: ["inherit", "inherit", "inherit"],
});
