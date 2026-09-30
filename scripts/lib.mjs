import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { performance } from "node:perf_hooks";

export const rootDir = new URL("../", import.meta.url).pathname;
export const cacheDir = join(rootDir, ".bench-cache");
export const resultsDir = join(rootDir, "results");

export async function clearTaskCache() {
  await rm(cacheDir, { recursive: true, force: true });
}

export function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith("--")) continue;
    const [rawKey, inlineValue] = item.slice(2).split("=", 2);
    const next = argv[index + 1];
    if (inlineValue !== undefined) {
      args[rawKey] = inlineValue;
    } else if (next && !next.startsWith("--")) {
      args[rawKey] = next;
      index += 1;
    } else {
      args[rawKey] = true;
    }
  }
  return args;
}

export async function runTask({ workload, unit, task, sourcePath, effort = 150_000 }) {
  const source = await readFile(sourcePath, "utf8");
  const cacheKey = createHash("sha256")
    .update(JSON.stringify({ workload, unit, task, source, node: process.versions.node.split(".")[0] }))
    .digest("hex");
  const cachePath = join(cacheDir, workload, unit, `${task}-${cacheKey}.json`);
  const startedAt = new Date().toISOString();
  const start = performance.now();
  let cacheHit = false;

  if (source.includes("FAIL_BENCHMARK")) {
    return {
      workload,
      unit,
      task,
      startedAt,
      durationMs: round(performance.now() - start),
      cacheHit,
      cacheKey: cacheKey.slice(0, 12),
      status: "failed",
      error: "Intentional failure for the failed-shard scenario"
    };
  }

  try {
    await readFile(cachePath, "utf8");
    cacheHit = true;
    await busyWork(Math.max(2_000, Math.floor(effort / 40)), cacheKey);
  } catch {
    await busyWork(effort, cacheKey);
    await mkdir(dirname(cachePath), { recursive: true });
    await writeFile(cachePath, JSON.stringify({ cacheKey, createdAt: new Date().toISOString() }));
  }

  return {
    workload,
    unit,
    task,
    startedAt,
    durationMs: round(performance.now() - start),
    cacheHit,
    cacheKey: cacheKey.slice(0, 12),
    status: "passed"
  };
}

async function busyWork(iterations, seed) {
  let value = seed;
  for (let index = 0; index < iterations; index += 1) {
    value = createHash("sha256").update(`${value}:${index}`).digest("hex");
    if (index > 0 && index % 10_000 === 0) await new Promise((resolve) => setImmediate(resolve));
  }
  return value;
}

export function round(value) {
  return Math.round(value * 100) / 100;
}

export async function writeResult(result) {
  await mkdir(resultsDir, { recursive: true });
  const safeTimestamp = result.startedAt.replaceAll(":", "-").replaceAll(".", "-");
  const fileName = `${safeTimestamp}-${result.provider}-${result.workload}-${result.scenario}.json`;
  const path = join(resultsDir, fileName);
  await writeFile(path, `${JSON.stringify(result, null, 2)}\n`);
  return path;
}

export function ciMetadata() {
  return {
    commitSha: process.env.GITHUB_SHA || process.env.CIRCLE_SHA1 || process.env.CI_COMMIT_SHA || null,
    branch: process.env.GITHUB_REF_NAME || process.env.CIRCLE_BRANCH || process.env.CI_COMMIT_REF_NAME || null,
    runId: process.env.GITHUB_RUN_ID || process.env.CIRCLE_WORKFLOW_ID || process.env.CI_PIPELINE_ID || null,
    jobId: process.env.GITHUB_JOB || process.env.CIRCLE_WORKFLOW_JOB_ID || process.env.CI_JOB_ID || null,
    runnerLabel: process.env.BENCH_RUNNER_LABEL || process.env.RUNNER_NAME || process.env.CIRCLE_JOB || null,
    cpuCount: globalThis.navigator?.hardwareConcurrency || null,
    nodeVersion: process.version,
    platform: `${process.platform}-${process.arch}`
  };
}
