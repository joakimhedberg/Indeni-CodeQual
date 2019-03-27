"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SplitScriptSectionBase_1 = require("./SplitScriptSectionBase");
class SplitScriptXmlSection extends SplitScriptSectionBase_1.SplitScriptSectionBase {
    constructor(filename, content = undefined) {
        super(filename, 'xml', 'yaml', content);
    }
}
exports.SplitScriptXmlSection = SplitScriptXmlSection;
//# sourceMappingURL=SplitScriptXmlSection.js.map