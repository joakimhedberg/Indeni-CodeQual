import { readdirSync, readFileSync } from "fs";
import { SplitScriptIndSection } from "./sections/SplitScriptIndSection";
import { SplitScriptAwkSection } from "./sections/SplitScriptAwkSection";
import { SplitScriptXmlSection } from "./sections/SplitScriptXmlSection";
import { SplitScriptJsonSection } from "./sections/SplitScriptJsonSection";
import { sep } from "path";
import { SplitScriptSectionBase } from "./sections/SplitScriptSectionBase";

export class SplitScript {
    // Current open filename
    public current_filename : string = '';

    // Current open file extension
    public current_file_extension = '';

    // File name without path and extension
    public current_file_basename : string = '';

    // Full file path without extension
    public basepath : string = '';

    // Indeni script path
    public path : string = '';

    public header_section : SplitScriptIndSection | undefined;
    public awk_sections : SplitScriptAwkSection[] = [];
    public xml_sections : SplitScriptXmlSection[] = [];
    public json_sections : SplitScriptJsonSection[] = [];

    public load_errors : string[] = [];

    public current_section : SplitScriptSectionBase | undefined = undefined;

    public load(filename : string, content : string | undefined) : boolean {

        if (content === undefined) {
            try
            {
                content = readFileSync(filename).toString();
            } catch (error) {
                console.log(error);
                return false;
            }
        }

        this.load_errors = [];
        let filename_match = filename.match(/([^\\/]+)$/g);
        if (filename_match) {
            this.current_filename = filename_match[0];
        }
        else {
            this.load_errors.push('Opt out on current_filename');
            return false;
        }

        let basename_match = filename.match(/^([^.]+)/g);
        if (basename_match) {
            this.basepath = basename_match[0];
        } else {
            this.load_errors.push('Opt out on basepath');
            return false;
        }
        
        let filename_split = this.current_filename.split(/^([^.]+)[\.](.*)$/g).filter((el) => {
            return el !== "";
        });

        if (filename_split.length === 2) {
            this.current_file_basename = filename_split[0];
            this.current_file_extension = filename_split[1];
        } else {
            return false;
        }

        this.path = filename.substring(0, filename.length - this.current_filename.length);

        for (let fn of readdirSync(this.path)) {
            if (fn.endsWith('.ind.yaml')) {
                this.header_section = new SplitScriptIndSection(this.path + sep + fn);
                for (let fn_sub of this.header_section.get_parser_filenames()) {
                    this.assign_section(this.path + sep + fn_sub);
                }
                break;
            }
        }

        if (this.current_filename.toLowerCase().endsWith('.ind.yaml')) {
            this.current_section = new SplitScriptIndSection(this.current_filename, content);
        } else if (this.current_filename.toLowerCase().endsWith('.awk')) {
            this.current_section = new SplitScriptAwkSection(this.current_filename, content);
        } else if (this.current_filename.toLowerCase().endsWith('.json.yaml')) {
            this.current_section = new SplitScriptJsonSection(this.current_filename, content);
        } else if (this.current_filename.toLowerCase().endsWith('.xml.yaml')) {
            this.current_section = new SplitScriptXmlSection(this.current_filename, content);
        }
        else {
            return false;
        }

        return true;
    }

    private assign_section(filename : string) {
        if (filename.endsWith('.ind.yaml')) {
            this.header_section = new SplitScriptIndSection(filename);
        } else if (filename.endsWith('.awk')) {
            this.awk_sections.push(new SplitScriptAwkSection(filename));
        } else if (filename.endsWith('.json.yaml')) {
            this.json_sections.push(new SplitScriptJsonSection(filename));
        } else if (filename.endsWith('.xml.yaml')) {
            this.xml_sections.push(new SplitScriptXmlSection(filename));
        }
    }
    
    get is_valid_script() {
        return this.header_section !== undefined;
    }
}