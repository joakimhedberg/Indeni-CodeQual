var test = require('tape');
var valid = require('../code-quality/code-validation.js');

test('test matches camel case', function (t) {

    // tests that the regex actually matches what we expect
    t.equals("camelCase = 0".match(valid.validationFuncs.variableNamingConventions.pattern)[0], "camelCase", "camelCase = 0");
    t.equals("camelCaseLongerLonger = 0".match(valid.validationFuncs.variableNamingConventions.pattern)[0], "camelCaseLongerLonger", "camelCaseLongerLonger = 0");
    t.equals("camelCase".match(valid.validationFuncs.variableNamingConventions.pattern)[0], "camelCase", "camelCase");
    t.equals("camelCaseLongerLonger".match(valid.validationFuncs.variableNamingConventions.pattern)[0], "camelCaseLongerLonger", "camelCaseLongerLonger");
    t.equals("arrayVariable[index]".match(valid.validationFuncs.variableNamingConventions.pattern)[0], "arrayVariable", "arrayVariable[index]");
    
    t.end();
});

test('test we do not match things we do not want to', function (t) {

    // these test that we match nothing -- these are valid
    // TODO: t.notOk("4camelStartsWithNumber".match(valid.validationFuncs.variableNamingConventions.pattern), "4camelStartsWithNumber");
    t.notOk("snake_case_is_valid".match(valid.validationFuncs.variableNamingConventions.pattern), "snake_case_is_valid");
    t.notOk("\tsnake_case_is_valid".match(valid.validationFuncs.variableNamingConventions.pattern), "tabsnake_case_is_valid");
    t.notOk("    snake_case_is_valid = 0".match(valid.validationFuncs.variableNamingConventions.pattern), "    snake_case_is_valid = 0");
    //t.notOk("\"kebab-in-quotes\"".match(valid.validationFuncs.variableNamingConventions.pattern), "\"kebab-in-quotes\"");
    t.notOk("oneword".match(valid.validationFuncs.variableNamingConventions.pattern), "oneword");
    t.notOk("someValidFunction(some_param)".match(valid.validationFuncs.variableNamingConventions.pattern), "someValidFunction(some_param)");
    t.notOk("function someValidFunction (some_param) {".match(valid.validationFuncs.variableNamingConventions.pattern), "function someValidFunction (some_param) {");

    // exclusion tests -- test that these lines are ignored
    t.equals(valid.validationFuncs.variableNamingConventions.mark("# comment about kebab-case-thing"), "# comment about kebab-case-thing", "# comment about kebab-case-thing");
    t.equals(valid.validationFuncs.variableNamingConventions.mark("/pattern-match-kebab/"), "/pattern-match-kebab/", "/pattern-match-kebab/");
    
    t.end();
});

test('test matching kebab-case', function (t) {

    // special case tests for kebab-case -- using exclusions to handle this nasty case.
    t.equals(valid.validationFuncs.variableNamingConventions.mark("kebab-case = 0"), '<span class = "warning" title = "Most people use snake case (ie. my_variable) in the repository. This is a suggestion for you to do the same.">kebab-case</span> = 0', "kebab-case = 0");
    t.equals(valid.validationFuncs.variableNamingConventions.mark("kebab-case-longer-longer = 0"), '<span class = "warning" title = "Most people use snake case (ie. my_variable) in the repository. This is a suggestion for you to do the same.">kebab-case-longer-longer</span> = 0', "kebab-case-longer-longer = 0");
    t.equals(valid.validationFuncs.variableNamingConventions.mark("    match-me-please    "), '    <span class = "warning" title = "Most people use snake case (ie. my_variable) in the repository. This is a suggestion for you to do the same.">match-me-please</span>    ', "    match-me-please    ");
    t.equals(valid.validationFuncs.variableNamingConventions.mark('function("dont-match-me", match-me)'), 'function("dont-match-me", <span class = "warning" title = "Most people use snake case (ie. my_variable) in the repository. This is a suggestion for you to do the same.">match-me</span>)', 'function("dont-match-me", match-me)');
    t.equals(valid.validationFuncs.variableNamingConventions.mark('function(dont_match_me[match-me])'), 'function(dont_match_me[<span class = "warning" title = "Most people use snake case (ie. my_variable) in the repository. This is a suggestion for you to do the same.">match-me</span>])', 'function(dont_match_me[match-me])');
    t.equals(valid.validationFuncs.variableNamingConventions.mark("kebab-array[index]"), '<span class = "warning" title = "Most people use snake case (ie. my_variable) in the repository. This is a suggestion for you to do the same.">kebab-array</span>[index]', "kebab-array[index]");

    t.end();
});
