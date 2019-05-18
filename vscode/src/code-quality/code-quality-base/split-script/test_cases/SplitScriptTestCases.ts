import { SplitScriptTestCase } from "./SplitScriptTestCase";
import * as fs from 'fs';
import * as path from 'path';

export class SplitScriptTestCases {
    public static get(test_file_json : string) : SplitScriptTestCase[] {
        let result : SplitScriptTestCase[] = [];

        let json_text : string = fs.readFileSync(test_file_json, { encoding: 'UTF-8' });
        let obj = JSON.parse(json_text);
        for (let key in obj['nameToCase']) {
            let test_case = new SplitScriptTestCase();
            test_case.name = key;
            test_case.input_path = path.join(path.dirname(test_file_json), obj['nameToCase'][key]['inputPath']);
            test_case.output_path = path.join(path.dirname(test_file_json), obj['nameToCase'][key]['outputPath']);
            test_case.input_data_path = this.get_data_path(test_case.input_path);
            result.push(test_case);
        }
        
        return result;
    }

    private static get_data_path(input_json_file : string) {
        let json_text : string = fs.readFileSync(input_json_file, { encoding: 'UTF-8' });
        let value_match = /\"path\"\s?:\s?\"([^\"]+)/g;

        let match = value_match.exec(json_text);
        if (match !== null) {
            return path.join(path.dirname(input_json_file), match[1]);
        }

        return "";
    }
}