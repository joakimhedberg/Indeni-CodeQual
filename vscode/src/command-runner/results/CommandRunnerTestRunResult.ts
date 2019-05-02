import { CommandRunnerTestCase } from "./CommandRunnerTestCase";

export class CommandRunnerTestRunResult {
    public script_name : string | undefined = undefined;
    public raw_data : string | undefined = undefined;
    public test_cases : CommandRunnerTestCase[] = [];

    public constructor(raw_data : string) {
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
            let test_case = new CommandRunnerTestCase(match[1], this.raw_data);
            this.test_cases.push(test_case);
        }
    }
}