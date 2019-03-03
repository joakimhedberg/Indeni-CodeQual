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
    
    // regex first alternative -- most basic matches
    t.ok("x==y".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x==y");
    t.ok("x==".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x==");

    // regex second alternative -- most basic matches
    t.ok("x!".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "x!");

    // regex third alternative -- most basic matches
    t.ok("<x".match(valid.validationFuncs.comparisonOperatorNoSpace.pattern), "<x");

    
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

test('test ignoring certain patterns, spacing around comparison operators', function (t) {
    // test that we don't mark any problems with 'mistakes' in comments
    t.equals(valid.validationFuncs.comparisonOperatorNoSpace.mark("foo = !(condition)"), "foo = !(condition)", "foo = !(condition)");
    t.equals(valid.validationFuncs.comparisonOperatorNoSpace.mark("!/pattern/"), "!/pattern/", "!/pattern/");

    t.end();
});


test('test ignoring comments, spacing around comparison operators', function (t) {
    // test that we don't mark any problems with 'mistakes' in comments
    t.equals(valid.validationFuncs.comparisonOperatorNoSpace.mark("# x=y"), "# x=y", "# x=y");
    t.equals(valid.validationFuncs.comparisonOperatorNoSpace.mark("x = y # somecomment j=k"), "x = y # somecomment j=k", "x = y # somecomment j=k");
    t.equals(valid.validationFuncs.comparisonOperatorNoSpace.mark("    #somecomment x=y"), "    #somecomment x=y", "    #somecomment x=y");
    t.equals(valid.validationFuncs.comparisonOperatorNoSpace.mark("\t#somecomment x=y"), "\t#somecomment x=y", "\t#somecomment x=y");

    // make sure we match on the first bad part (x=y), but not the one in the comments (j=k).
    t.equals(valid.validationFuncs.comparisonOperatorNoSpace.mark("x=y  # somecomment j=k"), 
        "<span class = \"error\" title = \"The equals sign and other comparison operators should be followed by space.<br>Exceptions to this are regexp and bash scripts.\">x=y</span>  # somecomment j=k", 
        "x=y  # somecomment j=k");

    t.end();
});

test('test ignoring string manipulation functions', function (t) {
    // test that we don't mark any problems with 'mistakes' in string manipulation functions
    t.equals(valid.validationFuncs.comparisonOperatorNoSpace.mark("    split(line, toArray, \"=\")"), "    split(line, toArray, \"=\")", "    split(line, toArray, \"=\")");
    t.equals(valid.validationFuncs.comparisonOperatorNoSpace.mark("    gsub(\">\", \"<\", string, )"), "    gsub(\">\", \"<\", string, )", "    gsub(\">\", \"<\", string, )");
    t.equals(valid.validationFuncs.comparisonOperatorNoSpace.mark("    sub(\">\", \"<\", string, )"), "    sub(\">\", \"<\", string, )", "    sub(\">\", \"<\", string, )");
    t.equals(valid.validationFuncs.comparisonOperatorNoSpace.mark("    index(string, \"!~\")"), "    index(string, \"!~\")", "    index(string, \"!~\")");
    t.equals(valid.validationFuncs.comparisonOperatorNoSpace.mark("    match(string, \">=\")"), "    match(string, \">=\")", "    match(string, \">=\")");
    t.equals(valid.validationFuncs.comparisonOperatorNoSpace.mark("    join(array, \"=\")"), "    join(array, \"=\")", "    join(array, \"=\")");

    t.end();
});
