

// Adding functions:
// Each function must have the following properties
// 1. testName = Shown in the test results
// 2. reason = Shown in the popup
// 3. severity = Which color the test result should have
// 4. mark = A function which takes content and returns marked content

// When you've created the function, don't forget to add it to the function lists below

// Note
// When adding functions, remember to add space before and after the "=", or the tests will trigger.

// Returns a span element with the severity, reason and content that was specified in the parameters
function getSpan(severity, reason, content){
    return "<span class = \"" + severity + "\" title = \"" + reason + "\">" + content + "</span>"
}

// Empty BEGIN sections serves no purpose and should be disposed of.
// Example of an offending line: 
//END {
//    
//}

function emptyBEGINSection (){

    this.testName = "Empty BEGIN";
    this.reason = "Empty BEGIN sections serves no purpose and should be disposed of.";
    this.severity = "warning";

    this.mark = function(content){
        return content.replace(/BEGIN {\s*}/g, getSpan(this.severity, this.reason, "$&"));
    }    
}


// Empty END sections serves no purpose and should be disposed of.
// Example of an offending line: 
//END {
//    
//}

function emptyENDSection (){

    this.testName = "Empty END";
    this.reason = "Empty END sections serves no purpose and should be disposed of.";
    this.severity = "warning";

    this.mark = function(content){
        return content.replace(/END {\s*}/g, getSpan(this.severity, this.reason, "$&"));
    }    
}

// writeDebug is great for troubleshooting, but code with that command should never reach customers.
// Example of an offending line: 
//writeDebug("this is a debug")

function writeDebugExists (){

    this.testName = "writeDebug()";
    this.reason = "writeDebug is great for troubleshooting, but code with that command should never reach customers.";
    this.severity = "error";

    this.mark = function(content){
        return content.replace(/writeDebug\(.+\)/gm, getSpan(this.severity, this.reason, "$&"));
    }    
}

// Single equal sign in an if is always true and the cause of bugs
// Example of an offending line: 
//if (variable = 1) { 

function ifContainsSingleEqualSign (){

    this.testName = "If statement with single equal sign";
    this.reason = "Found an if statement contains a single equal sign. Since this is most likely an accident and it'd always return true it could cause strange bugs in the code. Consider replacing with '=='";
    this.severity = "error";

    this.mark = function(content){
        return content.replace(/if\s*?\([^=]+={1}[^=].+\)/gm, getSpan(this.severity, this.reason, "$&"));
    }    
}

// Changing column values is potentially the cause of bugs and should be avoided
// Example of an offending line:
// variable = test   

function columnVariableManipulation (){
    this.testName = "Column variable manipulation";
    this.reason = "Changing column values (ie. $0, $1) could easily lead to unexpected behaviors.<br>It is highly recommended to instead save the column value to a variable and change that instead.";
    this.severity = "warning";

    this.mark = function(content){
        return content.replace(/g{0,1}sub.+?(\$[0-9])+/gm, getSpan(this.severity, this.reason, "$&"));
    }
}

//Trailing white space serves no purpose
// Example of an offending line:
// variable = test   

function trailingWhiteSpace() {

    this.testName = "Trailing White-Space";
    this.reason = "Trailing white space serves no purpose and should be removed";
    this.severity = "error";

    this.mark = function(content){
        return content.replace(/[ \t]+$/gm, getSpan(this.severity, this.reason, "$&"))
    }

}

// Tabs should not be used for indentation
// Example of an offending line:
//	variable = test

function leadingTab() {

    this.testName = "Leading tabs";
    this.reason = "Tabs should not be used for indentation, please configure your editor to use space for indentation";
    this.severity = "error";

    this.mark = function(content){
        return content.replace(/^[\t]+/gm, getSpan(this.severity, this.reason, "$&"))
    }

}

// An equal sign should almost always be followed by a space (unless it is a regexp)
// Example of an offending line:
// variable=test

