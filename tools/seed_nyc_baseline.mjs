#!/usr/bin/env node
/**
 * Seed NYC Baseline - Automatically set coverage threshold from current level
 * 
 * Usage: node tools/seed_nyc_baseline.mjs
 * 
 * This tool:
 * 1. Runs npm test:cov to generate coverage data
 * 2. Extracts current lines percentage from coverage-summary.json
 * 3. Sets .nycrc.json lines threshold to (current - 2pt) for safety buffer
 * 4. Prevents immediate regression while allowing gradual improvement
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function run(cmd, args) {
  console.log(`Running: ${cmd} ${args.join(' ')}`);
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
  if (r.error) throw r.error;
}

const root = process.cwd();
const nycrcPath = path.join(root, ".nycrc.json");

console.log("NYC Baseline Seeder - Automatic Threshold Detection");
console.log("=".repeat(55));

// Step 1: Generate coverage data (allow failure)
console.log("Step 1: Generating coverage data...");
try { 
  run("npm", ["run", "test:cov"]); 
} catch (e) {
  console.log("Coverage generation failed, but continuing to check for existing data...");
}

// Step 2: Extract coverage percentage
console.log("Step 2: Reading coverage data...");
const sumPath = path.join(root, "coverage", "coverage-summary.json");
if (!fs.existsSync(sumPath)) {
  console.log("No coverage/coverage-summary.json found; skipping seed.");
  process.exit(0);
}

const summary = JSON.parse(fs.readFileSync(sumPath, "utf8"));
const pct = summary.total?.lines?.pct ?? null;
if (pct == null) {
  console.log("No lines.pct in coverage summary; skipping seed.");
  process.exit(0);
}

console.log(`Current lines coverage: ${pct}%`);

// Step 3: Calculate safe baseline (current - 2pt buffer)
const base = Math.max(0, Math.floor(pct) - 2);

// Step 4: Update .nycrc.json configuration
console.log("Step 3: Updating .nycrc.json...");
const cfg = JSON.parse(fs.readFileSync(nycrcPath, "utf8"));
cfg["check-coverage"] = true;
cfg["lines"] = base;
fs.writeFileSync(nycrcPath, JSON.stringify(cfg, null, 2));

console.log(`Seeded NYC lines threshold: ${base}% (from ${pct}% with 2pt safety buffer)`);
console.log(`Updated .nycrc.json configuration`);
console.log(`Quality gate: Current tests will pass, regressions will fail`);
console.log(`Next month target: ${base + 5}%`);