import * as vscode from 'vscode';
import * as child from 'child_process'
import { CommandRunnerParseOnlyResult } from './results/CommandRunnerParseOnlyResult';
import { CommandRunnerTestRunResult } from './results/CommandRunnerTestRunResult';

export class CommandRunner {
    public errors : string[] = [];
    private commandrunner_path : string | undefined = undefined;
    public constructor() {
        this.commandrunner_path = vscode.workspace.getConfiguration().get('indeni.commandRunnerPath')
    }
    
    public RunParseOnly(filename : string, callback : ((result : CommandRunnerParseOnlyResult) => void)) {
        vscode.window.showOpenDialog( { 'canSelectFolders' : false, 'canSelectFiles': true } ).then((value : vscode.Uri[] | undefined) => {
            if (value !== undefined && value.length > 0) {
                let result : string[] = [];
                child.exec(this.commandrunner_path + " parse-only " + filename + " -f " + value[0].fsPath, (error, stdout, stderr) => {
                    result.push(stdout);
                    if (stdout.indexOf('Exiting') !== undefined) {
                        callback(new CommandRunnerParseOnlyResult(value[0].fsPath, filename, result.join('\n')));
                    }
                });
            }
        });
    }

    public RunTests(filename : string, callback : ((result : CommandRunnerTestRunResult) => void)) {
        let result : string[] = [];
        child.exec(this.commandrunner_path + " test run " + filename, 
        (error, stdout, stderr) => {
            result.push(stdout);
            if (stderr.length > 0)
            {
                return;
            }

            if (stdout.indexOf('Exiting') !== undefined) {
                callback(new CommandRunnerTestRunResult(result.join('\n')));
            }
        });
    }
}