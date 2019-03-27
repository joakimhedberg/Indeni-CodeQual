import { SplitScriptSectionBase } from "./SplitScriptSectionBase";

export class SplitScriptXmlSection extends SplitScriptSectionBase {
    constructor(filename : string, content : string | undefined = undefined) {
        super(filename, 'xml', 'yaml', content);
    }
}