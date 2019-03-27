"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SplitScriptSectionBase_1 = require("./SplitScriptSectionBase");
class SplitScriptJsonSection extends SplitScriptSectionBase_1.SplitScriptSectionBase {
    constructor(filename, content = undefined) {
        super(filename, 'json', 'yaml', content);
    }
}
exports.SplitScriptJsonSection = SplitScriptJsonSection;
//# sourceMappingURL=SplitScriptJsonSection.js.map