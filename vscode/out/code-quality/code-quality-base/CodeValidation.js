"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MarkerResult_1 = require("./MarkerResult");
/*
    Base classes for the code validation functions

    CodeValidation:
        Bottom(or top?) of the hierarchy where mark needs to be specified manually

    CodeValidationRegex:
        Marks code based on a regexp
    
    CodeValidationByLine:
        Marks code line by line based on regexp. Can handle special cases and ignore lines.
*/
class CodeValidation {
    constructor(name, reason, severity, apply_to_sections) {
        this.applied_markers = [];
        this.offset_handled = false;
        this.name = name;
        this.reason = reason;
        this.severity = severity;
        this.apply_to_sections = apply_to_sections;
        this.mark = null;
    }
    has_triggered() {
        return this.applied_markers.length > 0;
    }
    reset() {
        this.applied_markers.length = 0;
    }
    do_mark(content, sections) {
        if (this.mark === null) {
            return [];
        }
        let result = this.mark(content, sections);
        for (let marker of result) {
            marker.code_validation = this;
            this.applied_markers.push(marker);
        }
        return result;
    }
}
exports.CodeValidation = CodeValidation;
class CodeValidationRegex extends CodeValidation {
    constructor(name, reason, severity, apply_to_sections, regex) {
        super(name, reason, severity, apply_to_sections);
        this.mark = (content, sections) => {
            let match;
            let result = [];
            while (match = regex.exec(content)) {
                if (match.length > 1) {
                    let idx = 0;
                    for (let i = 1; i < match.length; i++) {
                        if (match[i] === undefined) {
                            continue;
                        }
                        idx = match[0].indexOf(match[1], idx);
                        const start_pos = match.index + idx;
                        const end_pos = match.index + idx + match[i].length;
                        result.push(new MarkerResult_1.MarkerResult(start_pos, end_pos, this.reason, this.severity, this.offset_handled));
                    }
                }
            }
            return result;
        };
    }
}
exports.CodeValidationRegex = CodeValidationRegex;
class CodeValidationByLine extends CodeValidationRegex {
    constructor(name, reason, severity, apply_to_sections, line_regex, special_cases, value_exclusion = []) {
        super(name, reason, severity, apply_to_sections, line_regex);
        this.special_cases = special_cases;
        this.value_exclusion = value_exclusion;
        this.mark = (content, sections) => {
            let result = [];
            let lines = content.split("\n");
            let line_offset = 0;
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i];
                let special_result = this.special(line);
                if (special_result[0]) {
                    for (let res of special_result[1]) {
                        result.push(new MarkerResult_1.MarkerResult(res.start_pos + line_offset, res.end_pos + line_offset, this.reason, this.severity, this.offset_handled));
                    }
                }
                else {
                    let match;
                    while (match = line_regex.exec(line)) {
                        if (match.length > 1) {
                            if (!this.excluded(match[1])) {
                                result.push(new MarkerResult_1.MarkerResult(match.index + line_offset, match.index + match[1].length + line_offset, this.reason, this.severity, this.offset_handled));
                            }
                        }
                    }
                }
                line_offset += line.length + 1;
            }
            return result;
        };
    }
    excluded(line) {
        for (let exclusion of this.value_exclusion) {
            if (exclusion.test(line)) {
                return true;
            }
        }
        return false;
    }
    special(line) {
        for (let item of this.special_cases) {
            if (item.matches(line)) {
                return [true, item.exec(line)];
            }
        }
        return [false, []];
    }
}
exports.CodeValidationByLine = CodeValidationByLine;
var FunctionSeverity;
(function (FunctionSeverity) {
    FunctionSeverity["information"] = "information";
    FunctionSeverity["warning"] = "warning";
    FunctionSeverity["error"] = "error";
})(FunctionSeverity = exports.FunctionSeverity || (exports.FunctionSeverity = {}));
//# sourceMappingURL=CodeValidation.js.map