function equalSignWithoutSpace() {

    this.testName = "Equal sign without space";
    this.reason = "Equal signs should be followed by space to make the code more readable.<br>Exceptions to this is regexp and bash scripts";
    this.severity = "error";

    this.mark = function(content){
        return content.replace(/([^ =\n]{1}(={1,2})[^ =\n]{1})|(([^ =\n]{1})(={1,2}))|((={1,2})[^ =\n]{1})/gm, getSpan(this.severity, this.reason, "$&"));
    }

}

// A comma should always be followed by a space (unless it is a regexp)
// Example of an offending line:
// writeDoubleMetric("debug-status",debugtags,"gauge",3600,state)

function commaWithoutSpace() {

    this.testName = "Comma without space";
    this.reason = "Commas signs should be followed by space to make the code more readable.<br>Exceptions to this are regexp and bash scripts";
    this.severity = "error";

    this.mark = function(content){
        return content.replace(/(,)[^ ]/gm, getSpan(this.severity, this.reason, "$&"))
    }

}

// A "~" should always be followed by a space (unless it is a regexp)
// Example of an offending line:
// writeDoubleMetric("debug-status",debugtags,"gauge",3600,state)

function tildeWithoutSpace(line) {

    this.testName = "Tilde without space";
    this.reason = "Tilde signs should be followed by space to make the code more readable.<br>Exceptions to this are regexp";
    this.severity = "error";

    this.mark = function(content){
        return content.replace(/([^ \n]{1}(~)[^ \n]{1})|(([^ \n]{1})(~))|((~)[^ \n]{1})/, getSpan(this.severity, this.reason, "$&"));
    }

}

