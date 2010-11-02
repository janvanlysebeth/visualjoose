Class("JooseX.IDE.framework.test.AbstractTestCase", {    
    methods: {
        runTest: function (aTestMethodName) {            
            var self = this;
            self[aTestMethodName].apply(self);
        },
        
        ok: function (value, message) {
            assert.ok.apply(null, arguments);
        },
        
        equal: function (actual, expected, message) {
            assert.equal.apply(null, arguments);
        }
    }
});
