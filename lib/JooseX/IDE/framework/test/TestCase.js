Class("JooseX.IDE.framework.test.TestCase", {    
    methods: {
        runTest: function (aTestMethodName) {
            module(this.meta.name);
            test(aTestMethodName, this[aTestMethodName]);
            QUnit.start();
        }
    }
});
