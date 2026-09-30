import test from "node:test";
import assert from "node:assert/strict";
import { parseArgs, round } from "./lib.mjs";

test("parseArgs accepts separated and inline values", () => {
  assert.deepEqual(parseArgs(["--provider", "local", "--workload=all", "--verbose"]), {
    provider: "local",
    workload: "all",
    verbose: true
  });
});

test("round keeps two decimal places", () => {
  assert.equal(round(12.3456), 12.35);
});

