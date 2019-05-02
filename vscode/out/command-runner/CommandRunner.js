"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const child = require("child_process");
const CommandRunnerParseOnlyResult_1 = require("./results/CommandRunnerParseOnlyResult");
const CommandRunnerTestRunResult_1 = require("./results/CommandRunnerTestRunResult");
class CommandRunner {
    constructor() {
        this.errors = [];
        this.commandrunner_path = undefined;
        this.commandrunner_path = vscode.workspace.getConfiguration().get('indeni.commandRunnerPath');
    }
    RunParseOnly(filename, callback) {
        vscode.window.showOpenDialog({ 'canSelectFolders': false, 'canSelectFiles': true }).then((value) => {
            if (value !== undefined && value.length > 0) {
                let result = [];
                child.exec(this.commandrunner_path + " parse-only " + filename + " -f " + value[0].fsPath, (error, stdout, stderr) => {
                    result.push(stdout);
                    if (stdout.indexOf('Exiting') !== undefined) {
                        callback(new CommandRunnerParseOnlyResult_1.CommandRunnerParseOnlyResult(value[0].fsPath, filename, result.join('\n')));
                    }
                });
            }
        });
    }
    RunTests(filename, callback) {
        let result = [];
        child.exec(this.commandrunner_path + " test run " + filename, (error, stdout, stderr) => {
            result.push(stdout);
            if (stderr.length > 0) {
                return;
            }
            if (stdout.indexOf('Exiting') !== undefined) {
                callback(new CommandRunnerTestRunResult_1.CommandRunnerTestRunResult(result.join('\n')));
            }
        });
    }
}
exports.CommandRunner = CommandRunner;
//# sourceMappingURL=CommandRunner.js.map