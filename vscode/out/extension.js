'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const sections_1 = require("./code-quality/sections");
const code_validation_1 = require("./code-quality/code-validation");
const MarkerResult_1 = require("./code-quality/code-quality-base/MarkerResult");
const path = require("path");
const CodeQualityView_1 = require("./gui/CodeQualityView");
let error_collection;
let warning_collection;
let information_collection;
let debug_collection;
let live_update = true;
let quality_view;
const quality_functions = new code_validation_1.CodeValidations();
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    quality_view = new CodeQualityView_1.CodeQualityView(path.join(context.extensionPath, 'resources'));
    let error_decoration_type = vscode.window.createTextEditorDecorationType({
        fontWeight: 'bold',
        borderWidth: '0px 0px 2px 0px',
        borderStyle: 'dashed',
        overviewRulerColor: { id: 'extension.errorBorderColor' },
        overviewRulerLane: vscode.OverviewRulerLane.Right,
        light: {
            borderColor: { id: 'extension.errorBorderColor' }
        },
        dark: {
            borderColor: { id: 'extension.errorBorderColor' }
        }
    });
    error_collection = new MarkerResult_1.MarkerCollection(error_decoration_type);
    let warning_decoration_type = vscode.window.createTextEditorDecorationType({
        fontWeight: 'bold',
        borderWidth: '0px 0px 2px 0px',
        borderStyle: 'dashed',
        overviewRulerColor: { id: 'extension.warningBorderColor' },
        overviewRulerLane: vscode.OverviewRulerLane.Right,
        light: {
            borderColor: { id: 'extension.warningBorderColor' }
        },
        dark: {
            borderColor: { id: 'extension.warningBorderColor' }
        }
    });
    warning_collection = new MarkerResult_1.MarkerCollection(warning_decoration_type);
    let info_decoration_type = vscode.window.createTextEditorDecorationType({
        fontWeight: 'bold',
        borderWidth: '0px 0px 2px 0px',
        borderStyle: 'dashed',
        overviewRulerColor: { id: 'extension.informationBorderColor' },
        overviewRulerLane: vscode.OverviewRulerLane.Right,
        light: {
            borderColor: { id: 'extension.informationBorderColor' },
        },
        dark: {
            borderColor: { id: 'extension.informationBorderColor' },
        }
    });
    information_collection = new MarkerResult_1.MarkerCollection(info_decoration_type);
    let debug_decoration_type = vscode.window.createTextEditorDecorationType({
        borderWidth: '2px',
        borderStyle: 'dashed',
        borderColor: 'pink'
    });
    debug_collection = new MarkerResult_1.MarkerCollection(debug_decoration_type);
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
    const text = document.getText();
    let sections = sections_1.get_sections(text);
    if (sections.is_valid()) {
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
function is_indeni_script(document) {
    if (document === undefined) {
        return false;
    }
    return document.fileName.toLowerCase().endsWith(".ind");
}
function clearDecorations(editor) {
    if (!editor) {
        return;
    }
    warning_collection.detach(editor);
    error_collection.detach(editor);
    information_collection.detach(editor);
    debug_collection.detach(editor);
}
function updateDecorations(document, manual = false) {
    if (!is_indeni_script(document) || document === undefined) {
        return;
    }
    let editor = vscode.window.activeTextEditor;
    if (editor === null || editor === undefined) {
        return;
    }
    warning_collection.clear();
    error_collection.clear();
    debug_collection.clear();
    information_collection.clear();
    const text = document.getText();
    let sections = sections_1.get_sections(text);
    if (!sections.is_valid()) {
        return;
    }
    quality_functions.apply(sections);
    for (let warning of quality_functions.warning_markers) {
        warning_collection.append(warning);
    }
    for (let error of quality_functions.error_markers) {
        error_collection.append(error);
    }
    for (let info of quality_functions.information_markers) {
        information_collection.append(info);
    }
    warning_collection.apply(editor);
    error_collection.apply(editor);
    information_collection.apply(editor);
    debug_collection.apply(editor);
    quality_view.show_web_view(quality_functions, manual, editor);
}
// this method is called when the extension is deactivated
function deactivate() {
    warning_collection.dispose();
    error_collection.dispose();
    information_collection.dispose();
    debug_collection.dispose();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map