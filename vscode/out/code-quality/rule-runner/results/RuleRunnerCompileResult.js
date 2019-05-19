"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CommandRunnerResultBase_1 = require("../../../command-runner/results/CommandRunnerResultBase");
class RuleRunnerCompileResult extends CommandRunnerResultBase_1.CommandRunnerResultBase {
    constructor(data) {
        super(data);
        this.items = [];
        this.parse_items();
    }
    parse_items() {
    }
}
exports.RuleRunnerCompileResult = RuleRunnerCompileResult;
//# sourceMappingURL=RuleRunnerCompileResult.js.map