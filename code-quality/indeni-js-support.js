'use strict';

var marker = function(testFunctions, fullScriptContent, getSections) {
    testFunctions.map(function(f){

        // For each executed section, mark the non-compliant content by replacing 
        // it with a span that has a non-compliance css class

        // Let's say we have a function that is applied to awk and yaml, in that case
        // the first round would contain type == "awk". 
        // Next step would be to verify that there actually is a section named "awk".
        // If there is, the content of the section will be replaced by the mark function.

        f.applyToSections.map(function(type){

            // Get the content of the sections in the script ("meta", "comments", "awk")
            var sections = getSections(fullScriptContent);

            for(var s in sections){

                if(sections[s].apply.indexOf(type) !== -1){

                    // Verify that the parsed sections contains the type
                    var sectionContent = sections[s].content;
                    fullScriptContent = fullScriptContent.replace(sectionContent, f.mark(sectionContent, getSections));

                }
            }
        });
    });

    return fullScriptContent;
};

// exports code validation functions if we're using node (for testing)
if (typeof(exports) !== 'undefined' && exports !== null)
{
    exports.marker = marker;
}
