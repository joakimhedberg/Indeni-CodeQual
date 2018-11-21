'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const sections_1 = require("./code-quality/sections");
const code_validation_1 = require("./code-quality/code-validation");
const CodeValidation_1 = require("./code-quality/code-quality-base/CodeValidation");
let errorDecorationType;
let warningDecorationType;
let infoDecorationType;
let live_update = true;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    errorDecorationType = vscode.window.createTextEditorDecorationType({
        borderWidth: '1px',
        borderStyle: 'solid',
        overviewRulerColor: 'red',
        overviewRulerLane: vscode.OverviewRulerLane.Right,
        light: {
            borderColor: { id: 'extension.errorBorderColor' },
        },
        dark: {
            borderColor: { id: 'extension.errorBorderColor' }
        }
    });
    warningDecorationType = vscode.window.createTextEditorDecorationType({
        borderWidth: '1px',
        borderStyle: 'solid',
        overviewRulerColor: 'yellow',
        overviewRulerLane: vscode.OverviewRulerLane.Right,
        light: {
            borderColor: { id: 'extension.warningBorderColor' }
        },
        dark: {
            borderColor: { id: 'extension.warningBorderColor' }
        }
    });
    infoDecorationType = vscode.window.createTextEditorDecorationType({
        borderWidth: '1px',
        borderStyle: 'solid',
        overviewRulerColor: 'blue',
        overviewRulerLane: vscode.OverviewRulerLane.Right,
        light: {
            borderColor: 'blue'
        },
        dark: {
            borderColor: '#00cccc'
        }
    });
    vscode.window.showInformationMessage("We are live!");
    vscode.window.onDidChangeActiveTextEditor(text_editor_changed);
    vscode.workspace.onDidChangeTextDocument(text_document_changed);
    let trigger_update_command = vscode.commands.registerCommand('extension.triggerUpdate', () => {
        var editor = vscode.window.activeTextEditor;
        if (editor !== null && editor !== undefined) {
            updateDecorations(editor.document);
        }
    });
    let set_language_command = vscode.commands.registerCommand('extension.setLanguage', () => {
        var editor = vscode.window.activeTextEditor;
        if (editor !== undefined) {
            setLanguage(editor.document);
        }
    });
    let trigger_clear_command = vscode.commands.registerCommand('extension.triggerClear', () => {
        var editor = vscode.window.activeTextEditor;
        if (editor !== undefined) {
            clearDecorations(editor);
        }
    });
    let enable_disable_live_command = vscode.commands.registerCommand('extension.toggleLive', () => {
        live_update = !live_update;
        var editor = vscode.window.activeTextEditor;
        if (live_update) {
            vscode.window.showInformationMessage("Code quality: Live update enabled");
            if (editor !== undefined) {
                if (editor.document !== undefined) {
                    updateDecorations(editor.document);
                }
            }
        }
        else {
            vscode.window.showInformationMessage("Code quality: Live update disabled");
            if (editor !== undefined) {
                clearDecorations(editor);
            }
        }
    });
    context.subscriptions.push(trigger_clear_command);
    context.subscriptions.push(trigger_update_command);
    context.subscriptions.push(enable_disable_live_command);
    context.subscriptions.push(set_language_command);
}
exports.activate = activate;
function is_indeni_script(document) {
    if (document === undefined) {
        return false;
    }
    return document.fileName.toLowerCase().endsWith(".ind");
}
function text_document_changed(change) {
    if (live_update) {
        updateDecorations(change.document);
    }
}
function text_editor_changed(editor) {
    if (editor !== undefined) {
        if (live_update) {
            updateDecorations(editor.document);
        }
    }
}
function setLanguage(document) {
    if (!document) {
        return;
    }
    if (!is_indeni_script(document)) {
        return;
    }
    if (document.uri.fsPath.toLowerCase().endsWith(".ind")) {
        const text = document.getText();
        let sections = sections_1.get_sections(text);
        if (sections.awk !== null) {
            if (document.languageId !== "awk") {
                vscode.languages.setTextDocumentLanguage(document, "awk");
            }
        }
        else if (sections.xml !== null || sections.json !== null) {
            if (document.languageId !== "yaml") {
                vscode.languages.setTextDocumentLanguage(document, "yaml");
            }
        }
    }
}
function clearDecorations(editor) {
    if (!editor) {
        return;
    }
    editor.setDecorations(warningDecorationType, []);
    editor.setDecorations(errorDecorationType, []);
    editor.setDecorations(infoDecorationType, []);
}
function updateDecorations(document) {
    if (!document) {
        return;
    }
    if (!is_indeni_script(document)) {
        return;
    }
    let editor = vscode.window.activeTextEditor;
    if (editor === null || editor === undefined) {
        return;
    }
    const text = document.getText();
    let sections = sections_1.get_sections(text);
    let quality_functions = code_validation_1.get_functions();
    const warnings = [];
    const errors = [];
    const information = [];
    for (let sect of sections.all) {
        let marks = sect.get_marks(quality_functions, sections);
        if (marks.length > 0) {
            for (let mark of marks) {
                switch (mark.severity) {
                    case CodeValidation_1.FunctionSeverity.warning:
                        warnings.push(create_decoration(editor, mark));
                        break;
                    case CodeValidation_1.FunctionSeverity.error:
                        errors.push(create_decoration(editor, mark));
                        break;
                    case CodeValidation_1.FunctionSeverity.information:
                        information.push(create_decoration(editor, mark));
                        break;
                }
            }
        }
    }
    editor.setDecorations(warningDecorationType, warnings);
    editor.setDecorations(errorDecorationType, errors);
    editor.setDecorations(infoDecorationType, information);
}
function create_decoration(editor, marker) {
    const start_pos = editor.document.positionAt(marker.start_pos);
    const end_pos = editor.document.positionAt(marker.end_pos);
    return { range: new vscode.Range(start_pos, end_pos), hoverMessage: marker.tooltip };
}
// this method is called when your extension is deactivated
function deactivate() {
    errorDecorationType.dispose();
    warningDecorationType.dispose();
    infoDecorationType.dispose();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map