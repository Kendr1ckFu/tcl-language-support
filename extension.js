const vscode = require('vscode');
let statusBar; // Define as global variable

function activate(context) {
    statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.command = 'extension.selectTclInterpreter';
    updateStatusBar(); // Initial update
    statusBar.show();

    let disposableSelectInterpreter = vscode.commands.registerCommand('extension.selectTclInterpreter', async function () {
        const path = await vscode.window.showOpenDialog({
            canSelectMany: false,
            openLabel: 'Select Tcl Interpreter',
            filters: {
                'Executable Files': ['exe', '']
            }
        });

        if (path && path[0]) {
            const tclInterpreterPath = path[0].fsPath;
            await vscode.workspace.getConfiguration('tcl').update('interpreterPath', tclInterpreterPath, vscode.ConfigurationTarget.Global);
            updateStatusBar(tclInterpreterPath);
        } else {
            vscode.window.showInformationMessage('Tcl Interpreter selection was cancelled.');
        }
    });

    let disposableRunTclFile = vscode.commands.registerCommand('extension.runTclFile', function () {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.languageId === 'tcl') {
            const tclInterpreterPath = vscode.workspace.getConfiguration('tcl').get('interpreterPath');
            const filePath = editor.document.fileName;
            if (tclInterpreterPath) {
                const terminal = vscode.window.createTerminal(`Tcl Terminal`);
                const shellPath = terminal.creationOptions.shellPath;
                let command;

                // Determine the shell type and construct the command accordingly
                if (shellPath && shellPath.includes("powershell")) {
                    command = `& "${tclInterpreterPath}" "${filePath}"`; // PowerShell command
                } else {
                    command = `"${tclInterpreterPath}" "${filePath}"`; // CMD or other shells
                }

                terminal.sendText(command);
                terminal.show();
            } else {
                vscode.window.showErrorMessage('No Tcl interpreter path set. Please set the path and try again.');
            }
        } else {
            vscode.window.showErrorMessage('The current file is not a Tcl script.');
        }
    });

    context.subscriptions.push(disposableSelectInterpreter, disposableRunTclFile, statusBar);
}

function updateStatusBar(tclInterpreterPath = '') {
    if (!tclInterpreterPath) {
        tclInterpreterPath = vscode.workspace.getConfiguration('tcl').get('interpreterPath');
    }
    statusBar.text = `Tcl: ${tclInterpreterPath || 'Select Interpreter'}`;
    statusBar.tooltip = tclInterpreterPath ? `Using Tcl Interpreter at ${tclInterpreterPath}` : 'Select Tcl Interpreter';
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};