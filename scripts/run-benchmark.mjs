import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { performance } from "node:perf_hooks";
import { ciMetadata, clearTaskCache, parseArgs, rootDir, round, runTask, writeResult } from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const provider = String(args.provider || process.env.BENCH_PROVIDER || "local");
const workload = String(args.workload || process.env.BENCH_WORKLOAD || "all");
const scenario = String(args.scenario || process.env.BENCH_SCENARIO || "unspecified");
const supportedWorkloads = new Set(["small-node", "monorepo", "all"]);

if (!supportedWorkloads.has(workload)) {
  throw new Error(`Unsupported workload: ${workload}. Use small-node, monorepo, or all.`);
}

const startedAt = new Date().toISOString();
const totalStart = performance.now();
const taskResults = [];

if (scenario === "cold" || args["clear-cache"]) await clearTaskCache();

if (workload === "small-node" || workload === "all") {
  taskResults.push(...await runSmallNode());
}

if (workload === "monorepo" || workload === "all") {
  taskResults.push(...await runMonorepo());
}

const result = {
  schemaVersion: 1,
  provider,
  workload,
  scenario,
  startedAt,
  finishedAt: new Date().toISOString(),
  durationMs: round(performance.now() - totalStart),
  cache: {
    hits: taskResults.filter((task) => task.cacheHit).length,
    misses: taskResults.filter((task) => !task.cacheHit).length
  },
  metadata: ciMetadata(),
  tasks: taskResults
};

const resultPath = await writeResult(result);
const failedTasks = taskResults.filter((task) => task.status === "failed");
console.log(JSON.stringify({
  provider,
  workload,
  scenario,
  durationMs: result.durationMs,
  cacheHits: result.cache.hits,
  cacheMisses: result.cache.misses,
  failedTasks: failedTasks.length,
  resultPath
}));

if (failedTasks.length > 0) process.exitCode = 1;

async function runSmallNode() {
  const sourcePath = join(rootDir, "workloads/small-node/src/message.txt");
  return Promise.all([
    runTask({ workload: "small-node", unit: "app", task: "test", sourcePath, effort: 70_000 }),
    runTask({ workload: "small-node", unit: "app", task: "build", sourcePath, effort: 110_000 })
  ]);
}

async function runMonorepo() {
  const packagesDir = join(rootDir, "workloads/monorepo/packages");
  const packageNames = (await readdir(packagesDir)).sort();
  const tasks = [];
  for (const packageName of packageNames) {
    const sourcePath = join(packagesDir, packageName, "src/value.txt");
    tasks.push(runTask({ workload: "monorepo", unit: packageName, task: "test", sourcePath, effort: 45_000 }));
    tasks.push(runTask({ workload: "monorepo", unit: packageName, task: "build", sourcePath, effort: 65_000 }));
  }
  return Promise.all(tasks);
}
