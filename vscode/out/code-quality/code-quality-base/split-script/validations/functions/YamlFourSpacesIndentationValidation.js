"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SplitScriptValidationBase_1 = require("./SplitScriptValidationBase");
const MarkerResult_1 = require("../../../MarkerResult");
const CodeValidation_1 = require("../../../CodeValidation");
class YamlFourSpacesIndentaionValidation extends SplitScriptValidationBase_1.SplitScriptValidationBase {
    constructor() {
        super('Invalid YAML white-space', CodeValidation_1.FunctionSeverity.error);
    }
    get_markers(script) {
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
        let result = [];
        let content = script.current_section.content;
        if (content === undefined) {
            return result;
        }
        let position = 0;
        let lines = content.split(/\r|\r\n/gm);
        for (let line of lines) {
            let count = this.count_spaces(line);
            if (count % 4 !== 0) {
                result.push(new MarkerResult_1.MarkerResult(position, position + count, 'Since indentation in YAML is 4 spaces having a number not divisible by 4 would cause an error in most cases.', CodeValidation_1.FunctionSeverity.error, true, this.space_string(count)));
            }
            position += line.length + 1;
        }
        return result;
    }
    space_string(count) {
        let result = '';
        for (let i = 0; i < count; i++) {
            result += ' ';
        }
        return result;
    }
    count_spaces(line) {
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
exports.YamlFourSpacesIndentaionValidation = YamlFourSpacesIndentaionValidation;
//# sourceMappingURL=YamlFourSpacesIndentationValidation.js.map