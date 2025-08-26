"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const path = require("path");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
function activate(context) {
    console.log('StrataRegula extension is now active!');
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
    context.subscriptions.push(compileCommand, previewCommand, doctorCommand);
    // Register completion provider for StrataRegula patterns
    const completionProvider = vscode.languages.registerCompletionItemProvider({ scheme: 'file', language: 'yaml' }, new StrataRegulaCompletionProvider(), '.', '*');
    context.subscriptions.push(completionProvider);
}
exports.activate = activate;
class StrataRegulaCompletionProvider {
    provideCompletionItems(document, position) {
        const linePrefix = document.lineAt(position).text.substr(0, position.character);
        // Check if we're in a context where StrataRegula patterns make sense
        if (!this.isStrataRegulaContext(document, position)) {
            return [];
        }
        const completions = [];
        // Wildcard pattern completions
        if (linePrefix.includes(':')) {
            const wildcardCompletion = new vscode.CompletionItem('*.', vscode.CompletionItemKind.Snippet);
            wildcardCompletion.detail = 'StrataRegula wildcard pattern';
            wildcardCompletion.documentation = 'Single-level wildcard pattern for StrataRegula';
            wildcardCompletion.insertText = new vscode.SnippetString('*.');
            completions.push(wildcardCompletion);
            const recursiveWildcardCompletion = new vscode.CompletionItem('**.', vscode.CompletionItemKind.Snippet);
            recursiveWildcardCompletion.detail = 'StrataRegula recursive wildcard pattern';
            recursiveWildcardCompletion.documentation = 'Multi-level recursive wildcard pattern for StrataRegula';
            recursiveWildcardCompletion.insertText = new vscode.SnippetString('**.');
            completions.push(recursiveWildcardCompletion);
        }
        // Common StrataRegula configuration patterns
        const commonPatterns = [
            {
                label: 'service_times',
                detail: 'StrataRegula service timing configuration',
                snippet: 'service_times:\n  ${1:web}.*.${2:response}: ${3:200}\n  ${4:api}.*.${5:timeout}: ${6:30}'
            },
            {
                label: 'resource_limits',
                detail: 'StrataRegula resource limit configuration',
                snippet: 'resource_limits:\n  ${1:web}.*.${2:cpu}: ${3:80}\n  ${4:api}.*.${5:memory}: ${6:512}'
            },
            {
                label: 'traffic_routing',
                detail: 'StrataRegula traffic routing configuration',
                snippet: 'traffic_routing:\n  ${1:frontend}.*.${2:route}: ${3:"/api/v1"}\n  ${4:backend}.*.${5:endpoint}: ${6:":8080"}'
            }
        ];
        for (const pattern of commonPatterns) {
            const completion = new vscode.CompletionItem(pattern.label, vscode.CompletionItemKind.Snippet);
            completion.detail = pattern.detail;
            completion.insertText = new vscode.SnippetString(pattern.snippet);
            completions.push(completion);
        }
        return completions;
    }
    isStrataRegulaContext(document, position) {
        // Simple heuristic: check if document contains StrataRegula-style patterns
        const content = document.getText();
        return content.includes('*') || content.includes('service_times') ||
            content.includes('resource_limits') || content.includes('traffic');
    }
}
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
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map