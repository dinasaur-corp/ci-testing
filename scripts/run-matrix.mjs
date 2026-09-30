import { spawn } from "node:child_process";
import { parseArgs } from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const provider = String(args.provider || "local");
const scenarios = String(args.scenarios || "cold,warm").split(",").filter(Boolean);
const workloads = String(args.workloads || "small-node,monorepo").split(",").filter(Boolean);
const runs = Number.parseInt(String(args.runs || "1"), 10);

for (const scenario of scenarios) {
  for (const workload of workloads) {
    for (let run = 1; run <= runs; run += 1) {
      console.log(`matrix provider=${provider} scenario=${scenario} workload=${workload} run=${run}/${runs}`);
      await execute([
        "scripts/run-benchmark.mjs",
        "--provider", provider,
        "--workload", workload,
        "--scenario", scenario
      ]);
    }
  }
}

function execute(commandArgs) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, commandArgs, { stdio: "inherit" });
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`Benchmark exited with ${code}`)));
    child.on("error", reject);
  });
}