function tildeWithoutRegexpNotation(){

    this.testName = "Tilde without regexp notation"
    this.reason = "Tilde signs should be followed by a regex enclosed in a traditional regex notation (ie. /regexp/)";
    this.severity = "warning";

    this.mark = function(content){
        return content.replace(/(~\s)(\")/gm, "$1" + getSpan(this.severity, this.reason, "$2"));
    }

}

// This controls if your YAML script has invalid indentation
// Since indentation is 4 spaces having a number not divideable 
// by 4 would cause an error
//
// Example of an offending line:
//       skip-documentation: true

function invalidYAMLHeadingSpace(line) {

    this.testName = "Invalid YAML white-space";
    this.reason = "Since indentation in YAML is 4 spaces having a number not divideable by 4 would cause an error in most cases.";
    this.severity = "error";

    this.mark = function(content){

        results = [];

        content.split("\n").map(function(line){
            if (line.search(/\S/) % 4) {
                line = line.replace(/^([ ]+)([^ ])/, getSpan(this.severity, this.reason, "$1") + "$2")
            }
            results.push(line);
        }, this);

        return results.join("\n");
    }
}

// Simply for good manners
// Example of an offending line:
// description: grab some data from the device

function lowerCaseDescription (line) {

    this.testName = "Description begins in lower case";
    this.reason = "In the english language it's good practice to begin sentences with upper case.";
    this.severity = "error";

    this.mark = function(content){
        return content.replace(/^(description:\s+)([a-z]+)/gm, "$1" + getSpan(this.severity, this.reason, "$2"));
    }

}

// We have had a bug in the platform with scripts running with intervals of more than 60 minutes
//
// Example of an offending line:
// monitoring_interval: 61 minutes

function monitoringIntervalAbove60(line) {

    this.testName = "Monitoring interval over 60";
    this.reason = "Due to a platform bug we don't support intervals over 1 hour.";
    this.severity = "error";

    this.mark = function(content){

        return content.replace(/([6-9][1-9][0-9]*? (minute)[s]{0,1})|([2-9][0-9]*? hour[s]{0,1})/gm, getSpan(this.severity, this.reason, "$&"))
    }

}

// These contains all the different functions by type

var testTypesToFunctions = {
    awk: [
        trailingWhiteSpace,
        leadingTab,
        equalSignWithoutSpace,
        commaWithoutSpace,
        tildeWithoutRegexpNotation,
        tildeWithoutSpace,
        columnVariableManipulation,
        ifContainsSingleEqualSign,
        writeDebugExists,
        emptyENDSection,
        emptyBEGINSection
    ],
    yaml: [
        invalidYAMLHeadingSpace,
        trailingWhiteSpace,
        leadingTab,
    ],
    meta: [
        lowerCaseDescription,
        monitoringIntervalAbove60
    ]
}

// These contains all the sections and which types of tests that is applied to them
var sectionToTestTypes = {
    meta: [
        "meta",
        "yaml"
    ],
    comments: [
        "yaml"
    ],
    awk: [
        "awk"
    ]
}

var functionCache = {};

$(document).ready( function(){

    $("textarea#script-textarea").on("keyup onpaste", parseScriptSections);
    $("textarea#script-textarea").trigger("keyup");

});

function getScriptSections(){
    
    var content = $("textarea#script-textarea").val();

    var section = {};

    var regexResult = /#! META\n([.\S\s]+?)#!/g.exec(content);

    if(regexResult != null && regexResult.length == 2){
        section.meta = regexResult[1];
    } else {
        section.meta = "";
    }
    
    var regexResult = /#! COMMENTS\n([.\S\s]+?)#!/g.exec(content);

    if(regexResult != null && regexResult.length == 2){
        section.comments = regexResult[1];
    } else {
        section.comments = "";
    }

    var regexResult = /#! PARSER::AWK.*\n([.\S\s]+?)$/g.exec(content)

    if(regexResult != null && regexResult.length == 2){
        section.awk = regexResult[1];
    } else {
        section.awk = "";
    }

    return section;

}

function parseScriptSections(){
    
    $("div#notexecuted").html("");
    $("div#noncompliant").html("");
    $("div#compliant").html("");
    var section = getScriptSections();

    // Code best practices here

    validateSection("meta", (section.meta || ""));
    validateSection("comments", (section.comments || ""));
    validateSection("awk", (section.awk || ""));

    Object.keys(functionCache).map(function(key, index) {
        f = functionCache[key]

        if(f.compliant && f.executedIn.length > 0){    
            $("div#compliant").append("<button title = \"" + f.reason + "\" class=\"compliant\" id=\"" + key + "\">" + f.testName + "</button>");
        } else if (!f.compliant) {
            $("div#noncompliant").append("<button title = \"" + f.reason + "\" class=\"" + f.severity + "\" id=\"" + key + "\">" + f.testName + "</button>");
        } else {
            $("div#notexecuted").append("<button title = \"" + f.reason + "\" class=\"unknown\" DISABLED>" + f.testName + "</button>");
        }
    });

    $("div#compliant button, div#noncompliant button").on("click", function(){
        
        var f = functionCache[$(this).attr("id")];
        var section = getScriptSections();
        var result = $("textarea#script-textarea").val();

        f.executedIn.map(function(type){
            result = result.replace(section[type], f.mark(section[type]));
        });

        $("pre#result-content").html(result);

    });

    $("div#noncompliant button").trigger("click");

    // Add the tool tips
    tippy("span, button");
}

function getFunction(f){

    if (!functionCache.hasOwnProperty(f.name)){
        functionCache[f.name] = new f();

        functionCache[f.name].isCompliant = function (line){
            return line === this.mark(line);
        }

        functionCache[f.name].compliant = true;
        functionCache[f.name].executedIn = [];

    }

    return functionCache[f.name];

}


function validateSection(section, content){

    testTypes = sectionToTestTypes[section];

    // For each test type, run the different test for the type in question
    testTypes.map(function(type){

        testTypesToFunctions[type].map(function(f){

            try {
                
                var testFunction = getFunction(f);
                
                // So we know where to apply the tests on when the user pushed the button
                if (testFunction.executedIn.indexOf(section) === -1){
                    testFunction.executedIn.push(section);
                }
                
                if (testFunction.compliant){
                    testFunction.compliant = testFunction.isCompliant(content);
                }

            } catch (e) {
                console.log(e);
                $("span#exceptions").append("Failed to execute " + f.name + "<br>");
            }

        });

    })

    return content;

}