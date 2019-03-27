"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const SplitScriptIndSection_1 = require("./sections/SplitScriptIndSection");
const SplitScriptAwkSection_1 = require("./sections/SplitScriptAwkSection");
const SplitScriptXmlSection_1 = require("./sections/SplitScriptXmlSection");
const SplitScriptJsonSection_1 = require("./sections/SplitScriptJsonSection");
const path_1 = require("path");
class SplitScript {
    constructor() {
        // Current open filename
        this.current_filename = '';
        // Current open file extension
        this.current_file_extension = '';
        // File name without path and extension
        this.current_file_basename = '';
        // Full file path without extension
        this.basepath = '';
        // Indeni script path
        this.path = '';
        this.awk_sections = [];
        this.xml_sections = [];
        this.json_sections = [];
        this.load_errors = [];
        this.current_section = undefined;
    }
    load(filename, content) {
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
        }
        else {
            this.load_errors.push('Opt out on basepath');
            return false;
        }
        let filename_split = this.current_filename.split(/^([^.]+)[\.](.*)$/g).filter((el) => {
            return el !== "";
        });
        if (filename_split.length === 2) {
            this.current_file_basename = filename_split[0];
            this.current_file_extension = filename_split[1];
        }
        else {
            return false;
        }
        this.path = filename.substring(0, filename.length - this.current_filename.length);
        for (let fn of fs_1.readdirSync(this.path)) {
            if (fn.endsWith('.ind.yaml')) {
                this.header_section = new SplitScriptIndSection_1.SplitScriptIndSection(this.path + path_1.sep + fn);
                for (let fn_sub of this.header_section.get_parser_filenames()) {
                    this.assign_section(this.path + path_1.sep + fn_sub);
                }
                break;
            }
        }
        if (this.current_filename.toLowerCase().endsWith('.ind.yaml')) {
            this.current_section = new SplitScriptIndSection_1.SplitScriptIndSection(this.current_filename, content);
        }
        else if (this.current_filename.toLowerCase().endsWith('.awk')) {
            this.current_section = new SplitScriptAwkSection_1.SplitScriptAwkSection(this.current_filename, content);
        }
        else if (this.current_filename.toLowerCase().endsWith('.json.yaml')) {
            this.current_section = new SplitScriptJsonSection_1.SplitScriptJsonSection(this.current_filename, content);
        }
        else if (this.current_filename.toLowerCase().endsWith('.xml.yaml')) {
            this.current_section = new SplitScriptXmlSection_1.SplitScriptXmlSection(this.current_filename, content);
        }
        else {
            return false;
        }
        return true;
    }
    assign_section(filename) {
        if (filename.endsWith('.ind.yaml')) {
            this.header_section = new SplitScriptIndSection_1.SplitScriptIndSection(filename);
        }
        else if (filename.endsWith('.awk')) {
            this.awk_sections.push(new SplitScriptAwkSection_1.SplitScriptAwkSection(filename));
        }
        else if (filename.endsWith('.json.yaml')) {
            this.json_sections.push(new SplitScriptJsonSection_1.SplitScriptJsonSection(filename));
        }
        else if (filename.endsWith('.xml.yaml')) {
            this.xml_sections.push(new SplitScriptXmlSection_1.SplitScriptXmlSection(filename));
        }
    }
    get is_valid_script() {
        return this.header_section !== undefined;
    }
}
exports.SplitScript = SplitScript;
//# sourceMappingURL=SplitScript.js.map