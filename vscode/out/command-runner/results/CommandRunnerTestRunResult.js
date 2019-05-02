"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CommandRunnerTestCase_1 = require("./CommandRunnerTestCase");
class CommandRunnerTestRunResult {
    constructor(raw_data) {
        this.script_name = undefined;
        this.raw_data = undefined;
        this.test_cases = [];
        this.raw_data = raw_data.replace(/\x1b\[[0-9;]*m/g, '');
        this.parse_test_results();
    }
    parse_test_results() {
        if (this.raw_data === undefined) {
            return;
        }
        let regex_names = /Running test case '([^']+)/g;
        let match;
        while (match = regex_names.exec(this.raw_data)) {
            let test_case = new CommandRunnerTestCase_1.CommandRunnerTestCase(match[1], this.raw_data);
            this.test_cases.push(test_case);
        }
    }
}
exports.CommandRunnerTestRunResult = CommandRunnerTestRunResult;
//# sourceMappingURL=CommandRunnerTestRunResult.js.map