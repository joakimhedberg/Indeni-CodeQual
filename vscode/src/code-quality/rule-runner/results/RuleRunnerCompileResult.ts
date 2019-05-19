import { CommandRunnerResultBase } from "../../../command-runner/results/CommandRunnerResultBase";

export class RuleRunnerCompileResult extends CommandRunnerResultBase {
    public items : [string, string][] = [];
    
    public constructor(data : string) {
        super(data);

        this.parse_items();
    }

    parse_items() {
        
    }
}