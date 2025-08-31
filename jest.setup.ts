/**
 * Jest Setup for Flaky Test Quarantine
 * 
 * This setup file automatically skips tests that are listed in the quarantine file
 * to prevent CI failures from intermittent test issues.
 */

import fs from 'node:fs';
import path from 'node:path';

// Load quarantine list
let quarantine: Record<string, string> = {};
try {
    const quarantinePath = path.join(__dirname, 'tests', 'flaky_quarantine.json');
    if (fs.existsSync(quarantinePath)) {
        const content = fs.readFileSync(quarantinePath, 'utf8');
        quarantine = JSON.parse(content);
    }
} catch (error) {
    console.warn('Could not load flaky quarantine list:', error);
}

// Store original it function
const originalIt = global.it;
const originalTest = global.test;

// Override it/test functions to check quarantine
function createQuarantineWrapper(originalFn: any) {
    return function(name: string, fn: any, timeout?: number) {
        // Check if test is quarantined
        if (quarantine[name]) {
            return originalFn.skip(`${name} [QUARANTINED: ${quarantine[name]}]`, fn, timeout);
        }
        
        // Check partial matches for flexibility
        for (const [pattern, reason] of Object.entries(quarantine)) {
            if (name.includes(pattern) && !pattern.startsWith('_')) {
                return originalFn.skip(`${name} [QUARANTINED: ${reason}]`, fn, timeout);
            }
        }
        
        return originalFn(name, fn, timeout);
    };
}

// Apply quarantine wrapper
(global as any).it = createQuarantineWrapper(originalIt);
(global as any).test = createQuarantineWrapper(originalTest);

// Also handle describe.only and it.only cases
if (originalIt.only) {
    (global as any).it.only = originalIt.only;
}
if (originalIt.skip) {
    (global as any).it.skip = originalIt.skip;
}
if ((global as any).test.only) {
    (global as any).test.only = (global as any).test.only;
}
if ((global as any).test.skip) {
    (global as any).test.skip = (global as any).test.skip;
}