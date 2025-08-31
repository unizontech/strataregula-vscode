"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const path = require("path");
const child_process_1 = require("child_process");
const util_1 = require("util");
const node_1 = require("vscode-languageclient/node");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let client;
let statusBarItem;
function activate(context) {
    console.log('StrataRegula extension is now active!');
    // Initialize status bar
    initializeStatusBar(context);
    // Start the Language Server
    startLanguageServer(context);
    // Register StrataRegula compile command
    let compileCommand = vscode.commands.registerCommand('strataregula.compile', async (uri) => {
        const activeEditor = vscode.window.activeTextEditor;
        const targetFile = uri ? uri.fsPath : activeEditor?.document.uri.fsPath;
        if (!targetFile) {
            vscode.window.showErrorMessage('No YAML file selected');
            return;
        }
        if (!targetFile.endsWith('.yaml') && !targetFile.endsWith('.yml')) {
            vscode.window.showErrorMessage('Selected file is not a YAML file');
            return;
        }
        await compileStrataRegula(targetFile);
    });
    // Register StrataRegula preview command
    let previewCommand = vscode.commands.registerCommand('strataregula.preview', async () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor || (!activeEditor.document.fileName.endsWith('.yaml') && !activeEditor.document.fileName.endsWith('.yml'))) {
            vscode.window.showErrorMessage('Please open a YAML file first');
            return;
        }
        await previewCompileOutput(activeEditor.document.uri.fsPath);
    });
    // Register StrataRegula doctor command
    let doctorCommand = vscode.commands.registerCommand('strataregula.doctor', async () => {
        await runStrataRegulaDoctor();
    });
    // Register LSP restart command
    let restartCommand = vscode.commands.registerCommand('strataregulaLsp.restartServer', async () => {
        if (client) {
            vscode.window.showInformationMessage('Restarting StrataRegula...');
            updateStatusBar('indexing', 0);
            await client.stop();
            startLanguageServer(context);
        }
        else {
            vscode.window.showInformationMessage('Starting StrataRegula...');
            updateStatusBar('indexing', 0);
            startLanguageServer(context);
        }
    });
    // Register maintenance commands
    let reindexCommand = vscode.commands.registerCommand('strataregula.reindex', async () => {
        await runStrataRegulaReindex();
    });
    let resetCacheCommand = vscode.commands.registerCommand('strataregula.resetCache', async () => {
        await runStrataRegulaResetCache();
    });
    let showStatsCommand = vscode.commands.registerCommand('strataregula.showStats', async () => {
        await runStrataRegulaShowStats();
    });
    let generateProtocolCommand = vscode.commands.registerCommand('strataregula.generateProtocol', async (uri) => {
        await runStrataRegulaGenerateProtocol(uri);
    });
    let showStatsWebViewCommand = vscode.commands.registerCommand('strataregula.showStatsWebView', async () => {
        await runStrataRegulaShowStatsWebView();
    });
    let showKernelStatsCommand = vscode.commands.registerCommand('strataregula.showKernelStats', async () => {
        await runStrataRegulaShowKernelStats();
    });
    context.subscriptions.push(compileCommand, previewCommand, doctorCommand, restartCommand, reindexCommand, resetCacheCommand, showStatsCommand, generateProtocolCommand, showStatsWebViewCommand, showKernelStatsCommand);
}
function initializeStatusBar(context) {
    const config = vscode.workspace.getConfiguration('strataregula');
    const statusBarEnabled = config.get('statusBar.enabled', true);
    if (!statusBarEnabled) {
        return;
    }
    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "$(loading~spin) Initializing...";
    statusBarItem.tooltip = "StrataRegula Language Server";
    statusBarItem.command = 'strataregula.showStats';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
    // Watch for configuration changes
    const configWatcher = vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('strataregula.statusBar.enabled')) {
            const newEnabled = vscode.workspace.getConfiguration('strataregula').get('statusBar.enabled', true);
            if (newEnabled && !statusBarItem) {
                initializeStatusBar(context);
            }
            else if (!newEnabled && statusBarItem) {
                statusBarItem.hide();
                statusBarItem.dispose();
            }
        }
    });
    context.subscriptions.push(configWatcher);
}
function updateStatusBar(status, fileCount) {
    if (!statusBarItem) {
        return;
    }
    switch (status) {
        case 'indexing':
            statusBarItem.text = fileCount > 0
                ? `$(loading~spin) Indexing... (${fileCount} files)`
                : "$(loading~spin) Indexing...";
            statusBarItem.tooltip = "StrataRegula is indexing YAML files";
            statusBarItem.backgroundColor = undefined;
            break;
        case 'ready':
            statusBarItem.text = fileCount > 0
                ? `$(check) Ready (${fileCount} files)`
                : "$(check) Ready";
            statusBarItem.tooltip = "StrataRegula Language Server is ready - Click for Kernel stats";
            statusBarItem.backgroundColor = undefined;
            statusBarItem.command = 'strataregula.showKernelStats';
            break;
        case 'error':
            statusBarItem.text = "$(error) Error";
            statusBarItem.tooltip = "StrataRegula Language Server encountered an error";
            statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
            break;
    }
}
function startLanguageServer(context) {
    // Path to the LSP server launcher script
    const serverScript = path.join(context.extensionPath, 'server', 'lsp_server.py');
    // LSP server options - using Python launcher script
    const serverOptions = {
        command: 'python',
        args: [serverScript],
        options: {
            cwd: context.extensionPath
        }
    };
    // Language client options
    const clientOptions = {
        // Register the server for YAML files
        documentSelector: [
            { scheme: 'file', language: 'yaml' },
            { scheme: 'file', language: 'yml' },
            { scheme: 'file', language: 'strataregula-yaml' }
        ],
        synchronize: {
            // Notify the server about file changes to YAML files
            fileEvents: vscode.workspace.createFileSystemWatcher('**/*.{yaml,yml}')
        },
        // Output channel for LSP communication debugging
        outputChannelName: 'StrataRegula Language Server',
        // Enable tracing for debugging
        traceOutputChannel: vscode.window.createOutputChannel('StrataRegula LSP Trace')
    };
    // Create and start the language client
    client = new node_1.LanguageClient('strataregula-lsp', 'StrataRegula Language Server', serverOptions, clientOptions);
    // Update status bar to show indexing
    updateStatusBar('indexing', 0);
    // Start the client (this will start the server)
    client.start().then(() => {
        console.log('StrataRegula Language Server started successfully');
        vscode.window.showInformationMessage('StrataRegula is ready!');
        // Listen for indexing progress notifications from the server
        client.onNotification('strataregula/indexingProgress', (params) => {
            if (params.status === 'indexing') {
                updateStatusBar('indexing', params.processedFiles || 0);
            }
            else if (params.status === 'ready') {
                updateStatusBar('ready', params.totalFiles || 0);
            }
        });
        // Default to ready state if no specific notification received
        setTimeout(() => {
            updateStatusBar('ready', 0);
        }, 2000);
    }).catch((error) => {
        console.error('Failed to start StrataRegula Language Server:', error);
        vscode.window.showErrorMessage(`Failed to start StrataRegula: ${error.message}`);
        updateStatusBar('error', 0);
    });
}
// LSP provides completion functionality, no need for custom completion provider
async function compileStrataRegula(filePath) {
    try {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Compiling StrataRegula configuration...",
            cancellable: false
        }, async () => {
            const command = `strataregula compile --traffic "${filePath}" --format python`;
            const { stdout, stderr } = await execAsync(command);
            if (stderr) {
                vscode.window.showErrorMessage(`StrataRegula compile error: ${stderr}`);
            }
            else {
                // Create new document with compiled output
                const outputPath = filePath.replace(/\.(yaml|yml)$/, '_compiled.py');
                await vscode.workspace.fs.writeFile(vscode.Uri.file(outputPath), Buffer.from(stdout, 'utf8'));
                // Open the compiled file
                const doc = await vscode.workspace.openTextDocument(outputPath);
                await vscode.window.showTextDocument(doc);
                vscode.window.showInformationMessage(`StrataRegula compilation successful! Output saved to ${path.basename(outputPath)}`);
            }
        });
    }
    catch (error) {
        vscode.window.showErrorMessage(`StrataRegula compilation failed: ${error}`);
    }
}
async function previewCompileOutput(filePath) {
    try {
        const command = `strataregula compile --traffic "${filePath}" --dump-compiled-config --dump-format tree`;
        const { stdout, stderr } = await execAsync(command);
        if (stderr) {
            vscode.window.showErrorMessage(`StrataRegula preview error: ${stderr}`);
        }
        else {
            // Show preview in a new editor
            const previewDoc = await vscode.workspace.openTextDocument({
                content: stdout,
                language: 'text'
            });
            await vscode.window.showTextDocument(previewDoc, vscode.ViewColumn.Beside);
        }
    }
    catch (error) {
        vscode.window.showErrorMessage(`StrataRegula preview failed: ${error}`);
    }
}
async function runStrataRegulaDoctor() {
    try {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Running StrataRegula environment check...",
            cancellable: false
        }, async () => {
            const command = `strataregula doctor --fix-suggestions`;
            const { stdout, stderr } = await execAsync(command);
            const output = stdout + (stderr ? `\nErrors:\n${stderr}` : '');
            // Show doctor output in a new editor
            const doctorDoc = await vscode.workspace.openTextDocument({
                content: output,
                language: 'text'
            });
            await vscode.window.showTextDocument(doctorDoc, vscode.ViewColumn.Beside);
            vscode.window.showInformationMessage('StrataRegula environment check completed!');
        });
    }
    catch (error) {
        vscode.window.showErrorMessage(`StrataRegula doctor failed: ${error}`);
    }
}
async function runStrataRegulaReindex() {
    try {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Reindexing StrataRegula configurations...",
            cancellable: false
        }, async () => {
            const command = `strataregula index --rebuild --force`;
            const { stdout, stderr } = await execAsync(command);
            if (stderr) {
                vscode.window.showErrorMessage(`StrataRegula reindex error: ${stderr}`);
            }
            else {
                vscode.window.showInformationMessage('StrataRegula reindex completed successfully!');
                // Restart LSP to pick up new index
                if (client) {
                    await client.stop();
                    startLanguageServer(vscode.extensions.getExtension('Unizontechcoltd.StrataRegula')?.extensionPath ? { extensionPath: vscode.extensions.getExtension('Unizontechcoltd.StrataRegula').extensionPath } : {});
                }
            }
        });
    }
    catch (error) {
        vscode.window.showErrorMessage(`StrataRegula reindex failed: ${error}`);
    }
}
async function runStrataRegulaResetCache() {
    try {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Resetting StrataRegula cache...",
            cancellable: false
        }, async () => {
            const command = `strataregula cache --clear --all`;
            const { stdout, stderr } = await execAsync(command);
            if (stderr) {
                vscode.window.showErrorMessage(`StrataRegula cache reset error: ${stderr}`);
            }
            else {
                vscode.window.showInformationMessage('StrataRegula cache reset successfully!');
                // Restart LSP to start with fresh cache
                if (client) {
                    await client.stop();
                    startLanguageServer(vscode.extensions.getExtension('Unizontechcoltd.StrataRegula')?.extensionPath ? { extensionPath: vscode.extensions.getExtension('Unizontechcoltd.StrataRegula').extensionPath } : {});
                }
            }
        });
    }
    catch (error) {
        vscode.window.showErrorMessage(`StrataRegula cache reset failed: ${error}`);
    }
}
async function runStrataRegulaShowStats() {
    try {
        const command = `strataregula stats --format json --include-patterns`;
        const { stdout, stderr } = await execAsync(command);
        if (stderr) {
            vscode.window.showErrorMessage(`StrataRegula stats error: ${stderr}`);
        }
        else {
            // Show stats in a new editor
            const statsDoc = await vscode.workspace.openTextDocument({
                content: stdout,
                language: 'json'
            });
            await vscode.window.showTextDocument(statsDoc, vscode.ViewColumn.Beside);
        }
    }
    catch (error) {
        vscode.window.showErrorMessage(`StrataRegula stats failed: ${error}`);
    }
}
async function runStrataRegulaGenerateProtocol(uri) {
    try {
        const activeEditor = vscode.window.activeTextEditor;
        const targetFile = uri ? uri.fsPath : activeEditor?.document.uri.fsPath;
        if (!targetFile) {
            vscode.window.showErrorMessage('No YAML file selected');
            return;
        }
        if (!targetFile.endsWith('.yaml') && !targetFile.endsWith('.yml')) {
            vscode.window.showErrorMessage('Selected file is not a YAML file');
            return;
        }
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Generating Python protocols...",
            cancellable: false
        }, async () => {
            const command = `strataregula compile --traffic "${targetFile}" --format protocols --output-protocols`;
            const { stdout, stderr } = await execAsync(command);
            if (stderr) {
                vscode.window.showErrorMessage(`StrataRegula protocol generation error: ${stderr}`);
            }
            else {
                // Create protocol output file
                const protocolPath = targetFile.replace(/\.(yaml|yml)$/, '_protocols.py');
                await vscode.workspace.fs.writeFile(vscode.Uri.file(protocolPath), Buffer.from(stdout, 'utf8'));
                // Open the protocol file
                const doc = await vscode.workspace.openTextDocument(protocolPath);
                await vscode.window.showTextDocument(doc);
                vscode.window.showInformationMessage(`Python protocols generated! Output saved to ${path.basename(protocolPath)}`);
            }
        });
    }
    catch (error) {
        vscode.window.showErrorMessage(`StrataRegula protocol generation failed: ${error}`);
    }
}
async function runStrataRegulaShowStatsWebView() {
    try {
        const command = `strataregula stats --format json --include-patterns --web-view`;
        const { stdout, stderr } = await execAsync(command);
        if (stderr) {
            vscode.window.showErrorMessage(`StrataRegula stats webview error: ${stderr}`);
        }
        else {
            // Create webview panel for stats visualization
            const panel = vscode.window.createWebviewPanel('strataregula-stats', 'StrataRegula Index Stats', vscode.ViewColumn.One, {
                enableScripts: true,
                retainContextWhenHidden: true
            });
            // Generate HTML content with stats visualization
            const statsData = JSON.parse(stdout);
            panel.webview.html = generateStatsWebViewHtml(statsData);
        }
    }
    catch (error) {
        vscode.window.showErrorMessage(`StrataRegula stats webview failed: ${error}`);
    }
}
function generateStatsWebViewHtml(statsData) {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>StrataRegula Index Stats</title>
        <style>
            body { 
                font-family: var(--vscode-font-family); 
                padding: 20px; 
                color: var(--vscode-foreground);
                background-color: var(--vscode-editor-background);
            }
            .stat-card {
                border: 1px solid var(--vscode-panel-border);
                border-radius: 4px;
                padding: 16px;
                margin: 8px 0;
                background-color: var(--vscode-editor-background);
            }
            .stat-title { font-weight: bold; color: var(--vscode-textLink-foreground); }
            .stat-value { font-size: 1.2em; margin: 4px 0; }
            .progress-bar {
                background-color: var(--vscode-progressBar-background);
                height: 8px;
                border-radius: 4px;
                margin: 8px 0;
            }
            .progress-fill {
                background-color: var(--vscode-progressBar-background);
                height: 100%;
                border-radius: 4px;
            }
        </style>
    </head>
    <body>
        <h1>📊 StrataRegula Index Statistics</h1>
        
        <div class="stat-card">
            <div class="stat-title">📁 Indexed Files</div>
            <div class="stat-value">${statsData.totalFiles || 0} files</div>
        </div>

        <div class="stat-card">
            <div class="stat-title">🔍 Pattern Coverage</div>
            <div class="stat-value">${statsData.patterns || 0} unique patterns</div>
        </div>

        <div class="stat-card">
            <div class="stat-title">⚡ Cache Performance</div>
            <div class="stat-value">Hit Rate: ${statsData.cacheHitRate || '0'}%</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${statsData.cacheHitRate || 0}%"></div>
            </div>
        </div>

        <div class="stat-card">
            <div class="stat-title">📈 Index Health</div>
            <div class="stat-value">
                Memory Usage: ${statsData.memoryUsage || 'Unknown'}<br>
                Last Updated: ${statsData.lastUpdated || 'Unknown'}
            </div>
        </div>

        <script>
            // Auto-refresh every 30 seconds
            setTimeout(() => {
                vscode.postMessage({ command: 'refresh' });
            }, 30000);
        </script>
    </body>
    </html>`;
}
async function runStrataRegulaShowKernelStats() {
    try {
        // Use Python to get Kernel statistics
        const command = `python -c "
from strataregula import Kernel
import json
try:
    kernel = Kernel()
    stats = kernel.get_stats()
    stats['visualization'] = kernel.get_stats_visualization()
    print(json.dumps(stats, indent=2))
except Exception as e:
    print(json.dumps({'error': str(e), 'message': 'Kernel v0.3.0 may not be available'}))
"`;
        const { stdout, stderr } = await execAsync(command);
        if (stderr) {
            vscode.window.showWarningMessage(`Kernel stats warning: ${stderr}`);
        }
        try {
            const kernelStats = JSON.parse(stdout);
            if (kernelStats.error) {
                vscode.window.showInformationMessage(`StrataRegula Kernel: ${kernelStats.message}`);
                return;
            }
            // Create a formatted stats display
            const statsText = `StrataRegula Kernel v0.3.0 Statistics

🧮 Query Performance:
  • Cache Hit Rate: ${kernelStats.hit_rate?.toFixed(1) || 0}%
  • Total Queries: ${kernelStats.total_queries || 0}
  • Cache Hits: ${kernelStats.cache_hits || 0}
  • Cache Misses: ${kernelStats.cache_misses || 0}

🏛️ Architecture:
  • Registered Passes: ${kernelStats.registered_passes?.length || 0}
  • Registered Views: ${kernelStats.registered_views?.length || 0}
  
💾 Cache Backend:
  • Type: ${kernelStats.cache_backend?.type || 'N/A'}
  • Size: ${kernelStats.cache_backend?.size || 0}/${kernelStats.cache_backend?.max_size || 1000}

${kernelStats.visualization || ''}

💡 Tip: Use strataregula.showStatsWebView for interactive visualization`;
            // Show in new document
            const statsDoc = await vscode.workspace.openTextDocument({
                content: statsText,
                language: 'text'
            });
            await vscode.window.showTextDocument(statsDoc, vscode.ViewColumn.Beside);
        }
        catch (parseError) {
            vscode.window.showErrorMessage(`Failed to parse Kernel stats: ${parseError}`);
        }
    }
    catch (error) {
        vscode.window.showErrorMessage(`StrataRegula Kernel stats failed: ${error}`);
    }
}
function deactivate() {
    console.log('StrataRegula extension deactivated');
    // Dispose of status bar item
    if (statusBarItem) {
        statusBarItem.dispose();
    }
    // Stop the language client
    if (client) {
        return client.stop();
    }
    return undefined;
}
//# sourceMappingURL=extension.js.map