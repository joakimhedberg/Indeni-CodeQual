'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const sections_1 = require("./code-quality/sections");
const code_validation_1 = require("./code-quality/code-validation");
const CodeValidation_1 = require("./code-quality/code-quality-base/CodeValidation");
const MarkerResult_1 = require("./code-quality/code-quality-base/MarkerResult");
const CodeQualityView_1 = require("./gui/CodeQualityView");
const path = require("path");
let errorCollection;
let warningCollection;
let informationCollection;
let debugCollection;
let live_update = true;
let qualityView;
const quality_functions = new code_validation_1.CodeValidations();
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    qualityView = new CodeQualityView_1.CodeQualityView(path.join(context.extensionPath, 'resources'));
    let errorDecorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
        fontWeight: 'bold',
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
    errorCollection = new MarkerResult_1.MarkerCollection(errorDecorationType);
    let warningDecorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(255, 255, 0, 0.2)',
        fontWeight: 'bold',
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
    warningCollection = new MarkerResult_1.MarkerCollection(warningDecorationType);
    let infoDecorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(0, 0, 255, 0.2)',
        fontWeight: 'bold',
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
    informationCollection = new MarkerResult_1.MarkerCollection(infoDecorationType);
    let debugDecorationType = vscode.window.createTextEditorDecorationType({
        borderWidth: '2px',
        borderStyle: 'dashed',
        borderColor: 'pink'
    });
    debugCollection = new MarkerResult_1.MarkerCollection(debugDecorationType);
    vscode.window.onDidChangeActiveTextEditor(text_editor_changed);
    vscode.workspace.onDidChangeTextDocument(text_document_changed);
    let trigger_update_command = vscode.commands.registerCommand('extension.triggerUpdate', () => {
        var editor = vscode.window.activeTextEditor;
        if (editor !== null && editor !== undefined) {
            updateDecorations(editor.document, true);
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
    warningCollection.detach(editor);
    errorCollection.detach(editor);
    informationCollection.detach(editor);
    debugCollection.detach(editor);
}
function updateDecorations(document, manual = false) {
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
    warningCollection.clear();
    errorCollection.clear();
    debugCollection.clear();
    informationCollection.clear();
    const text = document.getText();
    let sections = sections_1.get_sections(text);
    let all_marks = [];
    quality_functions.reset();
    for (let sect of sections.all) {
        let marks = sect.get_marks(quality_functions, sections);
        for (let mark of marks) {
            switch (mark.severity) {
                case CodeValidation_1.FunctionSeverity.warning:
                    warningCollection.append(mark);
                    break;
                case CodeValidation_1.FunctionSeverity.error:
                    errorCollection.append(mark);
                    break;
                case CodeValidation_1.FunctionSeverity.information:
                    informationCollection.append(mark);
                    break;
            }
            all_marks.push(mark);
        }
    }
    warningCollection.apply(editor);
    errorCollection.apply(editor);
    informationCollection.apply(editor);
    debugCollection.apply(editor);
    qualityView.show_web_view(quality_functions, manual, editor);
}
// this method is called when your extension is deactivated
function deactivate() {
    warningCollection.dispose();
    errorCollection.dispose();
    informationCollection.dispose();
    debugCollection.dispose();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map