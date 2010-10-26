Class("JooseX.IDE.framework.test.QUnitTestCase", {    
    methods: {
        runTest: function (aTestMethodName) {
            module(this.meta.name);
            var self = this;
            test(aTestMethodName, function() {
                self[aTestMethodName].apply(self);
            });
            QUnit.start();
            
            //todo: cleanup
            $('#qunitPanel').css('display', 'block');
        },
        
        ok: function () {
            QUnit.ok.apply(null, arguments);
        }
    }
});
