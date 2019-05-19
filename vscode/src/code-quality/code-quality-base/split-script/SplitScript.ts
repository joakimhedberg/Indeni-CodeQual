import { readdirSync, readFileSync } from "fs";
import { SplitScriptIndSection } from "./sections/SplitScriptIndSection";
import { SplitScriptAwkSection } from "./sections/SplitScriptAwkSection";
import { SplitScriptXmlSection } from "./sections/SplitScriptXmlSection";
import { SplitScriptJsonSection } from "./sections/SplitScriptJsonSection";
import { sep } from "path";
import { SplitScriptSectionBase } from "./sections/SplitScriptSectionBase";
import { CommandRunner } from "../../../command-runner/CommandRunner";
import * as path from 'path';
import * as fs from "fs";
import { CommandRunnerResultView } from "../../../gui/CommandRunnerResultView";
import * as vscode from 'vscode';
import { SplitScriptTestCases } from "./test_cases/SplitScriptTestCases";
import { SplitScriptTestCase } from "./test_cases/SplitScriptTestCase";

export class SplitScript {
    // Current open filename
    public current_filename : string = '';

    // Current open file extension
    public current_file_extension = '';

    // File name without path and extension
    public current_file_basename : string = '';

    // Full file path without extension
    public basepath : string = '';

    // Indeni script path
    public path : string = '';

    public header_section : SplitScriptIndSection | undefined;
    public awk_sections : SplitScriptAwkSection[] = [];
    public xml_sections : SplitScriptXmlSection[] = [];
    public json_sections : SplitScriptJsonSection[] = [];

    public load_errors : string[] = [];

    public current_section : SplitScriptSectionBase | undefined = undefined;

    public load(filename : string, content : string | undefined) : boolean {

        if (content === undefined) {
            try
            {
                content = readFileSync(filename).toString();
            } catch (error) {
                console.error(error);
                return false;
            }
        }

        this.load_errors = [];
        let filename_match = filename.match(/([^\\/]+)$/g);
        if (filename_match) {
            this.current_filename = filename_match[0];
        }
        else {
            this.load_errors.push('Opt out on current_filename');
            return false;
        }

        let basename_match = filename.match(/^([^.]+)/g);
        if (basename_match) {
            this.basepath = basename_match[0];
        } else {
            this.load_errors.push('Opt out on basepath');
            return false;
        }
        
        let filename_split = this.current_filename.split(/^([^.]+)[\.](.*)$/g).filter((el) => {
            return el !== "";
        });

        if (filename_split.length === 2) {
            this.current_file_basename = filename_split[0];
            this.current_file_extension = filename_split[1];
        } else {
            return false;
        }

        this.path = filename.substring(0, filename.length - this.current_filename.length);

        for (let fn of readdirSync(this.path)) {
            if (fn.endsWith('.ind.yaml')) {
                this.header_section = new SplitScriptIndSection(this.path + sep + fn);
                for (let fn_sub of this.header_section.get_parser_filenames()) {
                    this.assign_section(this.path + sep + fn_sub);
                }
                break;
            }
        }

        if (this.current_filename.toLowerCase().endsWith('.ind.yaml')) {
            this.current_section = new SplitScriptIndSection(this.current_filename, content);
        } else if (this.current_filename.toLowerCase().endsWith('.awk')) {
            this.current_section = new SplitScriptAwkSection(this.current_filename, content);
        } else if (this.current_filename.toLowerCase().endsWith('.json.yaml')) {
            this.current_section = new SplitScriptJsonSection(this.current_filename, content);
        } else if (this.current_filename.toLowerCase().endsWith('.xml.yaml')) {
            this.current_section = new SplitScriptXmlSection(this.current_filename, content);
        }
        else {
            return false;
        }

        return true;
    }

    private assign_section(filename : string) {
        if (filename.endsWith('.ind.yaml')) {
            this.header_section = new SplitScriptIndSection(filename);
        } else if (filename.endsWith('.awk')) {
            this.awk_sections.push(new SplitScriptAwkSection(filename));
        } else if (filename.endsWith('.json.yaml')) {
            this.json_sections.push(new SplitScriptJsonSection(filename));
        } else if (filename.endsWith('.xml.yaml')) {
            this.xml_sections.push(new SplitScriptXmlSection(filename));
        }
    }
    
    get is_valid_script() {
        return this.header_section !== undefined;
    }

