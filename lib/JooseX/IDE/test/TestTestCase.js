Class("JooseX.IDE.test.TestTestCase", {
    isa: JooseX.IDE.framework.test.AbstractTestCase,
    methods: {
        testFail: function () {
            this.ok(false, "this is a failing test");
        },
        
        testPass: function () {
            this.ok(true, "this is a passing test");
        }
    }
});
