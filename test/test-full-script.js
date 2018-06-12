var fs = require('fs');
var test = require('tape');
var mark = require('../code-quality/indeni-js-support.js');
var valid = require('../code-quality/code-validation.js');
var sections = require('../code-quality/common.js')

test('test a full script where everything is good', function (t) {

    fs.readFile('./resources/full-script-happy-path.ind', "utf8", function (err, data) {
        console.log(data);

        functions = [];
        for(var f in valid.validationFuncs){
            functions.push(valid.validationFuncs[f])
        }
        
        t.equals(data, mark.marker(functions, data, sections.getScriptSections), "happy path");
        t.end();
    });
/*
    t.equals("test=me".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern)[0], "t=m", "test=me");

    t.ok("x=y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x=y");

    t.notOk("x = y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x = y");

    
*/
});