    get script_test_folder() : string | undefined {
        if (this.header_section === undefined) {
            return undefined;
        }

        return this.find_test_root(this.header_section.filename.replace("parsers/src", "parsers/test").replace("parsers\\src", "parsers\\test"));
    }

    find_test_root(filepath : string) : string | undefined {
        let test_json = path.join(filepath, 'test.json');
        if (fs.existsSync(test_json)) {
            return filepath;
        }
    
        filepath = path.resolve(filepath, '..');
        if (fs.existsSync(path.join(filepath, 'test.json'))) {
            return filepath;
        }
    
        return undefined;
    }

    public get_test_cases() : SplitScriptTestCase[] | undefined {
        let test_root = this.script_test_folder;
        if (test_root === undefined) {
            return undefined;
        }

        let test_file = path.join(test_root, 'test.json');
        if (!fs.existsSync(test_file)) {
            return undefined;
        }

        return SplitScriptTestCases.get(test_file);
    }

    public command_runner_test_create(context : vscode.ExtensionContext) {
        if (this.header_section === undefined) {
            return;
        }

        let test_cases = this.get_test_cases();
        if (test_cases === undefined) {
            return;
        }

        if (test_cases.length <= 0) {
            return;
        }

        const items = <vscode.QuickPickItem[]>test_cases.map(
            item => {
                return {
                    label: item.name
                };
            });
            items.unshift({ label: 'New case' });
        
        vscode.window.showQuickPick(items, { 'canPickMany': false, 'placeHolder': 'Pick test case' }).then(value => {
            if (value === undefined) {
                return;
            }
    
            if (value.label !== 'New case') {
                this.get_test_case_name();
                return;
            }
            else {
                this.get_test_case((value : string | undefined) => {
                if (value === undefined) {
                    return;
                }
                    if (test_cases === undefined) {
                        return;
                    }
    
                    let test_case = test_cases.filter((tc : SplitScriptTestCase) => {
                        return tc.name === value;
                    });
                    let selected_case = test_case[0];
                    if (selected_case.name === undefined) {
                        this.get_test_case_name();
                        return;
                    }
    
                    if (selected_case.input_data_path === undefined) {
                        this.get_input_file(selected_case.name);
                        return;
                    }
    
                    this.use_script_input(value, selected_case.input_data_path);
                });
            }
        });      
    }

    private use_script_input(test_case_name : string, test_case_input_data_path : string) {
        let options : vscode.QuickPickItem[] = [];
        options.push({ label: 'Yes' });
        options.push({ label: 'No' });
        
        vscode.window.showQuickPick(options, { placeHolder: 'Do you wish to use the existing input file for test case ' + test_case_name + '?' }).then(value => {
            if (value === undefined) {
                return;
            }

            if (value.label === 'No') {
                this.get_input_file(test_case_name);
            } else {
                this.create_test_case(test_case_name, test_case_input_data_path);
        }}
        );
    }

    private get_test_case_name() {
        vscode.window.showInputBox({ placeHolder: 'Select test case name' }).then((value : string | undefined) => {
            if (value !== undefined) {
                value = value.trim();
                if (value.match(/ /)) {
                    vscode.window.showErrorMessage('Test case should not contain spaces');
                    return;
                }

                this.get_input_file(value);
            }
        });
    }
    
    private get_input_file(test_case_name : string) {
        
        vscode.window.showOpenDialog({ canSelectFolders: false, canSelectMany: false, openLabel: 'Open test case input file' }).then(value => {
            if (value === undefined) {
                return;
            }
            if (value.length < 1) {
                return;
            }

            this.create_test_case(test_case_name, value[0].fsPath);
        });
    }

    private create_test_case(test_case_name : string, input_data_path : string) {
        if (this.header_section === undefined) {
            return;
        }
        let script_filename = this.header_section.filename;
        let cr = new CommandRunner();
        cr.CreateTestCase(script_filename, test_case_name, input_data_path, result => { 
        
        if (result === undefined){
            vscode.window.showErrorMessage('Unable to create test case');
            return;
        }
        
        if (!result.success)
        {
            vscode.window.showErrorMessage('Unable to create test case');
            return;
        }

        vscode.window.showInformationMessage(`Created test case '${result.test_case}' for command '${result.script_name}'`);
    });
        /*, (result : CommandRunnerTestCreateResult) => {
        
            if (result.success) {
                vscode.window.showInformationMessage(`Created test case '${result.test_case}' for command '${result.script_name}'`);
            }
            else {
                vscode.window.showErrorMessage('Unable to create test case');
            }
        });*/
    }


