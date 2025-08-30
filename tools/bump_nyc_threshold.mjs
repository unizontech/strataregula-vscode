#!/usr/bin/env node
/**
 * NYC Threshold Bumper - Monthly +5pt automation
 * 
 * Usage: node tools/bump_nyc_threshold.mjs
 * 
 * This tool:
 * 1. Reads current lines threshold from .nycrc.json
 * 2. Measures current coverage by running tests
 * 3. Only bumps threshold +5pt if current coverage supports it
 * 4. Updates .nycrc.json with new threshold
 * 5. Safe operation: won't break existing tests
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const run = (cmd, args) => {
  console.log(`Running: ${cmd} ${args.join(' ')}`);
  return spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
};

const root = process.cwd();
const nycrcPath = path.join(root, ".nycrc.json");

console.log("NYC Threshold Bumper - Monthly +5pt Automation");
console.log("=".repeat(55));

// Step 1: Read current threshold
if (!fs.existsSync(nycrcPath)) {
  console.log("No .nycrc.json found; skipping bump");
  process.exit(0);
}

const cfg = JSON.parse(fs.readFileSync(nycrcPath, "utf8"));
const current = Number(cfg.lines ?? 0);
const target = current + 5;

console.log(`Current threshold: ${current}%`);
console.log(`Target threshold: ${target}%`);

// Step 2: Measure current HEAD coverage
console.log("Step 1: Measuring current coverage...");
run("npm", ["run", "test:cov"]);

const summaryPath = path.join(root, "coverage", "coverage-summary.json");
if (!fs.existsSync(summaryPath)) {
  console.log("Could not measure current coverage; skipping bump");
  process.exit(0);
}

const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));
const pct = Number(summary.total?.lines?.pct ?? 0);

console.log(`Current coverage: ${pct}%`);

// Step 3: Safety check and conditional bump
if (pct >= target) {
  cfg.lines = target;
  fs.writeFileSync(nycrcPath, JSON.stringify(cfg, null, 2));
  console.log(`Bumped NYC lines threshold: ${current}% -> ${target}% (current: ${pct}%)`);
  console.log(`Updated .nycrc.json configuration`);
  console.log(`Next month target: ${target + 5}%`);
} else {
  console.log(`Skip bump: current coverage ${pct}% < target ${target}%`);
  console.log(`Need +${(target - pct).toFixed(1)}% coverage improvement before next bump`);
}