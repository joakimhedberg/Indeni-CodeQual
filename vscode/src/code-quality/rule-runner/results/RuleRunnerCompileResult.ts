import { CommandRunnerResultBase } from "../../../command-runner/results/CommandRunnerResultBase";

export class RuleRunnerCompileResult extends CommandRunnerResultBase {
    public items : [string, string][] = [];
    public has_error : boolean = false;
    public error_data : string = "";

    public constructor(data : string) {
        super(data);

        this.parse_items();
    }

    parse_items() {
        let info_regex = /Compiled rule:(.+)[0-9]{4}\-[0-9]{2}\-[0-9]{2}/gs;
        let error_regex = /Error while executing rule runner(.+)[0-9]{4}\-[0-9]{2}\-[0-9]{2}/gs;
        
        let match = info_regex.exec(this.raw_data_stripped);
        if (match !== null) {
            if (match.length > 0) {
                let data = match[1].trim();

                for (let row of data.split('\n')) {
                    let items = row.split(':');
                    if (items.length === 2) {
                        this.items.push([items[0], items[1]]);
                    }
                }
            }
        }

        let error_match = error_regex.exec(this.raw_data_stripped);
        if (error_match) {
            this.has_error = true;
            this.error_data = error_match[1].trim();
        }
    }
}