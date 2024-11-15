export default function escapeTestPathPattern(params: string[]): string {
  let commandArgs = "";
  let testNamePatternValueIndex = -1;
  params.forEach((param, index) => {
    if (param.includes("--testNamePattern")) {
      testNamePatternValueIndex = index + 1;
    }
    if (testNamePatternValueIndex === index) {
      param = `"${param.replace(/"/g, '""')}"`;
    }
    commandArgs += `${param} `;
  });
  return commandArgs;
}
