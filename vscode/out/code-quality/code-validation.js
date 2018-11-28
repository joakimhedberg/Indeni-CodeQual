"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CodeValidation_1 = require("./code-quality-base/CodeValidation");
const MarkerResult_1 = require("./code-quality-base/MarkerResult");
const SpecialCase_1 = require("./code-quality-base/SpecialCase");
const indeni_script_name_prefixes = ["chkp", "f5", "panos", "nexus", "radware", "junos", "ios", "fortios", "cpembedded", "bluecoat", "linux", "unix"];
const resource_metrics = ["cpu-usage", "memory-usage"];
class CodeValidations {
    constructor() {
        this.functions = get_functions();
    }
    reset() {
        for (let validation of this.functions) {
            validation.reset();
        }
    }
}
exports.CodeValidations = CodeValidations;
function get_functions() {
    var functions = [];
    // Space before examples maybe looks nice, but it's far from exact
    // Example of an offending line: 
    //# my_example
    ///A regexp/ {
    let space_before_example = new CodeValidation_1.CodeValidationRegex("Space before example", "Space before examples may look nice, but it's far from exact unless the input file actually has one. Consider removing this space unless yours does.", CodeValidation_1.FunctionSeverity.warning, ["awk"], /(\# .+)\n\/.+\/\s*{\n/g);
    // Simply for good manners
    // Example of an offending line:
    // description: grab some data from the device
    let lowercase_description = new CodeValidation_1.CodeValidationRegex("Description begins in lower case", "In the english language, it's good practice to begin sentences with upper case.", CodeValidation_1.FunctionSeverity.error, ["meta"], /^description:\s+([a-z]+)/gm);
    // We have had a bug in the platform with scripts running with intervals of more than 60 minutes
    //
    // Example of an offending line:
    // monitoring_interval: 61 minutes
    let monitoring_interval_above_60 = new CodeValidation_1.CodeValidation("Monitoring interval over 60", "Due to a platform bug we don't support intervals over 1 hour.", CodeValidation_1.FunctionSeverity.error, ["meta"]);
    monitoring_interval_above_60.mark = (content, sections) => {
        let result = [];
        let regex = /([0-9][0-9]*? minute[s]{0,1})|([1-9][1-9]*? hour[s]{0,1})/;
        let match = regex.exec(content);
        if (match !== null) {
            if (match.length > 0 && match.index !== undefined) {
                let items = match[0].split(/\s/);
                let time = +items[0];
                let unit = items[1];
                if (unit.indexOf('hour') !== -1) {
                    time *= 60;
                }
                if (time > 60) {
                    result.push(new MarkerResult_1.MarkerResult(match.index, match.index + match[0].length, "Due to a platform bug we do not support intervals over 1 hour.", CodeValidation_1.FunctionSeverity.error, false, match[0]));
                }
            }
        }
        return result;
    };
    // Tabs should not be used for indentation
    // Example of an offending line:
    //  variable = test
    let leading_tab = new CodeValidation_1.CodeValidationRegex("Leading tabs", "Tabs should not be used for indentation, please configure your editor to use space for indentation.", CodeValidation_1.FunctionSeverity.error, ["awk", "yaml"], /^([\t]+)/gm);
    // Single equal sign in an if is always true and the cause of bugs
    // Example of an offending line: 
    //if (variable = 1) { 
    let if_contains_single_equal_sign = new CodeValidation_1.CodeValidationRegex("If statement with single equal sign", "Found an if statement that contains a single equals sign. Since this is most likely an accident (and it'd always return true) it could cause strange bugs in the code. Consider replacing with double equal signs.", CodeValidation_1.FunctionSeverity.error, ["awk"], /if\s+\([^=!]+(=)[^=]+\)\s+\{/gm); // /if\s*?\([^=]+[^=!](=){1}[^=].+\)/gm);
    //Trailing white space serves no purpose
    // Example of an offending line:
    // variable = test 
    let trailing_whitespace = new CodeValidation_1.CodeValidationRegex("Trailing white-space", "Trailing white space serves no purpose and should be removed.", CodeValidation_1.FunctionSeverity.error, ["awk", "yaml"], /([ \t]+)$/gm);
    // writeDebug is great for troubleshooting, but code with that command should never reach customers.
    // Example of an offending line: 
    //writeDebug("this is a debug")    
    let writedebug_exists = new CodeValidation_1.CodeValidationRegex("writeDebug()", "writeDebug() (or debug()) are great for troubleshooting, but code with that function should never reach customers.", CodeValidation_1.FunctionSeverity.error, ["awk"], /(writeDebug\(.+\)|debug\(.+\))/gm);
    // Empty BEGIN sections serves no purpose and should be disposed of.
    // Example of an offending line: 
    //BEGIN {
    //    
    //}
    let empty_begin_section = new CodeValidation_1.CodeValidationRegex("Empty BEGIN", "Empty BEGIN sections serves no purpose and should be disposed of.", CodeValidation_1.FunctionSeverity.warning, ["awk"], /(BEGIN {\s*})/g);
    // Empty END sections serves no purpose and should be disposed of.
    // Example of an offending line: 
    //END {
    //    
    //}
    let empty_end_section = new CodeValidation_1.CodeValidationRegex("Empty END", "Empty END sections serves no purpose and should be disposed of.", CodeValidation_1.FunctionSeverity.warning, ["awk"], /(END {\s*})/g);
    // Space before and after curly brackets and parenthesis makes the code less compact and more readable
    // This is just a recommendation.
    // Example of an offending line: 
    //#if(something == "1"){
    ///A regexp/ {
    let generic_space_before_example_and_after = new CodeValidation_1.CodeValidationRegex("Space <3", "Space in certain places makes the code look nicer.", CodeValidation_1.FunctionSeverity.information, ["awk"], /(if\()|(\){)|}else|else{/g);
    // This check has been removed, it is not needed since git can handle CRLF-LF conversions
    // Line feeds can differ between operating systems and editors, in a mixed environment \n is always the way to go
    // Example of offending line\r\n
    // let carriage_return = new CodeValidationRegex("Carriage return", "Set your editor to use simple line feeds(LF) and not CRLF.", FunctionSeverity.error, ["script"], /(\r+)/g);
    // Changing column values is potentially the cause of bugs and should be avoided
    // Example of an offending line:
    //clusterMode = trim(substr($0, index($0, ":") + 1))
    let column_variable_manipulation = new CodeValidation_1.CodeValidationRegex("Column variable manipulation", "Changing column values (ie. $0, $1) could easily lead to unexpected behaviors.\nIt is highly recommended to instead save the column value to a variable and change that.", CodeValidation_1.FunctionSeverity.warning, ["awk"], /g{0,1}sub.+?(\$[0-9])+/g);
    // A "~" should always be followed by a space (unless it is a regexp)
    // Example of an offending line:
    // if ($0 ~/Active/) {
    let tilde_without_space = new CodeValidation_1.CodeValidationRegex("Tilde without space", "Tilde signs should be followed by space.\nExceptions to this are regexp.", CodeValidation_1.FunctionSeverity.error, ["awk"], /([^ \n]{1}~[^ \n]{1})|([^ \n]{1}~)|(~[^ \n]{1})/gm);
    // Tilde signs should be followed by a regex enclosed in a traditional regex notation (ie. /regexp/).
    // Example of an offending line:
    // if ($0 ~ "ClusterXL Inactive") {
    let tilde_without_regexp_notation = new CodeValidation_1.CodeValidationRegex("Tilde without regexp notation", "Tilde signs should be followed by a regex enclosed in a traditional regex notation (ie. /regexp/).", CodeValidation_1.FunctionSeverity.warning, ["awk"], /(~\s+[^/])/gm);
    // Prefixes is important not only to distinguish which type of device the script is executed on
    // but also to avoid script name collisions. 
    // This is just a recommendation.
    // Example of an offending line: 
    //name: sausage-metric
    let valid_scriptname_prefix = new CodeValidation_1.CodeValidation("Valid script name prefix", "Prefixes are important, not only to distinguish which type of device the script is executed on, but also to avoid script name collisions.\nValid prefixes: " + indeni_script_name_prefixes.join(", "), CodeValidation_1.FunctionSeverity.error, ["meta"]);
    valid_scriptname_prefix.mark = (content, sections) => {
        let result = [];
        let reason = "Prefixes are important, not only to distinguish which type of device the script is executed on, but also to avoid script name collisions.\nValid prefixes: " + indeni_script_name_prefixes.join(", ");
        var script_name_row = content.match(/^name:.*$/m);
        if (script_name_row !== null && script_name_row.length === 1) {
            var script_name = script_name_row[0].split(" ")[1];
            var prefix = script_name.replace(/-.+$/, "");
            if (indeni_script_name_prefixes.indexOf(prefix) === -1) {
                var re = new RegExp(script_name);
                var match = re.exec(content);
                if (match !== null && match.length > 0) {
                    result.push(new MarkerResult_1.MarkerResult(match.index, match.index + match[0].length, reason, CodeValidation_1.FunctionSeverity.error, false, match[0]));
                }
            }
        }
        return result;
    };
    // This function is a bit special as it it does not only parse and mark, it also compares data from different sections
    // Verify that metrics are represented both in Write and in the documentation
    let verify_metric_documentation = new CodeValidation_1.CodeValidation("Undocumented/unused metrics", "The documentation section should have one entry per metric used in the script, and the script should use all documented metrics.", CodeValidation_1.FunctionSeverity.error, ["script"]);
    verify_metric_documentation.mark = verify_metric_marker;
    verify_metric_documentation.offset_handled = true;
    // Metrics should only be written once according to:
    // https://indeni.atlassian.net/wiki/spaces/IKP/pages/81794466/Code+Review+Pull+Requests
    let only_write_metric_once = new CodeValidation_1.CodeValidation("Metric written more than once", "Each metric should only be written in one place. If the metric has been written more than once this test fails.", CodeValidation_1.FunctionSeverity.information, ["awk"]);
    only_write_metric_once.mark = (content, sections) => {
        let result = [];
        let reason = "Each metric should only be written in one place. If the metric has been written more than once this test fails.";
        if (sections.awk !== null) {
            let metrics = sections.awk.get_metrics();
            for (let i = 0; i < metrics.length - 1; i++) {
                for (let j = i + 1; j < metrics.length; j++) {
                    if (metrics[i][0] === metrics[j][0]) {
                        result.push(new MarkerResult_1.MarkerResult(metrics[i][1], metrics[i][1] + metrics[i][0].length, reason, CodeValidation_1.FunctionSeverity.information, false, metrics[i][0]));
                        result.push(new MarkerResult_1.MarkerResult(metrics[j][1], metrics[j][1] + metrics[j][0].length, reason, CodeValidation_1.FunctionSeverity.information, false, metrics[j][0]));
                    }
                }
            }
        }
        return result;
    };
    // A comma should always be followed by a space (unless it is a regexp)
    // Example of an offending line:
    // writeDoubleMetric("debug-status",debugtags,"gauge",3600,state)
    let comma_without_space = new CodeValidation_1.CodeValidationByLine("Comma without space", "Comma signs should be followed by a space.\nExceptions to this are regexp and bash scripts.", CodeValidation_1.FunctionSeverity.error, ["awk"], /(,)[^ \/]/gm, [new SpecialCase_1.SpecialCase(/#/, null)]);
    // Variables should use snake case (snake_case)
    // Example of an offending line: 
    //myVariable = 1
    //my-variable = 1
    //let variable_naming_convention = new CodeValidationByLine("Variable naming", "Most people uses snake case (ie. my_variable) in the repository. This is a suggestion for you to do the same.", FunctionSeverity.warning, ["awk"], /(?!.*\()(["]?[a-z0-9]+([A-Z0-9][a-z0-9]+["]?)+)/g, [new SpecialCase(/\//), new SpecialCase(/#/)], [/"[^"]+"|(([a-z0-9]+\-)+[a-z0-9]+)/g]);
    let variable_naming_convention = new CodeValidation_1.CodeValidation("Variable naming", "Most people uses snake case (ie. my_variable) in the repository. This is a suggestion for you to do the same.", CodeValidation_1.FunctionSeverity.warning, ["awk", "yaml"]);
    variable_naming_convention.mark = awk_variable_naming;
    // includes_resource_data means that the script is always executed by indeni, even during high CPU usage
    //includes_resource_data: true
    let includes_resource_data = new CodeValidation_1.CodeValidation("Resource data validation", "includes_resource_data means that the script is always executed by indeni, even during high CPU usage. It has to be included for scripts using the cpu-usage and/or memory-usage metrics.\nIf this check fails it means that you have specified includes_resource_data, but not used the metrics, or that you have used cpu-usage and/or memory-usage without including includes_resource_data in the meta section.", CodeValidation_1.FunctionSeverity.error, ["script"]);
    includes_resource_data.mark = resource_data_mark;
    // This controls if your YAML script has invalid indentation
    // Since indentation is 4 spaces having a number not divideable 
    // by 4 would cause an error
    //
    // Example of an offending line:
    //       skip-documentation: true
    let invalid_yaml_leading_space = new CodeValidation_1.CodeValidation("Invalid YAML white-space", "Since indentation in YAML is 4 spaces having a number not divisible by 4 would cause an error in most cases.", CodeValidation_1.FunctionSeverity.error, ["yaml"]);
    invalid_yaml_leading_space.mark = verify_yaml_indent;
    let comparison_operator_no_space = new CodeValidation_1.CodeValidationByLine("Equals sign without space", "The equals sign and other comparison operators should be followed by a space.\nExceptions to this are regexp and bash scripts.", CodeValidation_1.FunctionSeverity.error, ["awk"], /([^ =!<>~\n]{1}([=!<>~]{1,2})[^ \n]{1})|(([^ =!<>~\n]{1})([=!<>~]{1,2}))|(([=!<>~]{1,2})[^ =!<>~\n]{1})/gm, [new SpecialCase_1.SpecialCase(/split/), new SpecialCase_1.SpecialCase(/gsub/), new SpecialCase_1.SpecialCase(/sub/), new SpecialCase_1.SpecialCase(/index/), new SpecialCase_1.SpecialCase(/match/), new SpecialCase_1.SpecialCase(/join/), new SpecialCase_1.SpecialCase(/\!\(/), new SpecialCase_1.SpecialCase(/!\//), new SpecialCase_1.SpecialCase(/#/)]);
    functions.push(space_before_example);
    functions.push(lowercase_description);
    functions.push(monitoring_interval_above_60);
    functions.push(leading_tab);
    functions.push(if_contains_single_equal_sign);
    functions.push(trailing_whitespace);
    functions.push(writedebug_exists);
    functions.push(empty_begin_section);
    functions.push(empty_end_section);
    functions.push(generic_space_before_example_and_after);
    functions.push(column_variable_manipulation);
    functions.push(tilde_without_space);
    functions.push(tilde_without_regexp_notation);
    functions.push(valid_scriptname_prefix);
    functions.push(verify_metric_documentation);
    functions.push(only_write_metric_once);
    functions.push(comma_without_space);
    functions.push(variable_naming_convention);
    functions.push(includes_resource_data);
    functions.push(invalid_yaml_leading_space);
    functions.push(comparison_operator_no_space);
    // The CRLF-LF check has been disabled
    // functions.push(carriage_return);
    return functions;
}
function awk_variable_naming(content, sections) {
    let result = [];
    if (sections.awk !== null) {
        for (let res of awk_section_variable_naming(sections.awk)) {
            result.push(res);
        }
    }
    else {
        let yaml_section = sections.xml || sections.json;
        if (yaml_section !== null) {
            for (let awk_section of yaml_section.get_awk()) {
                for (let res of awk_section_variable_naming(awk_section)) {
                    result.push(res);
                }
            }
        }
    }
    return result;
}
function awk_section_variable_naming(section) {
    let result = [];
    let variables = new Map();
    for (let variable of section.get_variables()) {
        let arr = variables.get(variable[0]);
        if (arr === undefined) {
            arr = [];
            variables.set(variable[0], arr);
        }
        arr.push(variable[1]);
    }
    for (let item of variables) {
        if (!verify_variable_spelling(item[0])) {
            for (let startpos of item[1]) {
                result.push(new MarkerResult_1.MarkerResult(startpos, startpos + item[0].length, "Most people uses snake case (ie. my_variable) in the repository. This is a suggestion for you to do the same.", CodeValidation_1.FunctionSeverity.warning, true, item[0]));
            }
        }
    }
    return result;
}
function verify_variable_spelling(varname) {
    let match = varname.match("^[a-z0-9_]*");
    if (match === null) {
        return false;
    }
    return match[0] === varname;
    return true;
}
function verify_yaml_indent(content, sections) {
    let lines = content.split("\n");
    let result = [];
    let line_offset = 0;
    let indexes = [];
    if (sections.json !== null) {
        indexes = sections.json.get_awk_sections();
    }
    else if (sections.xml !== null) {
        indexes = sections.xml.get_awk_sections();
    }
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let regex = /^(\s+)/;
        let match = line.match(regex);
        if (match !== null && match !== undefined) {
            if (match.index !== undefined) {
                if (!is_within(indexes, match.index + line_offset)) {
                    // Workaround to handle CRLF situations. The regex was behaving strangely. Seems like ^ only matches \n which means (\r) is also in the mix
                    var issue = match[1];
                    if (issue.length % 4 && issue.length > 0) {
                        result.push(new MarkerResult_1.MarkerResult(match.index + line_offset, match.index + issue.length + line_offset, "Yaml indent not divisible by 4", CodeValidation_1.FunctionSeverity.error, false, issue));
                    }
                }
            }
        }
        line_offset += lines[i].length + 1;
    }
    return result;
}
function is_within(indexes, match_index) {
    for (let index of indexes) {
        let result = (index[0] <= match_index && match_index <= index[1]);
        if (result) {
            return result;
        }
    }
    return false;
}
function resource_data_mark(content, sections) {
    let result = [];
    if (sections.meta === null) {
        // No meta section, opt out
        return result;
    }
    let parser = sections.awk || sections.json || sections.xml;
    if (parser !== undefined && parser !== null) {
        let metrics = parser.get_metrics();
        let resource_metric_found = false;
        for (let metric of metrics) {
            if (resource_metrics.indexOf(metric[0]) > -1) {
                resource_metric_found = true;
                if (!sections.meta.includes_resource_data) {
                    result.push(new MarkerResult_1.MarkerResult(metric[1] + parser.offset, metric[1] + parser.offset + metric[0].length, "This tag would normally require include_resource_data in the meta section.", CodeValidation_1.FunctionSeverity.error, true, metric[0]));
                }
            }
        }
        if (!resource_metric_found && sections.meta.includes_resource_data_range !== null) {
            let marker = new MarkerResult_1.MarkerResult(sections.meta.includes_resource_data_range[0] + sections.meta.offset, sections.meta.includes_resource_data_range[1] + sections.meta.offset, "Resource data has been used but no metrics that require it seem to exist.", CodeValidation_1.FunctionSeverity.error, true, "includes_resource_data: true");
            result.push(marker);
        }
    }
    return result;
}
function verify_metric_marker(content, sections) {
    let result = [];
    let section = sections.awk || sections.json || sections.xml;
    if (sections.comments !== null && section !== undefined && section !== null) {
        let documented = sections.comments.get_documented_metrics();
        let used = section.get_metrics();
        for (let doc of documented) {
            let exists = false;
            for (let use of used) {
                if (use[0] === doc[0]) {
                    exists = true;
                    break;
                }
                if (exists) {
                    break;
                }
            }
            if (!exists) {
                result.push(new MarkerResult_1.MarkerResult(doc[1] + sections.comments.offset, doc[1] + sections.comments.offset + doc[0].length, "This metric has been documented but is not used in the code.", CodeValidation_1.FunctionSeverity.error, false, doc[0]));
            }
        }
        for (let use of used) {
            let exists = false;
            for (let doc of documented) {
                if (use[0] === doc[0]) {
                    exists = true;
                    break;
                }
                if (exists) {
                    break;
                }
            }
            if (!exists) {
                result.push(new MarkerResult_1.MarkerResult(use[1] + section.offset, use[1] + section.offset + use[0].length, "This metric is used in the code but has not been documented in the meta section!", CodeValidation_1.FunctionSeverity.error, false, use[0]));
            }
        }
    }
    return result;
}
//# sourceMappingURL=code-validation.js.map