import { FunctionSeverity, CodeValidation } from "./CodeValidation";

/*
    Result markers for the checks, check markers really...
*/
export class MarkerResult {
    start_pos : number; // Start position of the error, in relation to the entire script
    end_pos : number; // End position of the error, in relation to the entire script
    start_line : number | undefined; // Start line of the error, used when reporting the issue in the GUI
    end_line : number | undefined; // End line of the error, used when reporting the issue in the GUI
    tooltip : string; // Tooltip text when hovering over the issue
    offset_handled : boolean; // Set this to true when the offset(in relation to the entire script) is handled.
    severity : FunctionSeverity; // Severity of the check
    code_validation : CodeValidation | undefined = undefined; // Parent validation of the check
    offending_text : string; // The text that has been grabbed while doing the check
    constructor(start_pos : number, end_pos : number, tooltip : string, severity : FunctionSeverity, offset_handled : boolean, offending_text : string) {
        this.start_pos = start_pos;
        this.end_pos = end_pos;
        this.tooltip = tooltip;
        this.offset_handled = offset_handled;
        this.severity = severity;
        this.offending_text = offending_text;
    }
}