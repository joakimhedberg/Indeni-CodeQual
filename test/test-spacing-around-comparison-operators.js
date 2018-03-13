var test = require('tape');
var valid = require('../code-quality/code-validation.js');

test('test comparison operators without spaces', function (t) {

    // tests that the regex actually matches what we expect
    t.equals("test=me".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern)[0], "t=m", "test=me");
    t.equals("test==me".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern)[0], "t==m", "test==me");

    // these just test that we match something -- invalid
    t.ok("x=y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x=y");
    t.ok("x= y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x= y");
    t.ok("x =y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x =y");
    t.ok("x>y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x>y");
    t.ok("x> y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x> y");
    t.ok("x >y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x >y");
    t.ok("x<y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x<y");
    t.ok("x< y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x< y");
    t.ok("x <y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x <y");
    t.ok("x~y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x~y");
    t.ok("x~ y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x~ y");
    t.ok("x ~y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x ~y");
    t.ok("x==y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x==y");
    t.ok("x== y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x== y");
    t.ok("x ==y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x ==y");
    t.ok("x!=y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x!=y");
    t.ok("x !=y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x !=y");
    t.ok("x!= y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x!= y");
    t.ok("x>=y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x>=y");
    t.ok("x >=y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x >=y");
    t.ok("x>= y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x>= y");
    t.ok("x<=y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x<=y");
    t.ok("x <=y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x <=y");
    t.ok("x<= y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x<= y");
    t.ok("x!~y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x!~y");
    t.ok("x !~y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x !~y");
    t.ok("x!~ y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x!~ y");

    
    // these test that we match nothing -- these are valid
    t.notOk("x = y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x = y");
    t.notOk("x > y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x > y");
    t.notOk("x < y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x < y");
    t.notOk("x ~ y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x ~ y");
    t.notOk("x != y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x != y");
    t.notOk("x == y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x == y");
    t.notOk("x >= y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x >= y");
    t.notOk("x <= y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x <= y");
    t.notOk("x !~ y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x !~ y");

    t.end();
});