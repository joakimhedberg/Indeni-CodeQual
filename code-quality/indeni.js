
// Adding functions:
// Each function must have the following properties.
// 1. testName: Shown in the test results.
// 2. reason: Shown in the popup.
// 3. severity: Which color the test result should have.
// 4. applyToSections: Which sections the function should apply to.
// 5. mark = A function which takes section content as parameter and returns modified matched content.

// Note:
// When adding functions, remember to add space before and after the "=", or the tests will trigger.

var codeValidationFunctions = {
    
    "spaceBeforeExample": new function() {

        // Space before examples maybe looks nice, but it's far from exact
        // Example of an offending line: 
        //# my_example
        ///A regexp/ {

        this.testName = "Space before example";
        this.reason = "Space before examples maybe looks nice, but it's far from exact unless the input file actually has one. Consider removing this space unless yours does";
        this.severity = "warning";
        this.applyToSections = ["awk"];

        this.mark = function(content){
            return content.replace(/(\# .+)(\n\/.+\/\s*{\n)/g, getSpan(this.severity, this.reason, "$1") + "$2");
        }
    },
    "variableNamingConventions": new function (){

        // Variables should use snake case (snake_case)
        // Example of an offending line: 
        //myVariable = 1
        //my-variable = 1

        this.testName = "Variable naming";
        this.reason = "Most people use snake case (ie. my_variable) in the repository. This is a suggestion for you to do the same.";
        this.severity = "warning";
        this.applyToSections = ["awk"];

        this.mark = function(content){
            return content.replace(/([a-z][A-Z][a-z]{0,}\s*=\s*|\-[a-zA-Z]+\s*=\s*)/gm, getSpan(this.severity, this.reason, "$&"));
        }
    },
    "emptyBEGINSection": new function (){
        // Empty BEGIN sections serves no purpose and should be disposed of.
        // Example of an offending line: 
        //END {
        //    
        //}

        this.testName = "Empty BEGIN";
        this.reason = "Empty BEGIN sections serves no purpose and should be disposed of.";
        this.severity = "warning";
        this.applyToSections = ["awk"];

        this.mark = function(content){
            return content.replace(/BEGIN {\s*}/g, getSpan(this.severity, this.reason, "$&"));
        }
    },
    "emptyENDSection": new function (){

        // Empty END sections serves no purpose and should be disposed of.
        // Example of an offending line: 
        //END {
        //    
        //}

        this.testName = "Empty END";
        this.reason = "Empty END sections serves no purpose and should be disposed of.";
        this.severity = "warning";
        this.applyToSections = ["awk"];

        this.mark = function(content){
            return content.replace(/END {\s*}/g, getSpan(this.severity, this.reason, "$&"));
        }    
    }, 
    "writeDebugExists": new function(){

        // writeDebug is great for troubleshooting, but code with that command should never reach customers.
        // Example of an offending line: 
        //writeDebug("this is a debug")

        this.testName = "writeDebug()";
        this.reason = "writeDebug is great for troubleshooting, but code with that command should never reach customers.";
        this.severity = "error";
        this.applyToSections = ["awk"];

        this.mark = function(content){
            return content.replace(/writeDebug\(.+\)/gm, getSpan(this.severity, this.reason, "$&"));
        }    
    },
    "ifContainsSingleEqualSign": new function (){

        // Single equal sign in an if is always true and the cause of bugs
        // Example of an offending line: 
        //if (variable = 1) { 

        this.testName = "If statement with single equal sign";
        this.reason = "Found an if statement contains a single equal sign. Since this is most likely an accident and it'd always return true it could cause strange bugs in the code. Consider replacing with '=='";
        this.severity = "error";
        this.applyToSections = ["awk"];

        this.mark = function(content){
            return content.replace(/if\s*?\([^=]+={1}[^=].+\)/gm, getSpan(this.severity, this.reason, "$&"));
        }    
    },
    "columnVariableManipulation": new function (){

        // Changing column values is potentially the cause of bugs and should be avoided
        // Example of an offending line:
        // variable = test   

        this.testName = "Column variable manipulation";
        this.reason = "Changing column values (ie. $0, $1) could easily lead to unexpected behaviors.<br>It is highly recommended to instead save the column value to a variable and change that instead.";
        this.severity = "warning";
        this.applyToSections = ["awk"];

        this.mark = function(content){
            return content.replace(/g{0,1}sub.+?(\$[0-9])+/gm, getSpan(this.severity, this.reason, "$&"));
        }
    },
    "trailingWhiteSpace": new function() {

        //Trailing white space serves no purpose
        // Example of an offending line:
        // variable = test   

        this.testName = "Trailing White-Space";
        this.reason = "Trailing white space serves no purpose and should be removed";
        this.severity = "error";
        this.applyToSections = ["awk", "yaml"];

        this.mark = function(content){
            return content.replace(/[ \t]+$/gm, getSpan(this.severity, this.reason, "$&"))
        }

    },
    "leadingTab": new function () {

        // Tabs should not be used for indentation
        // Example of an offending line:
        //  variable = test

        this.testName = "Leading tabs";
        this.reason = "Tabs should not be used for indentation, please configure your editor to use space for indentation";
        this.severity = "error";
        this.applyToSections = ["awk", "yaml"];

        this.mark = function(content){
            return content.replace(/^[\t]+/gm, getSpan(this.severity, this.reason, "$&"))
        }

    },
    "equalSignWithoutSpace": new function () {

        // An equal sign should almost always be followed by a space (unless it is a regexp)
        // Example of an offending line:
        // variable=test

        this.testName = "Equal sign without space";
        this.reason = "Equal signs should be followed by space to make the code more readable.<br>Exceptions to this is regexp and bash scripts";
        this.severity = "error";
        this.applyToSections = ["awk"];

        this.mark = function(content){
            return content.replace(/([^ =\n]{1}(={1,2})[^ =\n]{1})|(([^ =\n]{1})(={1,2}))|((={1,2})[^ =\n]{1})/gm, getSpan(this.severity, this.reason, "$&"));
        }

    },
    "commaWithoutSpace": new function () {

        // A comma should always be followed by a space (unless it is a regexp)
        // Example of an offending line:
        // writeDoubleMetric("debug-status",debugtags,"gauge",3600,state)

        this.testName = "Comma without space";
        this.reason = "Commas signs should be followed by space to make the code more readable.<br>Exceptions to this are regexp and bash scripts";
        this.severity = "error";
        this.applyToSections = ["awk"];

        this.mark = function(content){
            return content.replace(/(,)[^ ]/gm, getSpan(this.severity, this.reason, "$&"))
        }

    },
    "tildeWithoutSpace": new function () {

        // A "~" should always be followed by a space (unless it is a regexp)
        // Example of an offending line:
        // writeDoubleMetric("debug-status",debugtags,"gauge",3600,state)

        this.testName = "Tilde without space";
        this.reason = "Tilde signs should be followed by space to make the code more readable.<br>Exceptions to this are regexp";
        this.severity = "error";
        this.applyToSections = ["awk"];

        this.mark = function(content){
            return content.replace(/([^ \n]{1}(~)[^ \n]{1})|(([^ \n]{1})(~))|((~)[^ \n]{1})/, getSpan(this.severity, this.reason, "$&"));
        }

    },
    "tildeWithoutRegexpNotation": new function (){

        // Tilde signs should be followed by a regex enclosed in a traditional regex notation (ie. /regexp/).
        // Example of an offending line:
        // writeDoubleMetric("debug-status",debugtags,"gauge",3600,state)

        this.testName = "Tilde without regexp notation"
        this.reason = "Tilde signs should be followed by a regex enclosed in a traditional regex notation (ie. /regexp/)";
        this.severity = "warning";
        this.applyToSections = ["awk"];

        this.mark = function(content){
            return content.replace(/(~\s)(\")/gm, "$1" + getSpan(this.severity, this.reason, "$2"));
        }

    },
    "invalidYAMLHeadingSpace": new function () {

        // This controls if your YAML script has invalid indentation
        // Since indentation is 4 spaces having a number not divideable 
        // by 4 would cause an error
        //
        // Example of an offending line:
        //       skip-documentation: true

        this.testName = "Invalid YAML white-space";
        this.reason = "Since indentation in YAML is 4 spaces having a number not divideable by 4 would cause an error in most cases.";
        this.severity = "error";
        this.applyToSections = ["yaml"];

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
    },
    "lowerCaseDescription": new function  () {

        // Simply for good manners
        // Example of an offending line:
        // description: grab some data from the device

        this.testName = "Description begins in lower case";
        this.reason = "In the english language it's good practice to begin sentences with upper case.";
        this.severity = "error";
        this.applyToSections = ["meta"];

        this.mark = function(content){
            return content.replace(/^(description:\s+)([a-z]+)/gm, "$1" + getSpan(this.severity, this.reason, "$2"));
        }

    },
    "monitoringIntervalAbove60": new function () {

        // We have had a bug in the platform with scripts running with intervals of more than 60 minutes
        //
        // Example of an offending line:
        // monitoring_interval: 61 minutes

        this.testName = "Monitoring interval over 60";
        this.reason = "Due to a platform bug we don't support intervals over 1 hour.";
        this.severity = "error";
        this.applyToSections = ["meta"];

        this.mark = function(content){

            return content.replace(/([6-9][1-9][0-9]*? (minute)[s]{0,1})|([2-9][0-9]*? hour[s]{0,1})/gm, getSpan(this.severity, this.reason, "$&"))
        }
    }
}

// Returns a span element with the severity, reason and content that was specified in the parameters
function getSpan(severity, reason, content){
    return "<span class = \"" + severity + "\" title = \"" + reason + "\">" + content + "</span>"
}


// Bind the functions that controls that the tests should be executed upon keyup
// in the script text area

$(document).ready( function(){
    $("textarea#script-textarea").on("keyup onpaste", parseScriptSections);
    $("textarea#script-textarea").trigger("keyup");
});


// This function gets the different sections from the script
// A section could be meta, comments, awk, json, xml.
// This function needs some coding love.
function getScriptSections(){
    
    var content = $("textarea#script-textarea").val();

    var section = {};

    var regexResult = /#! META\n([.\S\s]+?)#!/g.exec(content);

    if(regexResult != null && regexResult.length == 2){
        section.meta = {};
        section.meta.content = regexResult[1];
        section.meta.apply = ["yaml", "meta"];
    }
    
    var regexResult = /#! COMMENTS\n([.\S\s]+?)#!/g.exec(content);

    if(regexResult != null && regexResult.length == 2){
        section.comments = {};
        section.comments.content = regexResult[1];
        section.comments.apply = ["yaml", "comments"];
    }

    var regexResult = /#! PARSER::AWK.*\n([.\S\s]+?)$/g.exec(content)

    if(regexResult != null && regexResult.length == 2){
        section.awk = {};
        section.awk.content = regexResult[1];
        section.awk.apply = ["awk"]
    }

    return section;

}

// Add a prototype to each codeValidation function
// that checks if the code has changed or not.
// If it has changed it means that the code is non-compliant.
for(f in codeValidationFunctions){
    codeValidationFunctions[f].isCompliant = function (line){
        return line === this.mark(line);
    }
}

// Each time the user is updating the source text area the checks must be executed again
// This function resets all the necessary values
function resetApplication(){
    for(f in codeValidationFunctions){
        codeValidationFunctions[f].compliant = true;
        codeValidationFunctions[f].executed = false;
    }

    // Reset test results
    $("div#notexecuted").html("");
    $("div#noncompliant").html("");
    $("div#compliant").html("");
    $("pre#result-content").html($("textarea#script-textarea").val());

}


function parseScriptSections(){
    
    //Get the active button, if any
    var activeButton = $("div button#noncompliant[active = 'true']").attr("id")

    // Reset the test function properties and the test results
    resetApplication();

    // Get the sections
    var sections = getScriptSections();

    // Generate test results
    validateSections(sections);

    // Check each function to see if it found a non-compliance in the code
    // Update the test results accordingly

    for(name in codeValidationFunctions){

        f = codeValidationFunctions[name];

        if(f.compliant && f.executed){    
            $("div#compliant").append("<button title = \"" + f.reason + "\" class=\"compliant\" id=\"" + name + "\">" + f.testName + "</button>");
        } else if (!f.compliant) {
            $("div#noncompliant").append("<button title = \"" + f.reason + "\" class=\"" + f.severity + "\" id=\"" + name + "\">" + f.testName + "</button>");
        } else {
            $("div#notexecuted").append("<button title = \"" + f.reason + "\" class=\"notexecuted\" DISABLED>" + f.testName + "</button>");
        }

    };

    // Bind the test result buttons to the click value
    $("div#noncompliant button").on("click", function(){
        
        $("div button").attr("active", "false");
        $(this).attr("active", "true");

        // Get the function that "spawned" this button
        var sections = getScriptSections();

        var f = codeValidationFunctions[$(this).attr("id")]

        // Get the source script pasted by the user        
        var sourceScript = $("textarea#script-textarea").val();

        // For each executed section, mark the non-compliant content by replacing 
        // it with a span that has a non-compliance css class
        f.applyToSections.map(function(type){
            if(sections.hasOwnProperty(type)){
                var sectionContent = sections[type].content;
                result = sourceScript.replace(sectionContent, f.mark(sectionContent));
            }
        });

        // Update the background
        $("pre#result-content").html(result);

        tippy("span.error, span.warning, button", {
            animation: "scale"
        });
        
    });

    // Trigger a click value (technically this triggers all, but I was lazy)

    if(activeButton !== undefined){
        $("div button#" + activeButton).trigger("click");
    } else {
        $("div#noncompliant button").last().trigger("click");
    }

}

function validateSections(sections){

    for (section in sections){
        
        // section could be ie. "awk" here
        // sectionContent is the content of the awk parser
        sectionContent = sections[section].content;
        
        // Loop through the codeValidationFunctions and run each one that
        // has ie. "awk" in the applyToSections array

        sections[section].apply.map(function(type){

            for(name in codeValidationFunctions){

                f = codeValidationFunctions[name];

                if(f.applyToSections.indexOf(type) !== -1){
                    try {

                        // Mark the function as executed. This is so we don't mark JSON parser functions
                        // as successful in the awk parser
                        f.executed = true;

                        // Check if the function found something already
                        // If not, run the tests
                        if (f.compliant){
                            f.compliant = f.isCompliant(sectionContent);
                        }

                    } catch (e) {
                        console.log(e);
                        $("span#exceptions").append("Failed to execute " + f.name + "<br>");
                    }

                }

            }
        });
    }
}