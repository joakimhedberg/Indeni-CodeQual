'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { get_sections } from "./code-quality/sections";
import { CodeValidations } from './code-quality/code-validation';
import { MarkerCollection } from './code-quality/code-quality-base/MarkerResult';
import * as path from 'path';
import { CodeQualityView } from './gui/CodeQualityView';

let error_collection : MarkerCollection;
let warning_collection : MarkerCollection;
let information_collection : MarkerCollection;
let debug_collection : MarkerCollection;

let live_update : boolean = true;
let quality_view : CodeQualityView;
const quality_functions : CodeValidations = new CodeValidations();

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    quality_view = new CodeQualityView(path.join(context.extensionPath, 'resources'));
    let error_decoration_type = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
        fontWeight: 'bold',
        borderWidth: '1px',
        borderStyle: 'solid',
        overviewRulerColor: 'red',
        overviewRulerLane: vscode.OverviewRulerLane.Right,
        light: {
            borderColor: { id: 'extension.errorBorderColor'},
        },
        dark: {
            borderColor: { id: 'extension.errorBorderColor'}
        }
    });

    error_collection = new MarkerCollection(error_decoration_type);
    
    let warning_decoration_type = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(255, 255, 0, 0.2)',
        fontWeight: 'bold',
        borderWidth: '1px',
        borderStyle: 'solid',
        overviewRulerColor: 'yellow',
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

function is_indeni_script(document : vscode.TextDocument | undefined) {
    if (document === undefined) {
        return false;
    }

    return document.fileName.toLowerCase().endsWith(".ind");
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
    if (!is_indeni_script(document) || document === undefined)
    {
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

    warning_collection.apply(editor);
    error_collection.apply(editor);
    information_collection.apply(editor);
    debug_collection.apply(editor);
    quality_view.show_web_view(quality_functions, manual, editor);
}

// this method is called when the extension is deactivated
export function deactivate() {
    warning_collection.dispose();
    error_collection.dispose();
    information_collection.dispose();
    debug_collection.dispose();
}