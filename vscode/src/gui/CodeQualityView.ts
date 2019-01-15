import * as vscode from 'vscode';
import { CodeValidations } from '../code-quality/code-validation';
import { CodeValidation } from '../code-quality/code-quality-base/CodeValidation';
import * as path from 'path';

// View for the code validations. Uses VS Code WebView which might not be optimal. Still gives a pretty nice result though.
export class CodeQualityView {
    private panel : vscode.WebviewPanel | undefined = undefined;
    private resource_path : string;
    private script_uri : vscode.Uri;
    private style_uri : vscode.Uri;
    constructor(resource_path : string) {
        this.resource_path = resource_path;
        this.script_uri = vscode.Uri.file(path.join(this.resource_path, 'webview.js'));
        this.style_uri = vscode.Uri.file(path.join(this.resource_path, 'webview.css'));
    }

    public show_web_view(validations : CodeValidations, manual : boolean, editor : vscode.TextEditor) {
        if (this.panel === undefined && manual) {
            this.panel = vscode.window.createWebviewPanel("codeQualityView", "Indeni code quality result", vscode.ViewColumn.Beside, { enableScripts: true } );
            this.panel.onDidDispose((e : void) => { this.panel = undefined; });
            this.panel.webview.onDidReceiveMessage(message => {
                switch (message.command) {
                    case 'scroll':
                        if (message.start && message.end) {
                            if (editor !== undefined) {
                                let doc = editor.document;
                                let pos1 = doc.positionAt(message.start);
                                let pos2 = doc.positionAt(message.end);
                                let rng = new vscode.Range(pos1, pos2);
                                if (editor.document.validateRange(rng)) {
                                    editor.revealRange(rng);
                                    editor.selection = new vscode.Selection(pos1, pos2);
                                }
                            }
                        
                        }
                    break;
                }
            }, undefined);
        }

        if (this.panel !== undefined)
        {
            this.panel.webview.html = this.get_html(validations);
            if (!this.panel.visible)
            {
                this.panel.reveal(vscode.ViewColumn.Beside);
            }
        }
    }

    get_html(validations : CodeValidations) : string {
        let result : string = "<html><head>";
        let summary_data : { [id : number] : string } = {};
        result += "</head>";
        result += `<body>`;
        result += this.get_script();
        result += this.get_style();
        result += `<div class="used" id="validation">Non-compliant</div>`;
        let index : number = 0;
        let header_drawn : boolean = false;
        for (let validation of validations.functions.sort(this.sort_validation)) {
            if (validation.applied_markers.length === 0 && !header_drawn) {
                result += `<div class="unused">Compliant</div>`;
                header_drawn = true;
            }
            let div_class = header_drawn? "compliant": validation.severity;
            result += `<div class="${div_class} tooltip" onclick="show_summary('${index}');">${validation.name}<span class="validation_result">(${validation.applied_markers.length})</span></span><span class="tooltiptext">${validation.reason}</div>`;
            let summary = validation.get_summary();
            if (summary.length > 0) {
                summary_data[index] = validation.get_summary();
            }
            index++;
        }
        
        result += `<div id="summary_parent">`;
        for (let data in summary_data) {
            result += `<div id="summary_${data}" class="summary">Summary<br/><pre>${summary_data[data]}</pre></div>`;
        }
        result += "</div>";

        return result + "</body></html>";
    }

    sort_validation(a : CodeValidation, b : CodeValidation) : number {
        let result = a.applied_markers.length > b.applied_markers.length? -1: a.applied_markers.length < b.applied_markers.length? 1: 0; 
        if (result === 0) {
            result = a.severity > b.severity? 1: a.severity === b.severity? 0: -1;
        }

        return result;
    }

    get_script() : string {
        return `<script src="${this.script_uri.with({ scheme: 'vscode-resource' })}"></script>`;
    }

    get_style() : string {
        return `<link rel="stylesheet" href="${this.style_uri.with({ scheme: 'vscode-resource' })}"/>`;
    }
}