"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=MarkerResult.js.map