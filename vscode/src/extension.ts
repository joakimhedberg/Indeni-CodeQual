'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { get_sections } from "./code-quality/sections";
import { CodeValidations } from './code-quality/code-validation';
import { MarkerCollection } from './code-quality/code-quality-base/MarkerResult';
import * as path from 'path';
import { CodeQualityView } from './gui/CodeQualityView';
import { SplitScript } from './code-quality/code-quality-base/split-script/SplitScript';
import { SplitScriptValidationCollection } from './code-quality/code-quality-base/split-script/validations/SplitScriptValidationCollection';
import { FunctionSeverity } from './code-quality/code-quality-base/CodeValidation';

let error_collection : MarkerCollection;
let warning_collection : MarkerCollection;
let information_collection : MarkerCollection;
let debug_collection : MarkerCollection;

let live_update : boolean = true;
let quality_view : CodeQualityView;
const quality_functions : CodeValidations = new CodeValidations();

let split_validations : SplitScriptValidationCollection = new SplitScriptValidationCollection();

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    quality_view = new CodeQualityView(path.join(context.extensionPath, 'resources'));
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

    error_collection = new MarkerCollection(error_decoration_type);
    
    let warning_decoration_type = vscode.window.createTextEditorDecorationType({
        fontWeight: 'bold',
        borderWidth: '0px 0px 2px 0px',
        borderStyle: 'dashed',
        overviewRulerColor: { id: 'extension.warningBorderColor' },
        overviewRulerLane: vscode.OverviewRulerLane.Right,
        light: {
            borderColor: { id: 'extension.warningBorderColor'}
        },
        dark: {
            borderColor: { id: 'extension.warningBorderColor'}
        }
    });

    warning_collection = new MarkerCollection(warning_decoration_type);

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

    information_collection = new MarkerCollection(info_decoration_type);

    let debug_decoration_type = vscode.window.createTextEditorDecorationType({
        borderWidth: '2px',
        borderStyle: 'dashed',
        borderColor: 'pink'
    });

    debug_collection = new MarkerCollection(debug_decoration_type);

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
            if (editor !== undefined)
            {
                if (editor.document !== undefined) {
                    updateDecorations(editor.document);
                }
            }
        }
        else {
            vscode.window.showInformationMessage("Code quality: Live update disabled");
            if (editor !== undefined)
            {
                clearDecorations(editor);
            }
        }
    });

    context.subscriptions.push(trigger_clear_command);
    context.subscriptions.push(trigger_update_command);
    context.subscriptions.push(enable_disable_live_command);
    context.subscriptions.push(set_language_command);
}

function text_document_changed(change : vscode.TextDocumentChangeEvent) {
    if (live_update) {
        updateDecorations(change.document);
    }
}

function text_editor_changed(editor : vscode.TextEditor | undefined) {
    if (editor !== undefined)
    {
        if (live_update) {
            updateDecorations(editor.document);
        }
    }
}

function setLanguage(document : vscode.TextDocument | undefined) {
    if (!document) {
        return;
    }

    const text = document.getText();
    let sections = get_sections(text);
    if (sections.is_valid())
    {
        if (sections.awk !== null) {
            if (document.languageId !== "awk")
            {
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

function is_indeni_script(document : vscode.TextDocument | undefined) : IndeniScriptType {
    if (document === undefined) {
        return IndeniScriptType.none;
    }

    let tmp = new SplitScript();
    if (tmp.load(document.fileName, document.getText())) {
        return IndeniScriptType.split;
    }
    
    if (document.fileName.toLowerCase().endsWith(".ind")) {
        return IndeniScriptType.normal;
    }

    return IndeniScriptType.none;
}

function clearDecorations(editor : vscode.TextEditor | undefined) {
    if (!editor)
    {
        return;
    }
    warning_collection.detach(editor);
    error_collection.detach(editor);
    information_collection.detach(editor);
    debug_collection.detach(editor);
}

function updateDecorations(document : vscode.TextDocument | undefined, manual : boolean = false) {
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
        let sections = get_sections(text);

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
    } else if (is_script === IndeniScriptType.split) {
        let split_script = new SplitScript();
        if (!split_script.load(document.fileName, document.getText())) {
            return;
        }

        let markers = split_validations.apply(split_script);
        for (let marker of markers) {
            switch (marker.severity) {
                case FunctionSeverity.error:
                    error_collection.append(marker);
                    break;
                case FunctionSeverity.warning:
                    warning_collection.append(marker);
                    break;
                case FunctionSeverity.information:
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
export function deactivate() {
    warning_collection.dispose();
    error_collection.dispose();
    information_collection.dispose();
    debug_collection.dispose();
}

enum IndeniScriptType {
    normal,
    split,
    none
}