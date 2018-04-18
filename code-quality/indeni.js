// Bind the functions that controls that the tests should be executed upon keyup
// in the script text area

$(document).ready( function(){
    $("textarea#script-textarea").on("keyup onpaste", parseScriptSections);
    $("textarea#script-textarea").trigger("keyup");
    
    // Create the tippy tool tips
    tippy("button.notexecuted", {
        animation: "scale"
    });

});



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

function updateTestResultButtons() {

    // Check each function to see if it found a non-compliance in the code
    // Update the test results accordingly

    for(name in codeValidationFunctions){

        f = codeValidationFunctions[name];

        if(f.compliant && f.executed){    
            $("div#compliant").append("<button title = \"" + f.reason + "\" class=\"compliant\" id=\"" + name + "\">" + f.testName + "</button>");
        } else if (!f.compliant) {
            $("div#noncompliant").append("<button title = \"" + f.reason + "\" class=\"" + f.severity + "\" id=\"" + name + "\">" + f.testName + "</button>");
        } else {
            $("div#notexecuted").append("<button title = \"" + f.reason + "\" class=\"notexecuted\">" + f.testName + "</button>");
        }

    };

    // Add the show all button
    /*if ($("div#noncompliant button").length > 0){
        $("div#noncompliant").prepend("<button title = \"This button highlights all the non-compliances, it SHOULD work but could yield some unpredictable results due to content being changed by multiple parsings. \" class=\"show-all-noncompliances\" id=\"show-all-noncompliances\">Highlight all non-compliances</button>");
    }
    */
}

// Executes the functions in testFunctions
// Used as a an onClick event below

function executeAndMark (testFunctions){

    // Get the source script pasted by the user        
    var result = $("textarea#script-textarea").val();

    testFunctions.map(function(f){

        // For each executed section, mark the non-compliant content by replacing 
        // it with a span that has a non-compliance css class
        
        // Let's say we have a function that is applied to awk and yaml, in that case
        // the first round would contain type == "awk". 
        // Next step would be to verify that there actually is a section named "awk".
        // If there is, the content of the section will be replaced by the mark function.

        f.applyToSections.map(function(type){

            // Get the content of the sections in the script ("meta", "comments", "awk")
            var sections = getScriptSections(result);

            for(var s in sections){

                if(sections[s].apply.indexOf(type) !== -1){

                    // Verify that the parsed sections contains the type
                    var sectionContent = sections[s].content;
                    result = result.replace(sectionContent, f.mark(sectionContent));

                }
            }

        });

    })

    // Update the content of the result window
    $("pre#result-content").html(result);

    // Re-create the tippy tool tips
    tippy("span.error, span.warning, button", {
        animation: "scale"
    });

}

function setActiveTest (b){

    // Mark any active button as false
    $("div#noncompliant button[active = 'true']").attr("active", "false");
    b.attr("active", "true");
}


// Executes the test associated with a button and highlights the results in the results div
// Used as a an onClick event below

function testButtonClicked(){

    var button = $(this);
    setActiveTest(button);

    var buttonID = button.attr("id");

    // Get the function that matches the button
    var f = codeValidationFunctions[buttonID]

    executeAndMark([f]);
    
}

function markAllNonCompliances(){

    var button = $(this);
    setActiveTest(button);

    var functions = [];

    for(var f in codeValidationFunctions){
        functions.push(codeValidationFunctions[f])
    }

    executeAndMark(functions);

}


function parseScriptSections(){
    
    //Get the active button, if any
    var activeButton = $("div#noncompliant button[active = 'true']").attr("id")

    // Reset the test function properties and the test results
    resetApplication();

    // Get the sections
    var sections = getScriptSections($("textarea#script-textarea").val());

    // Run the tests
    validateSections(sections);

    // Generate the results
    updateTestResultButtons();

    // Create event handlers for the test result buttons
    var nonCompliantButtons = $("div#noncompliant button.error, div#noncompliant button.warning, div#noncompliant button.recommendation")
    
    nonCompliantButtons.on("click", testButtonClicked);
    //$("div#noncompliant button#show-all-noncompliances").on("click", markAllNonCompliances);
        
    // Trigger the first test if no test has been selected by the user
    if(activeButton === undefined){
        nonCompliantButtons.first().trigger("click");
    } else {
        $("div#noncompliant button#" + activeButton).trigger("click");
    }

}

function validateSections(sections){

    for (section in sections){
        
        // section could be ie. "awk" here
        // sectionContent is the content of the awk parser
        sectionContent = sections[section].content;
        
        // Loop through the codeValidationFunctions and run each one that
        // has ie. "awk" in the applyToSections array

        if(sectionContent !== ""){
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
                            console.log("Failed in section " + section);
                            console.log("Function:")
                            console.log(f);
                            console.log("Exception:")
                            console.log(e);
                            $("span#exceptions").append("Failed to execute " + f.name + "<br>");
                        }

                    }

                }
            });
        }
    }
}