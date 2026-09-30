import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { rootDir } from "./lib.mjs";

const scenario = process.argv[2];
const supported = ["source-change", "docs-only", "lockfile-change", "failed-shard", "reset"];

if (!supported.includes(scenario)) {
  throw new Error(`Use one of: ${supported.join(", ")}`);
}

if (scenario === "reset") {
  await writeFile(join(rootDir, "docs/scenario-marker.md"), "docs-variant-a\n");
  await writeFile(join(rootDir, "workloads/monorepo/packages/package-03/src/value.txt"), "variant-a\n");
  const packagePath = join(rootDir, "package.json");
  const packageJson = JSON.parse(await readFile(packagePath, "utf8"));
  packageJson.benchScenarioRevision = 0;
  await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
  await execute("npm", ["install", "--package-lock-only", "--ignore-scripts", "--no-audit", "--no-fund"]);
  console.log("Scenario files restored.");
} else if (scenario === "source-change") {
  await toggleFile("workloads/monorepo/packages/package-03/src/value.txt", "variant-a", "variant-b");
  console.log("Changed package-03 only.");
} else if (scenario === "docs-only") {
  await toggleFile("docs/scenario-marker.md", "docs-variant-a", "docs-variant-b");
  console.log("Changed documentation only.");
} else if (scenario === "lockfile-change") {
  const packagePath = join(rootDir, "package.json");
  const packageJson = JSON.parse(await readFile(packagePath, "utf8"));
  packageJson.benchScenarioRevision = Number(packageJson.benchScenarioRevision || 0) + 1;
  await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
  await execute("npm", ["install", "--package-lock-only", "--ignore-scripts", "--no-audit", "--no-fund"]);
  console.log("Changed package metadata and lockfile.");
} else if (scenario === "failed-shard") {
  await toggleFile("workloads/monorepo/packages/package-03/src/value.txt", "variant-a", "FAIL_BENCHMARK");
  console.log("Marked package-03 for an intentional benchmark failure.");
}

async function toggleFile(relativePath, first, second) {
  const path = join(rootDir, relativePath);
  const current = (await readFile(path, "utf8")).trim();
  await writeFile(path, `${current === first ? second : first}\n`);
}

function execute(command, commandArgs) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, { cwd: rootDir, stdio: "inherit" });
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`)));
    child.on("error", reject);
  });
}
