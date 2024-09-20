import { createWriteStream } from "node:fs";
import http from "node:http";

// #region database coverage
function parseHostAndPort(hostAndPort: string): {
  host: string;
  port: number;
} {
  const pieces = hostAndPort.split(":");
  return {
    host: pieces[0],
    port: parseInt(pieces[1], 10),
  };
}

function getDatabaseCoverageMeta(databaseName: string) {
  /**
   * The FIREBASE_DATABASE_EMULATOR_HOST environment variable is set automatically
   * by "firebase emulators:exec"
   */
  const hostAndPort = parseHostAndPort(
    process.env.FIREBASE_DATABASE_EMULATOR_HOST!,
  );
  const { host, port } = hostAndPort;
  const coverageUrl = `http://${host}:${port}/.inspect/coverage?ns=${databaseName}`;
  return {
    host,
    port,
    coverageUrl,
  };
}

export async function writeDatabaseCoverage(databaseName: string) {
  const { coverageUrl } = getDatabaseCoverageMeta(databaseName);
  // todo use the current file name
  const coverageFile = "database-coverage.html";
  const fstream = createWriteStream(coverageFile);
  await new Promise((resolve, reject) => {
    http.get(coverageUrl, (res) => {
      res.pipe(fstream, { end: true });
      res.on("end", resolve);
      res.on("error", reject);
    });
  });

  console.log(`View database rule coverage information at ${coverageFile}\n`);
}
//#endregion
