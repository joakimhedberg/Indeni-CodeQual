"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ResultMetric_1 = require("./ResultMetric");
class CommandRunnerParseOnlyResult {
    constructor(input_file, script_file, raw_data) {
        this.input_file = undefined;
        this.script_file = undefined;
        this.metrics = [];
        this.raw_data = undefined;
        this.script_name = undefined;
        console.log(raw_data);
        this.input_file = input_file;
        this.script_file = script_file;
        this.raw_data = raw_data.replace(/\x1b\[[0-9;]*m/g, '');
        this.parse_info();
        this.parse_metrics();
    }
    parse_metrics() {
        if (this.raw_data === undefined) {
            return;
        }
        this.metrics = ResultMetric_1.ResultMetric.parse_from_text(this.raw_data);
    }
    parse_info() {
        if (this.raw_data === undefined) {
            return;
        }
        let match_running = /Running '([^']+)/g;
        let running = match_running.exec(this.raw_data);
        if (running !== null) {
            if (running.length > 0) {
                this.script_name = running[1];
            }
        }
    }
}
exports.CommandRunnerParseOnlyResult = CommandRunnerParseOnlyResult;
//# sourceMappingURL=CommandRunnerParseOnlyResult.js.map