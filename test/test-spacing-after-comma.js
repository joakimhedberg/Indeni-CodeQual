var test = require('tape');
var valid = require('../code-quality/code-validation.js');

test('test space after comma', function (t) {

    // tests that the regex actually matches what we expect
    t.equals("\"cpu-usage\",tags,\"gauge\", 60, 80\"".match(valid.validationFuncs.commaWithoutSpace.pattern)[0], ",t", "\"cpu-usage\",tags,\"gauge\", 60, 80\"");

    // these just test that we match something -- invalid
    t.ok("\",test".match(valid.validationFuncs.commaWithoutSpace.pattern), ",t");
    t.ok("/,/,test".match(valid.validationFuncs.commaWithoutSpace.pattern), ",t");

    // these test that we match nothing -- these are valid
    t.notOk("/,/, test".match(valid.validationFuncs.commaWithoutSpace.pattern), "/,/, test");

    t.end();
});
