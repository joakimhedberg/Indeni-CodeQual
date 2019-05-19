import * as vscode from 'vscode';
import * as child from 'child_process';
import * as process from 'process';
import * as fs from 'fs';

import { CommandRunnerParseOnlyResult } from './results/CommandRunnerParseOnlyResult';
import { CommandRunnerTestRunResult } from './results/CommandRunnerTestRunResult';
import { CommandRunnerTestCreateResult } from './results/CommandRunnerTestCreateResult';

export class CommandRunner {
    public errors : string[] = [];
    private commandrunner_path : string | undefined = undefined;
    private commandrunner_uri : vscode.Uri | undefined = undefined;
    private commandrunner_user : string | undefined = undefined;
    private commandrunner_password : string | undefined = undefined;

    public constructor() {
        this.commandrunner_path = vscode.workspace.getConfiguration().get('indeni.commandRunnerPath');
        this.commandrunner_user = vscode.workspace.getConfiguration().get('indeni.commandRunnerUser');
        this.commandrunner_password = vscode.workspace.getConfiguration().get('indeni.commandRunnerPassword');

        if (this.commandrunner_path !== undefined) {
            this.commandrunner_uri = vscode.Uri.file(this.commandrunner_path);
        }
    }

    private verify_command_runner_path() : boolean {
        let result : boolean = false;

        if (this.commandrunner_path !== undefined) {
            if (fs.existsSync(this.commandrunner_path)) {
                result = true;
            }
        }
        
        if (!result) {
            vscode.window.showErrorMessage('Command runner path not specified. Please do so in application settings');
        }
        return result;
    }
    
    public RunFullCommand(input_filename : string, ip_address : string, callback : ((result : CommandRunnerParseOnlyResult) => void)) {
        if (!this.verify_command_runner_path() || this.commandrunner_uri === undefined) {
            return;
        }

        if (this.commandrunner_user === undefined) {
            this.commandrunner_user = '';
        }

        if (this.commandrunner_password === undefined) {
            this.commandrunner_password = '';
        }
        let command = this.escape_filename(this.commandrunner_uri.fsPath) + ` full-command --ssh ${this.commandrunner_user},${this.commandrunner_password} --basic-authentication ${this.commandrunner_user},${this.commandrunner_password} ` + this.escape_filename(input_filename) + " " + ip_address;
        console.log(command);
        child.exec(command, 
        (error, stdout, stderr) => {
            if (error !== null) {
                console.error(error);
            }

            if (stderr !== '') {
                console.error(stderr);
            }
            callback(new CommandRunnerParseOnlyResult(input_filename, ip_address, stdout));
        });
    }

    public RunParseOnly(filename : string, input_filename : string, callback : ((result : CommandRunnerParseOnlyResult) => void)) {
        if (!this.verify_command_runner_path() || this.commandrunner_uri === undefined) {
            return;
        }

        if (this.commandrunner_uri === undefined) {
            return;
        }
        
        child.exec(this.escape_filename(this.commandrunner_uri.fsPath) + " parse-only " + this.escape_filename(filename) + " -f " + this.escape_filename(input_filename), 
        (error, stdout, stderr) => {
            if (error !== null) {
                console.error(error);
            }

            if (stderr !== '') {
                console.error(stderr);
            }

            callback(new CommandRunnerParseOnlyResult(input_filename, filename, stdout));

        });
    }

    public CreateTestCase(script_filename : string, case_name : string, input_filename : string, callback : ((result : CommandRunnerTestCreateResult) => void)) {
        if (!this.verify_command_runner_path || this.commandrunner_uri === undefined) {
            return new Promise<CommandRunnerTestCreateResult>(reject => new Error('No command runner path defined'));
        }

        let command = this.escape_filename(this.commandrunner_uri.fsPath) + " test create " + this.escape_filename(script_filename) + " " + case_name + " " + this.escape_filename(input_filename);
        child.exec(command, (error, stdout, stderr) => {
            if (error !== null) {
                console.error(error);
            }

            if (stderr !== '') {
                console.error(stderr);
            }
            callback(new CommandRunnerTestCreateResult(stdout));
        });
    }

    public RunTests(filename : string, selected_case : string | undefined, callback : ((result : CommandRunnerTestRunResult) => void)) {
        if (!this.verify_command_runner_path() || this.commandrunner_uri === undefined) {
            return;
        }

        let command = this.escape_filename(this.commandrunner_uri.fsPath) + " test run " + this.escape_filename(filename);
        if (selected_case !== undefined) {
            command = this.escape_filename(this.commandrunner_uri.fsPath) + " test run " + this.escape_filename(filename) + " -c " + selected_case;
        }
        

        child.exec(command, 
        (error, stdout, stderr) => {
            if (error !== null) {
                console.error(error);
            }

            if (stderr !== '') {
                console.error(stderr);
            }

            callback(new CommandRunnerTestRunResult(stdout));
        });
    }

    private escape_filename(filename : string) : string {
        if (process.platform === 'win32') {
            return "\"" + filename + "\"";
        }
        return filename.replace(/\s/g, '\\ ');
    }
}