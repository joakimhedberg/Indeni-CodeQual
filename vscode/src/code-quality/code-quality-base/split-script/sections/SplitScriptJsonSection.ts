import { SplitScriptSectionBase } from "./SplitScriptSectionBase";

export class SplitScriptJsonSection extends SplitScriptSectionBase {
    constructor(filename : string, content : string | undefined = undefined) {
        super(filename, 'json', 'yaml', content);
    }
}