    private get_test_case(callback : (value : string | undefined) => void)  {
        vscode.window.showInputBox({ placeHolder: 'Test case name' }).then((value : string | undefined) => {
            if (value === undefined) {
                callback(undefined);
            }
            else {
                let match = /[a-z]{0,}[\-]?[a-z]{0,}/gm;
                if (value.match(match)) {
                    callback(value);
                }

                callback(value);
            }
        });
    }

    public command_runner_test(context : vscode.ExtensionContext) {
        if (this.header_section === undefined) {
            return;
        }
        let test_cases = this.get_test_cases();
        if (test_cases !== undefined) {
            if (test_cases.length > 0) {
                const items = <vscode.QuickPickItem[]>test_cases.map(
                    item => 
                    {
                        return {
                            label: item.name
                        };
                    });
                    items.unshift({ label: 'All' });
                    
                vscode.window.showQuickPick(items, { 'canPickMany': false, 'placeHolder': 'Pick test case' }).then((value : vscode.QuickPickItem | undefined) => {
                    let selected_case : string | undefined = undefined;
                    if (value !== undefined) {
                        if (value.label !== 'All') {
                            selected_case = value.label;
                        }
                    }
                    else {
                        return;
                    }

                    if (this.header_section === undefined) {
                        return;
                    }

                    let command_runner = new CommandRunner();
                    command_runner.RunTests(this.header_section.filename, selected_case, (result) => {
                        let view = new CommandRunnerResultView(context.extensionPath);
                        view.show_test_result(result);
                    });
                });
            }
        }
        else {
            let command_runner = new CommandRunner();
            command_runner.RunTests(this.header_section.filename, undefined, (result) => {
                let view = new CommandRunnerResultView(context.extensionPath);
                view.show_test_result(result);
            });
        }
    }

    public command_runner_full_command(context : vscode.ExtensionContext) {
        if (this.header_section === undefined) {
            return;
        }

        vscode.window.showInputBox({ placeHolder: 'IP Address' }).then((value : string | undefined) => {
            if (value === undefined || this.header_section === undefined) {
                return;
            }
            let command_runner = new CommandRunner();
            command_runner.RunFullCommand(this.header_section.filename, value, (result) => {
                let view = new CommandRunnerResultView(context.extensionPath);
                view.show_parser_result(result);
                return;
            });
        });
    }

    public command_runner_parse(context : vscode.ExtensionContext, tests_path : string | undefined) {
        if (this.header_section === undefined) {
            return;
        }
        
        let pick_items : vscode.QuickPickItem[] = [];
        let test_cases = this.get_test_cases();
        if (test_cases !== undefined) {
            if (test_cases.length > 0) {
                for (let test_case of test_cases) {
                    if (test_case.name !== undefined) {
                        pick_items.push({ label: test_case.name });
                    }
                }
            }
        }
        pick_items.push({ label: 'Browse...' });
        vscode.window.showQuickPick(pick_items, { 'canPickMany': false, 'placeHolder': 'Pick test case' }).then((value : vscode.QuickPickItem | undefined) => {
            if (value !== undefined) {
                if (value.label === 'Browse...') {
                    vscode.window.showOpenDialog( { 'canSelectFolders' : false, 'canSelectFiles': true, 'canSelectMany': false, 'defaultUri': (tests_path !== undefined)? vscode.Uri.file(tests_path): undefined } ).then((value : vscode.Uri[] | undefined) => {
                        if (value !== undefined && this.header_section !== undefined) {
                            if (value.length > 0) {
                                    let command_runner = new CommandRunner();
                                    command_runner.RunParseOnly(this.header_section.filename, value[0].fsPath, (result) => {
                                    let view = new CommandRunnerResultView(context.extensionPath);
                                    view.show_parser_result(result);
                                    return;
                                });
                            }
                        }
                    });
                    return;
                }
                else if (test_cases !== undefined) {
                    let selected_case = test_cases.find((item : SplitScriptTestCase) => { return item.name === value.label; });

                    if (selected_case !== undefined && this.header_section !== undefined) {
                        if (selected_case.input_data_path !== undefined) {
                            let command_runner = new CommandRunner();
                            command_runner.RunParseOnly(this.header_section.filename, selected_case.input_data_path, (result) => {
                            let view = new CommandRunnerResultView(context.extensionPath);
                            view.show_parser_result(result);
                            return;
                        });
                    }

                }
            }
        }
    });
}
}