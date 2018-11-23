"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Sections {
    constructor() {
        this.meta = null;
        this.comments = null;
        this.awk = null;
        this.json = null;
        this.xml = null;
        this.script = null;
        this.all = [];
    }
}
exports.Sections = Sections;
class Section {
    constructor(offset, content, apply) {
        this.offset = offset;
        this.content = content;
        this.length = content.length;
        this.apply = apply;
    }
    get_marks(validations, sections) {
        let result = [];
        for (let validation of validations.functions) {
            if (validation.mark === null) {
                continue;
            }
            let can_apply = false;
            for (let sect of validation.apply_to_sections) {
                for (let target_sect of this.apply) {
                    if (sect === target_sect) {
                        can_apply = true;
                        break;
                    }
                }
                if (can_apply) {
                    break;
                }
            }
            if (can_apply) {
                var marks = validation.do_mark(this.content, sections);
                if (marks.length > 0) {
                    for (let mark of marks) {
                        result.push(this.modify_mark(mark));
                    }
                }
            }
        }
        return result;
    }
    modify_mark(marker) {
        if (!marker.offset_handled) {
            marker.start_pos += this.offset;
            marker.end_pos += this.offset;
        }
        return marker;
    }
    create_mark(range, severity, tooltip, offset_handled) {
        let offset = 0;
        if (!offset_handled) {
            offset = this.offset;
        }
        return [severity, tooltip, range[0] + offset, range[1] + offset];
    }
}
exports.Section = Section;
class CommentsSection extends Section {
    constructor(section) {
        super(section.offset, section.content, section.apply);
    }
    get_documented_metrics() {
        let result = [];
        let regex = /^(([^\s:\#])+)/gm;
        let match;
        while (match = regex.exec(this.content)) {
            if (match.length > 1) {
                result.push([match[0], match.index]);
            }
        }
        return result;
    }
}
exports.CommentsSection = CommentsSection;
class AwkSection extends Section {
    constructor(section) {
        super(section.offset, section.content, section.apply);
    }
    get_metrics() {
        let result = [];
        let regex = /^\s{0,}[^\#]\s{0,}write.*Metric\w*\(\"(.*?)\".+$/gm;
        let match;
        while (match = regex.exec(this.content)) {
            if (match.length > 1) {
                result.push([match[1], match[0].indexOf(match[1]) + match.index]);
            }
        }
        return result;
    }
}
exports.AwkSection = AwkSection;
class YamlSection extends Section {
    constructor(section) {
        super(section.offset, section.content, section.apply);
    }
    get_metrics() {
        let result = [];
        let regex = /im\.name\":\s*_constant:\s\"([^\"]+)/gm;
        let match;
        while (match = regex.exec(this.content)) {
            if (match.length > 1) {
                result.push([match[1], match.index + match[0].indexOf(match[1])]);
            }
        }
        return result;
    }
    get_awk_sections() {
        let result = [];
        let regex = /:\s+(\|)\w?/g;
        let match;
        while (match = regex.exec(this.content)) {
            if (match.length > 0) {
                let awk_start = match.index + match.length;
                let awk_end = this.get_awk_end(this.content, awk_start);
                result.push([awk_start, awk_end]);
            }
        }
        return result;
    }
    get_awk_end(content, start) {
        let level = 0;
        let in_quote = false;
        let in_double_quote = false;
        let last_char = undefined;
        for (let i = start; i < content.length; i++) {
            let chr = content.charAt(i);
            switch (chr) {
                case "\"":
                    in_double_quote = !in_double_quote;
                    break;
                case "'":
                    in_quote = !in_quote;
                    break;
                case "{":
                    if (!in_quote && !in_double_quote && last_char !== "\\") {
                        level++;
                    }
                    break;
                case "}":
                    if (!in_quote && !in_double_quote && last_char !== "\\") {
                        level--;
                        if (level <= 0) {
                            return i;
                        }
                    }
                    break;
            }
            last_char = chr;
        }
        return content.length;
    }
}
exports.YamlSection = YamlSection;
class MetaSection extends Section {
    constructor(section) {
        super(section.offset, section.content, section.apply);
        this.includes_resource_data = false;
        this.includes_resource_data_range = null;
        let regex = /^includes_resource_data:\s*true$/m;
        let match = this.content.match(regex);
        this.includes_resource_data = match !== null;
        if (match !== null && match.index !== null && match.length > 0 && match.index !== undefined) {
            this.includes_resource_data_range = [match.index, match.index + match[0].length];
        }
    }
}
exports.MetaSection = MetaSection;
//# sourceMappingURL=Section.js.map