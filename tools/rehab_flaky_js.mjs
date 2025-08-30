#!/usr/bin/env node
/**
 * Flaky Test Rehabilitation Tool (TypeScript/Node.js)
 * 
 * Usage: node tools/rehab_flaky_js.mjs
 * 
 * This tool:
 * 1. Loads quarantined tests from tests/flaky_quarantine.json
 * 2. Runs each test 10 times consecutively using npm test
 * 3. If all 10 runs pass, removes the test from quarantine
 * 4. Updates the quarantine file with results
 * 5. Reports rehabilitated tests for CI automation
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

const REHAB_RUNS = parseInt(process.env.REHAB_RUNS || '10');

async function loadQuarantine() {
    const qfile = path.join('tests', 'flaky_quarantine.json');
    
    try {
        await fs.access(qfile);
        const content = await fs.readFile(qfile, 'utf-8');
        const quarantine = JSON.parse(content);
        
        // Filter out metadata entries
        const testEntries = Object.fromEntries(
            Object.entries(quarantine).filter(([key]) => !key.startsWith('_'))
        );
        
        return { testEntries, qfile, fullQuarantine: quarantine };
    } catch (error) {
        console.warn('Could not load quarantine file:', error.message);
        return { testEntries: {}, qfile, fullQuarantine: {} };
    }
}

async function testStability(testName, runs = REHAB_RUNS) {
    console.log(`Testing "${testName}" for ${runs} consecutive runs...`);
    
    for (let i = 0; i < runs; i++) {
        const success = await runSingleTest(testName);
        
        if (!success) {
            console.log(`  Run ${i + 1}: FAILED`);
            return false;
        }
        
        console.log(`  Run ${i + 1}: PASSED`);
    }
    
    console.log(`  All ${runs} runs PASSED - candidate for rehabilitation!`);
    return true;
}

async function runSingleTest(testName) {
    return new Promise((resolve) => {
        // Run npm test with test name filter
        const proc = spawn('npm', ['test', '--', '--testNamePattern', testName], {
            stdio: ['inherit', 'pipe', 'pipe']
        });
        
        let output = '';
        
        proc.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        proc.stderr.on('data', (data) => {
            output += data.toString();
        });
        
        proc.on('close', (code) => {
            // Check for test success indicators
            const success = code === 0 && (
                output.includes('PASS') || 
                output.includes('✓') ||
                !output.includes('FAIL')
            );
            resolve(success);
        });
    });
}

async function main() {
    console.log(`Flaky Test Rehabilitation (JS) - Testing with ${REHAB_RUNS} consecutive runs`);
    console.log('='.repeat(65));
    
    const { testEntries, qfile, fullQuarantine } = await loadQuarantine();
    
    if (Object.keys(testEntries).length === 0) {
        console.log('No tests in quarantine - nothing to rehabilitate');
        return 0;
    }
    
    console.log(`Found ${Object.keys(testEntries).length} quarantined tests`);
    
    // Test each quarantined item for stability
    const stableTests = [];
    for (const [testName, reason] of Object.entries(testEntries)) {
        console.log(`\nTesting: ${testName}`);
        console.log(`Reason: ${reason}`);
        
        if (await testStability(testName)) {
            stableTests.push(testName);
        } else {
            console.log('Still flaky - keeping in quarantine');
        }
    }
    
    // Update quarantine file
    if (stableTests.length > 0) {
        console.log(`\n🎉 Rehabilitating ${stableTests.length} stable tests:`);
        for (const testName of stableTests) {
            console.log(`  - ${testName}`);
            delete fullQuarantine[testName];
        }
        
        // Write updated quarantine file
        const updatedContent = JSON.stringify(fullQuarantine, null, 2);
        await fs.writeFile(qfile, updatedContent, 'utf-8');
        
        console.log(`\nUpdated quarantine file: ${qfile}`);
        console.log('These tests are now back in active testing!');
        
    } else {
        console.log(`\nNo tests passed ${REHAB_RUNS} consecutive runs`);
        console.log('All quarantined tests remain unstable');
    }
    
    return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().then(process.exit).catch(err => {
        console.error(err);
        process.exit(1);
    });
}