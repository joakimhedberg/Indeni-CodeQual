"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
/*
    Result markers for the checks, check markers really...
*/
class MarkerResult {
    constructor(start_pos, end_pos, tooltip, severity, offset_handled, offending_text) {
        this.code_validation = undefined; // Parent validation of the check
        this.start_pos = start_pos;
        this.end_pos = end_pos;
        this.tooltip = tooltip;
        this.offset_handled = offset_handled;
        this.severity = severity;
        this.offending_text = offending_text;
    }
}
exports.MarkerResult = MarkerResult;
class MarkerCollection extends vscode.Disposable {
    constructor(decoration) {
        super(() => { this.dispose(); });
        this.markers = new Map();
        this.decoration = decoration;
    }
    clear() {
        this.markers.clear();
    }
    append(marker) {
        let existing = this.markers.get(marker.start_pos);
        if (existing !== undefined) {
            for (let exists of existing) {
                if (exists.end_pos === marker.end_pos) {
                    return false;
                }
            }
            existing.push(marker);
        }
        else {
            this.markers.set(marker.start_pos, [marker]);
        }
    }
    apply(editor) {
        let decorations = [];
        for (let marker_collection of this.markers) {
            for (let marker of marker_collection[1]) {
                let start_pos = editor.document.positionAt(marker.start_pos);
                let end_pos = editor.document.positionAt(marker.end_pos);
                decorations.push({ range: new vscode.Range(start_pos, end_pos), hoverMessage: marker.tooltip });
            }
        }
        editor.setDecorations(this.decoration, decorations);
    }
    detach(editor) {
        editor.setDecorations(this.decoration, []);
    }
    dispose() {
        this.decoration.dispose();
        this.markers.clear();
    }
}
exports.MarkerCollection = MarkerCollection;
//# sourceMappingURL=MarkerResult.js.map