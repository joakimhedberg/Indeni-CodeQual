var test = require('tape');
var valid = require('../code-validation.js');

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

test('test ignoring comments, space after comma', function (t) {
    // test that we don't mark any problems with 'mistakes' in comments
    t.equals(valid.validationFuncs.commaWithoutSpace.mark("# func(x,y)"), "# func(x,y)", "# func(x,y)");
    t.equals(valid.validationFuncs.commaWithoutSpace.mark("func(x, y) # somecomment j,k"), "func(x, y) # somecomment j,k", "func(x, y) # somecomment j,k");
    t.equals(valid.validationFuncs.commaWithoutSpace.mark("    #somecomment x,y"), "    #somecomment x,y", "    #somecomment x,y");
    t.equals(valid.validationFuncs.commaWithoutSpace.mark("\t#somecomment x,y"), "\t#somecomment x,y", "\t#somecomment x,y");

    // make sure we match on the first bad part (x,y), but not the one in the comments (j,k).
    t.equals(valid.validationFuncs.commaWithoutSpace.mark("func(x,y)  # somecomment j,k"),
        "func(x<span class = \"error\" title = \"Commas signs should be followed by space.<br>Exceptions to this are regexp and bash scripts.\">,y</span>)  # somecomment j,k",
        "func(x,y)  # somecomment j,k");

    t.end();
});
