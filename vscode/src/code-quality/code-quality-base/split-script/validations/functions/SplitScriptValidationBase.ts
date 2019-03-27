import { MarkerResult } from "../../../MarkerResult";
import { SplitScript } from "../../SplitScript";
import { FunctionSeverity } from "../../../CodeValidation";

export abstract class SplitScriptValidationBase
{
    public title : string;
    public severity : FunctionSeverity;
    constructor(title : string, severity : FunctionSeverity) {
        this.title = title;
        this.severity = severity;
    }

    public abstract markers : MarkerResult[];
    abstract get_markers(script : SplitScript) : MarkerResult[];
}