Class("JooseX.IDE.test.TestTestCase", {
    isa: JooseX.IDE.framework.test.TestCase,
    methods: {
        testFail: function () {
            ok(false, "this is a failing test");
        },
        
        testPass: function () {
            ok(true, "this is a passing test");
        }
    }
});
