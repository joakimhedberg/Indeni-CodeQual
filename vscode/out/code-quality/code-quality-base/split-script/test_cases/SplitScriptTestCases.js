"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SplitScriptTestCase_1 = require("./SplitScriptTestCase");
const fs = require("fs");
const path = require("path");
class SplitScriptTestCases {
    static get(test_file_json) {
        let result = [];
        let json_text = fs.readFileSync(test_file_json, { encoding: 'UTF-8' });
        let obj = JSON.parse(json_text);
        for (let key in obj['nameToCase']) {
            let test_case = new SplitScriptTestCase_1.SplitScriptTestCase();
            test_case.name = key;
            test_case.input_path = path.join(path.dirname(test_file_json), obj['nameToCase'][key]['inputPath']);
            test_case.output_path = path.join(path.dirname(test_file_json), obj['nameToCase'][key]['outputPath']);
            test_case.input_data_path = this.get_data_path(test_case.input_path);
            result.push(test_case);
        }
        return result;
    }
    static get_data_path(input_json_file) {
        let json_text = fs.readFileSync(input_json_file, { encoding: 'UTF-8' });
        let value_match = /\"path\"\s?:\s?\"([^\"]+)/g;
        let match = value_match.exec(json_text);
        if (match !== null) {
            return path.join(path.dirname(input_json_file), match[1]);
        }
        return "";
    }
}
exports.SplitScriptTestCases = SplitScriptTestCases;
//# sourceMappingURL=SplitScriptTestCases.js.map