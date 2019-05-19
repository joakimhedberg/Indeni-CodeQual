import { SplitScriptValidationBase } from "./SplitScriptValidationBase";
import { MarkerResult } from "../../../MarkerResult";
import { SplitScript } from "../../SplitScript";
import { FunctionSeverity } from "../../../CodeValidation";

export class YamlFourSpacesIndentaionValidation extends SplitScriptValidationBase {
    public constructor() {
        super('Invalid YAML white-space', FunctionSeverity.error);
    }

    get_markers(script: SplitScript): MarkerResult[] {
        this.markers = [];

        if (!script) {
            return this.markers;
        }

        if (!script.current_section || !script.header_section) {
            return this.markers;
        }

        if (script.current_section.content_type !== "yaml") {
            return this.markers;
        }

        let result : MarkerResult[] = [];
        let content = script.current_section.content;
        if (content === undefined) {
            return result;
        }

        let position = 0;
        let lines = content.split(/\r|\r\n/gm);
        for (let line of lines) {
            let count = this.count_spaces(line);
            if (count % 4 !== 0) {
                result.push(new MarkerResult(position, position + count, 'Since indentation in YAML is 4 spaces having a number not divisible by 4 would cause an error in most cases.', FunctionSeverity.error, true, this.space_string(count)));
            }
            position += line.length + 1;
        }

        return result;
    }

    space_string(count : number) : string {
        let result : string = '';
        for (let i = 0; i < count; i++) {
            result += ' ';
        }

        return result;
    }

    count_spaces(line : string) : number {
        let result = 0;
        
        for (let chr of line) {
            if (chr === ' ') {
                result++;
            }
            else {
                return result;
            }
        }
        return result;
    }
}