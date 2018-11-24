import { MarkerResult } from "./MarkerResult";
import { CodeValidations } from "../code-validation";

/*
    The .ind script is split up into sections, that way we can apply the correct check to the correct section
*/
export class Sections {
    public meta : MetaSection | null = null;
    public comments : CommentsSection | null = null;
    public awk : AwkSection | null = null;
    public json : YamlSection | null = null;
    public xml : YamlSection | null = null;
    public script : Section | null = null;
    public all : Section[] = []; // This contains all the sections. This is what we are iterating while performing the checks.
}

export class Section {
    public offset : number; // Section offset in the script
    content : string; // Section content
    length : number; // Section total length
    public apply : string[]; // What type of checks should be applied here? Example: ["meta", "awk"]
    constructor(offset : number, content : string, apply : string[]) {
        this.offset = offset;
        this.content = content;
        this.length = content.length;
        this.apply = apply;
    }

    // Run all validations(that are applicable) and return check markers if needed
    get_marks(validations : CodeValidations, sections: Sections) : MarkerResult[] {
        let result : MarkerResult[] = [];

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

    // Modify the marker offset if it's not already handled
    modify_mark(marker : MarkerResult) : MarkerResult
    {
        if (!marker.offset_handled) {
            marker.start_pos += this.offset;
            marker.end_pos += this.offset;
        }

        return marker;
    }
}


// Comment specific section. Makes it possible to get some extra data out of the specific section.
export class CommentsSection extends Section {
    constructor(section : Section) {
        super(section.offset, section.content, section.apply);
    }

    // Get the metrics that has been documented in this section. Returns a tuple with metric name and metric offset
    public get_documented_metrics() : [string, number][] {
        let result : [string, number][] = [];

        let regex = /^(([^\s:\#])+)/gm;
        let match;

        while (match = regex.exec(this.content))
        {
            if (match.length > 1)
            {
                result.push([match[0], match.index]);
            }
        }
        
        return result;
    }
}

// Awk specific section. Makes it possible to get some extra data out of the specific section.
export class AwkSection extends Section {
    constructor(section : Section) {
        super(section.offset, section.content, section.apply);
    }

    // Get metrics that has been used in this section. Ignores commented lines.
    public get_metrics() : [string, number][] {
        let result : [string, number][] = [];

        let regex = /^\s{0,}[^\#]\s{0,}write.*Metric\w*\(\"(.*?)\".+$/gm;
        
        let match;
        while (match = regex.exec(this.content))
        {
            if (match.length > 1)
            {
                result.push([match[1], match[0].indexOf(match[1]) + match.index]);
            }
        }

        return result;
    }
}

// Yaml specific section. Makes it possible to get some extra data out of the specific section.
export class YamlSection extends Section {
    constructor(section : Section) {
        super(section.offset, section.content, section.apply);
    }
    
    // Get metrics that has been used in this section. Ignores commented lines.
    public get_metrics() : [string, number][] {
        let result : [string, number][] = [];

        let regex = /im\.name\":\s*_constant:\s\"([^\"]+)/gm;

        let match;
        while (match = regex.exec(this.content)) {
            if (match.length > 1) {
                result.push([match[1], match.index + match[0].indexOf(match[1])]);
            }
        }

        return result;
    }

    /* Get awk specific sections. Example: 
    _value.double: |
                    {
                        if((temp("virtualStatus") == "offline") && (temp("enabledState") == "enabled")) {
                            print "1"
                        } else {
                            print "0"
                        }
                    }

        That way we can ignore the awk text in the yaml checks.
    */
    public get_awk_sections() : [number, number][] {
        let result : [number, number][] = [];

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
    
    // Internal function used while parsing awk sections.
    get_awk_end(content : string, start : number) {
        let level : number = 0;
        let in_quote : boolean = false;
        let in_double_quote : boolean = false;
        let last_char : string | undefined = undefined;
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

// Meta specific section. Makes it possible to get some extra data out of the specific section.
export class MetaSection extends Section {
    includes_resource_data : boolean = false;
    includes_resource_data_range : ([number, number]) | null = null;
    constructor(section : Section) {
        super(section.offset, section.content, section.apply);
        // Gets an indicator if the meta section uses resource data. Used in one of the checks.
        let regex = /^includes_resource_data:\s*true$/m;
        let match = this.content.match(regex);
        this.includes_resource_data = match !== null;
        if (match !== null && match.index !== null && match.length > 0 && match.index !== undefined) {
            this.includes_resource_data_range = [match.index, match.index + match[0].length];
        }
    }

}