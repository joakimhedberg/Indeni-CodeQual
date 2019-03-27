import { SplitScriptValidationBase } from "./SplitScriptValidationBase";
import { MarkerResult } from "../../../MarkerResult";
import { SplitScript } from "../../SplitScript";
import { FunctionSeverity } from "../../../CodeValidation";
import { SplitScriptAwkSection } from "../../sections/SplitScriptAwkSection";

export class UndocumentedMetricsValidation extends SplitScriptValidationBase {
    public markers: MarkerResult[] = [];
    
    constructor() {
        super("Metric used has not been documented", FunctionSeverity.error);
    }

    get_markers(script: SplitScript): MarkerResult[] {
        this.markers = [];

        if (!script) {
            return this.markers;
        }

        if (!script.current_section || !script.header_section) {
            return this.markers;
        }

        if (script.current_section.content_type !== "awk") {
            return this.markers;
        }

        if (script.current_section instanceof SplitScriptAwkSection) {
            let awk_section = script.current_section as SplitScriptAwkSection;
            let used_metrics = awk_section.get_metrics();
            let documented_metrics = script.header_section.get_documented_metrics();

            for (let used of used_metrics) {
                let found = false;
                for (let documented of documented_metrics) {
                    if (documented[1] === used[1]) {
                        found = true;
                    }
                }

                if (!found) {
                    this.markers.push(new MarkerResult(used[0], used[0] + used[1].length, "This metric has not been documented in the comments section", this.severity, true, used[1]));
                }
            }
        }

        return this.markers;
    }
}