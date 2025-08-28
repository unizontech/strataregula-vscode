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
function activate(context) {
    console.log('StrataRegula extension is now active!');
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
            await client.stop();
            startLanguageServer(context);
        }
        else {
            vscode.window.showInformationMessage('Starting StrataRegula...');
            startLanguageServer(context);
        }
    });
    context.subscriptions.push(compileCommand, previewCommand, doctorCommand, restartCommand);
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
    // Start the client (this will start the server)
    client.start().then(() => {
        console.log('StrataRegula Language Server started successfully');
        vscode.window.showInformationMessage('StrataRegula is ready!');
    }).catch((error) => {
        console.error('Failed to start StrataRegula Language Server:', error);
        vscode.window.showErrorMessage(`Failed to start StrataRegula: ${error.message}`);
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
function deactivate() {
    console.log('StrataRegula extension deactivated');
    // Stop the language client
    if (client) {
        return client.stop();
    }
    return undefined;
}
//# sourceMappingURL=extension.js.map