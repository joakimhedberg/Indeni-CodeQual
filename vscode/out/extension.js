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
const SplitScript_1 = require("./code-quality/code-quality-base/split-script/SplitScript");
const SplitScriptValidationCollection_1 = require("./code-quality/code-quality-base/split-script/validations/SplitScriptValidationCollection");
const CodeValidation_1 = require("./code-quality/code-quality-base/CodeValidation");
let error_collection;
let warning_collection;
let information_collection;
let debug_collection;
let live_update = true;
let quality_view;
const quality_functions = new code_validation_1.CodeValidations();
let split_validations = new SplitScriptValidationCollection_1.SplitScriptValidationCollection();
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
        return IndeniScriptType.none;
    }
    let tmp = new SplitScript_1.SplitScript();
    if (tmp.load(document.fileName, document.getText())) {
        return IndeniScriptType.split;
    }
    if (document.fileName.toLowerCase().endsWith(".ind")) {
        return IndeniScriptType.normal;
    }
    return IndeniScriptType.none;
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
    let editor = vscode.window.activeTextEditor;
    if (editor === null || editor === undefined) {
        return;
    }
    if (document === undefined) {
        return;
    }
    let is_script = is_indeni_script(document);
    if (is_script === IndeniScriptType.none) {
        return;
    }
    warning_collection.clear();
    error_collection.clear();
    debug_collection.clear();
    information_collection.clear();
    if (is_script === IndeniScriptType.normal) {
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
        quality_view.show_web_view(quality_functions, manual, editor);
    }
    else if (is_script === IndeniScriptType.split) {
        let split_script = new SplitScript_1.SplitScript();
        if (!split_script.load(document.fileName, document.getText())) {
            return;
        }
        let markers = split_validations.apply(split_script);
        for (let marker of markers) {
            switch (marker.severity) {
                case CodeValidation_1.FunctionSeverity.error:
                    error_collection.append(marker);
                    break;
                case CodeValidation_1.FunctionSeverity.warning:
                    warning_collection.append(marker);
                    break;
                case CodeValidation_1.FunctionSeverity.information:
                    information_collection.append(marker);
                    break;
            }
        }
        quality_view.show_web_view_split(split_validations, manual, editor);
    }
    warning_collection.apply(editor);
    error_collection.apply(editor);
    information_collection.apply(editor);
    debug_collection.apply(editor);
}
// this method is called when the extension is deactivated
function deactivate() {
    warning_collection.dispose();
    error_collection.dispose();
    information_collection.dispose();
    debug_collection.dispose();
}
exports.deactivate = deactivate;
var IndeniScriptType;
(function (IndeniScriptType) {
    IndeniScriptType[IndeniScriptType["normal"] = 0] = "normal";
    IndeniScriptType[IndeniScriptType["split"] = 1] = "split";
    IndeniScriptType[IndeniScriptType["none"] = 2] = "none";
})(IndeniScriptType || (IndeniScriptType = {}));
//# sourceMappingURL=extension.js.map