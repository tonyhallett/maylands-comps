import * as fs from "fs-extra";
import * as csstree from "css-tree";
import * as path from "path";

const digitsUrl =
  "https://fonts.googleapis.com/css2?family=Anonymous+Pro:ital,wght@0,400;0,700;1,400;1,700&family=B612+Mono:ital,wght@0,400;0,700;1,400;1,700&family=Chivo+Mono:ital,wght@0,100..900;1,100..900&family=Cutive+Mono&family=Fragment+Mono:ital@0;1&family=Inconsolata:wght@200..900&family=Lekton:ital,wght@0,400;0,700;1,400&family=Major+Mono+Display&family=Martian+Mono:wght@100..800&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&family=Rubik+Mono+One&family=Sometype+Mono:ital,wght@0,400..700;1,400..700&family=VT323";

interface PropertyValue {
  property: string;
  value: string;
}
interface FontToDownload {
  src: string;
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  filePath: string;
  decoded: string;
  properties: PropertyValue[];
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
function replaceAll(str: string, find: string, replace: string) {
  return str.replace(new RegExp(escapeRegExp(find), "g"), replace);
}
function removeFolderContents(dir: string) {
  fs.rmSync(dir, { recursive: true, force: true });
}
const fontFacesDownloadSavePath: string | undefined = undefined;

function saveFontFacesDownload(fontFaces: string) {
  if (fontFacesDownloadSavePath === undefined) return;
  fs.writeFileSync(fontFacesDownloadSavePath, fontFaces);
}

export async function downloadDigits(
  googleCss2: string,
  fontDirectory: string,
  fontFacesPath: string,
) {
  if (fs.existsSync(fontDirectory)) {
    removeFolderContents(fontDirectory);
  }
  fs.mkdirSync(fontDirectory);
  const url = `${googleCss2}&text=0123456789`;
  try {
    let response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
      },
    });
    const fontFacesDownload = await response.text();
    saveFontFacesDownload(fontFacesDownload);
    const ast = csstree.parse(fontFacesDownload);
    const styleSheet = ast as csstree.StyleSheet;
    // todo consider typing this
    let fontFaces = "export const fontFaces = [";
    const fontsToDownload: FontToDownload[] = [];
    styleSheet.children.forEach((rule) => {
      if (rule.type === "Atrule" && rule.name === "font-face") {
        const fontToDownload: FontToDownload = {
          fontFamily: "",
          fontStyle: "",
          fontWeight: "",
          src: "",
          filePath: "",
          decoded: "",
          properties: [],
        };
        rule.block!.children.forEach((declaration) => {
          if (declaration.type === "Declaration") {
            const property = declaration.property;
            const value = declaration.value as csstree.Value;
            switch (property) {
              case "font-family":
                fontToDownload.fontFamily = csstree.generate(value);
                break;
              case "font-weight":
                fontToDownload.fontWeight = csstree.generate(value);
                break;
              case "font-style":
                fontToDownload.fontStyle = csstree.generate(value);
                break;
              case "src":
                fontToDownload.src = (
                  value.children.first! as csstree.Url
                ).value;
                break;
            }
            if (property !== "src") {
              fontToDownload.properties.push({
                property,
                value: replaceAll(csstree.generate(value), `"`, ""),
              });
            }
          }
        });
        fontToDownload.filePath = getFontFileName(fontToDownload);
        fontsToDownload.push(fontToDownload);
      }
    });

    await Promise.all(
      fontsToDownload.map(async (fontToDownload) => {
        response = await fetch(fontToDownload.src);
        const blob = await response.blob();
        const fontPath = path.join(
          fontDirectory,
          getFontFileName(fontToDownload),
        );
        return saveBlob(blob, fontPath);
      }),
    );

    fontsToDownload.forEach((fontToDownload) => {
      let fontface = "{";
      fontToDownload.properties.forEach((property) => {
        fontface += `"${property.property}": "${property.value}",`;
      });

      const url = "../fonts/" + fontToDownload.filePath;
      fontface += `"filePath": new URL("${url}",import.meta.url),`;
      fontface += "},";
      fontFaces += fontface;
    });
    fontFaces += "];";
    await fs.ensureFile(fontFacesPath);
    fs.writeFileSync(fontFacesPath, fontFaces);
  } catch (e) {
    console.error((e as Error).message);
  }
}

function getFontFileName(fontToDownload: FontToDownload) {
  const fontFamilyPart = replaceAll(fontToDownload.fontFamily, `"`, "");
  return `${fontFamilyPart}-${fontToDownload.fontWeight}-${fontToDownload.fontStyle}.woff2`;
}

function saveBlob(blob: Blob, savePath: string) {
  const writeStream = fs.createWriteStream(savePath);
  const writableStream = new WritableStream({
    write(chunk) {
      writeStream.write(chunk);
    },
    close() {
      writeStream.end();
      writeStream.close();
    },
  });
  blob.stream().pipeTo(writableStream);
}

if (process.argv.length !== 4) {
  console.error(
    "Fonts directory and path to generated typescript file required",
  );
  process.exit(1);
}

downloadDigits(digitsUrl, process.argv[2], process.argv[3]).then(() => {});
