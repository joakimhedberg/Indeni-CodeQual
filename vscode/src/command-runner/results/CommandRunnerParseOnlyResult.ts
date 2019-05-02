import { ResultMetric } from "./ResultMetric";

export class CommandRunnerParseOnlyResult {
    public input_file : string | undefined = undefined;
    public script_file : string | undefined = undefined;
    public metrics : ResultMetric[] = [];
    public raw_data : string | undefined = undefined;
    public script_name : string | undefined = undefined;

    public constructor(input_file : string, script_file : string, raw_data : string) {
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
        this.metrics = ResultMetric.parse_from_text(this.raw_data);
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