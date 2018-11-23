import * as vscode from 'vscode';
import { CodeValidations } from '../code-quality/code-validation';
import { CodeValidation } from '../code-quality/code-quality-base/CodeValidation';

export class CodeQualityView {
    private _warnings : number = 0;
    private _errors : number = 0;
    private _information : number = 0;
    
    panel : vscode.WebviewPanel | undefined = undefined;
    
    get warnings() : number {
        return this._warnings;
    }

    set warnings(value : number) {
        this._warnings = value;
    }

    get errors() : number {
        return this._errors;
    }

    set errors(value : number) {
        this._errors = value;
    }

    get information() : number {
        return this._information;
    }

    set information(value : number) {
        this._information = value;
    }

    public showWebView(validations : CodeValidations, manual : boolean) {
        if (this.panel === undefined && manual) {
            this.panel = vscode.window.createWebviewPanel("codeQualityView", "Indeni code quality result", vscode.ViewColumn.Beside);
            this.panel.onDidDispose((e : void) => { this.panel = undefined; });
        }

        if (this.panel !== undefined)
        {
            this.panel.webview.html = this.getHtml(validations);
        }
    }

    getHtml(validations : CodeValidations) : string {
        let result : string = "<html><body><div class=\"used\">Used</div>";
        result += this.getStyle();
        let header_drawn : boolean = false;
        for (let validation of validations.functions.sort(this.sort_validation)) {
            if (validation.applied_markers.length === 0 && !header_drawn) {
                result += `<div class="unused">Unused</div>`;
                header_drawn = true;
            }
            result += `<div class="${validation.severity} tooltip"><nobr>${validation.name}<span class="validation_result">(${validation.applied_markers.length})</span></nobr></span><span class="tooltiptext">${validation.reason}</div>`;
        }

        return result + "</body></html>";
    }
    sort_validation(a : CodeValidation, b : CodeValidation) : number {
        let result = a.applied_markers.length > b.applied_markers.length? -1: a.applied_markers.length < b.applied_markers.length? 1: 0; 
        if (result === 0) {
            result = a.severity > b.severity? 1: a.severity === b.severity? 0: -1;
        }

        return result;
    }
    getStyle() : string {
        return `<style>
        .error, .warning, .information { 
            display: inline-block;
            border: solid 1px black;
            color: black;
            margin: 3px;
            font-weight: bold;
            border-radius: 5px;
            padding: 4px; 
        }
        .error { background-color: red; }
        .warning { background-color: yellow; }
        .information { background-color: green; }
        .used, .unused {
            margin: 4px;
            padding: 6px;
            margin: 2px;
            font-size: larger;
            font-weight: bold;
            color: white;
            border: solid 2px white;
            border-radius: 3px;
        }

        .used { background-color: darkred; }
        .unused { background-color: darkgreen; }
        .tooltip {
            position: relative; 
            display: inline-block; 
            border-bottom: 1px dotted black;
        }

        .tooltip .tooltiptext { 
            visibility: hidden;
            width: 250px;
            background-color: black; 
            color: #fff; 
            text-align: center; 
            padding: 5px 0;
            border-radius: 6px; 
            position: absolute; 
            z-index: 1;
        }

        .tooltip:hover .tooltiptext {
            visibility: visible 
        }
        </style>`;
    }
}