#!/usr/bin/env node
/**
 * Flaky Test Scanner - Detect intermittent test failures (TypeScript/Node.js)
 * 
 * Usage: node tools/flaky_scan.mjs
 * 
 * This tool:
 * 1. Runs npm test multiple times (default: 3)
 * 2. Collects test output from each run
 * 3. Identifies tests that fail sometimes but not always (flaky)
 * 4. Generates weekly report in docs/reports/flaky.md
 * 5. Helps identify and isolate unstable tests
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

const RUNS = parseInt(process.env.FLAKY_RUNS || '3');
const REPORT_DIR = path.join('reports', 'npm');

async function ensureDir(dir) {
    try {
        await fs.mkdir(dir, { recursive: true });
    } catch (err) {
        // Directory might already exist
    }
}

async function runOnce(runNumber) {
    console.log(`Run ${runNumber}: npm test`);
    
    return new Promise((resolve) => {
        const proc = spawn('npm', ['test'], {
            stdio: ['inherit', 'pipe', 'pipe']
        });
        
        let stdout = '';
        let stderr = '';
        
        proc.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        
        proc.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        
        proc.on('close', (code) => {
            resolve({
                code,
                stdout,
                stderr,
                failed: parseFailedTests(stdout + stderr)
            });
        });
    });
}

function parseFailedTests(output) {
    const failed = new Set();
    
    // Common test failure patterns
    const patterns = [
        // Mocha patterns
        /^\s*\d+\)\s+(.+)$/gm,
        // Jest patterns  
        /FAIL\s+(.+\.test\.(js|ts))/gm,
        // Generic failure patterns
        /Error:\s+(.+)\s+at/gm,
        /failing\s+(.+)/gm
    ];
    
    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(output)) !== null) {
            if (match[1]) {
                failed.add(match[1].trim());
            }
        }
    });
    
    return failed;
}

async function main() {
    console.log(`Flaky Test Scanner - Running ${RUNS} test iterations`);
    console.log('='.repeat(55));
    
    await ensureDir(REPORT_DIR);
    
    // Step 1: Run tests multiple times
    const runs = [];
    for (let i = 1; i <= RUNS; i++) {
        const result = await runOnce(i);
        runs.push(result.failed);
        console.log(`Run ${i}: ${result.failed.size} failed tests`);
        
        // Save detailed output for debugging
        const outputPath = path.join(REPORT_DIR, `test_run_${i}.log`);
        await fs.writeFile(outputPath, `Exit code: ${result.code}\n\nSTDOUT:\n${result.stdout}\n\nSTDERR:\n${result.stderr}`);
    }
    
    // Step 2: Analyze flaky patterns
    const union = new Set();
    runs.forEach(failed => failed.forEach(test => union.add(test)));
    
    const always = runs.length > 0 ? 
        Array.from(union).filter(test => runs.every(failed => failed.has(test))) : [];
    
    const flaky = Array.from(union).filter(test => !always.includes(test));
    
    console.log(`\nResults: ${flaky.length} flaky, ${always.length} always failing, ${union.size} total failed`);
    
    // Step 3: Generate report
    const now = new Date();
    const jstOffset = 9 * 60; // JST is UTC+9
    const jstTime = new Date(now.getTime() + jstOffset * 60 * 1000);
    const timestamp = jstTime.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' JST');
    
    await ensureDir('docs/reports');
    const reportPath = path.join('docs', 'reports', 'flaky.md');
    
    const lines = [
        `## Flaky Report – ${timestamp}`,
        `- Runs: ${RUNS}`,
        `- Flaky: **${flaky.length}** | Always failing: ${always.length}`,
        '',
        '### Flaky tests'
    ];
    
    if (flaky.length > 0) {
        flaky.sort().forEach(test => lines.push(`- ${test}`));
    } else {
        lines.push('- (none)');
    }
    
    lines.push('', '---', '');
    
    // Prepend to existing report
    let existing = '';
    try {
        existing = await fs.readFile(reportPath, 'utf-8');
    } catch (err) {
        // File doesn't exist yet
    }
    
    await fs.writeFile(reportPath, lines.join('\n') + existing);
    
    console.log(`Report written to: ${reportPath}`);
    return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().then(process.exit).catch(err => {
        console.error(err);
        process.exit(1);
    });
}