import * as os from "os";
import * as fs from "fs";
import * as path from "path";

const getWifiIPV4Address = () => {
  const nets = os.networkInterfaces();

  const wifiNets = nets["WiFi"];
  const wifiAddresses = wifiNets!.reduce<string[]>((acc, net) => {
    const familyV4Value = typeof net.family === "string" ? "IPv4" : 4;
    if (net.family === familyV4Value && !net.internal) {
      acc.push(net.address);
    }
    return acc;
  }, []);
  return wifiAddresses[0];
};

function updateOrAdd(envFileContent: string, key: string, value: string) {
  const keyValue = `${key}=${value}`;
  // Convert the content into lines and update the variable if it exists
  let updated = false;
  const updatedContent = envFileContent
    .split("\n")
    .map((line) => {
      if (line.startsWith(`${key}=`)) {
        updated = true;
        return keyValue;
      }
      return line;
    })
    .join("\n");

  // If the variable was not present, add it at the end
  return updated ? updatedContent : `${updatedContent}\n${keyValue}`;
}

function addAddressToEnv() {
  const address = getWifiIPV4Address();

  // Adjust path to .env file based on script's location in the scripts folder
  const envPath = path.resolve(__dirname, "../.env.device");

  // Read the .env file contents
  const envFileContent = fs.readFileSync(envPath, "utf-8");
  const finalContent = updateOrAdd(envFileContent, "EMULATOR_HOST", address);
  // Write the updated content back to the .env file
  fs.writeFileSync(envPath, finalContent);
}

addAddressToEnv();
