'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { get_sections } from "./code-quality/sections";
import { CodeValidations } from './code-quality/code-validation';
import { FunctionSeverity } from './code-quality/code-quality-base/CodeValidation';
import { MarkerResult, MarkerCollection } from './code-quality/code-quality-base/MarkerResult';
import { CodeQualityView } from './gui/CodeQualityView';
import * as path from 'path';

let errorCollection : MarkerCollection;
let warningCollection : MarkerCollection;
let informationCollection : MarkerCollection;
let debugCollection : MarkerCollection;

let live_update : boolean = true;
let qualityView : CodeQualityView;
const quality_functions : CodeValidations = new CodeValidations();

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    qualityView = new CodeQualityView(path.join(context.extensionPath, 'resources'));
    let errorDecorationType = vscode.window.createTextEditorDecorationType({
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

    errorCollection = new MarkerCollection(errorDecorationType);
    
    let warningDecorationType = vscode.window.createTextEditorDecorationType({
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

    warningCollection = new MarkerCollection(warningDecorationType);

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

    informationCollection = new MarkerCollection(infoDecorationType);

    let debugDecorationType = vscode.window.createTextEditorDecorationType({
        borderWidth: '2px',
        borderStyle: 'dashed',
        borderColor: 'pink'
    });

    debugCollection = new MarkerCollection(debugDecorationType);

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

function is_indeni_script(document : vscode.TextDocument | undefined) {
    if (document === undefined) {
        return false;
    }

    return document.fileName.toLowerCase().endsWith(".ind");
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

    if (!is_indeni_script(document)) {
        return;
    }

    if (document.uri.fsPath.toLowerCase().endsWith(".ind"))
    {
        const text = document.getText();
        let sections = get_sections(text);

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

function clearDecorations(editor : vscode.TextEditor | undefined) {
    if (!editor)
    {
        return;
    }
    warningCollection.detach(editor);
    errorCollection.detach(editor);
    informationCollection.detach(editor);
    debugCollection.detach(editor);
}

function updateDecorations(document : vscode.TextDocument | undefined, manual : boolean = false) {
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
    let sections = get_sections(text);

    let all_marks : MarkerResult[] = [];
    
    quality_functions.reset();
    for (let sect of sections.all) {
        let marks = sect.get_marks(quality_functions, sections);
        for (let mark of marks) {
            switch (mark.severity) {
                case FunctionSeverity.warning:
                    warningCollection.append(mark);    
                break;
                case FunctionSeverity.error:
                    errorCollection.append(mark);
                break;
                case FunctionSeverity.information:
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
export function deactivate() {
    warningCollection.dispose();
    errorCollection.dispose();
    informationCollection.dispose();
    debugCollection.dispose();
}