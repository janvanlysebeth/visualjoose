Class("JooseX.IDE.framework.test.AbstractTestCase", {
    has: {
        runningTest: {is: 'rw'},
        successCallback: {is: 'rw'},
        failureCallback: {is: 'rw'},
        synchronousPartDone: {is: 'rw'},
        numberToMonitor: {is: 'rw'},
        numberMonitored: {is: 'rw'},
        timeoutID: {is: 'rw'}        
    },
        
    methods: {
        runTest: function(aTestMethodName, successCallback, failureCallback) {
            try {
                this.__reset();
                this.setSuccessCallback(successCallback);
                this.setFailureCallback(failureCallback);
                var self = this;
                this.__setTimeout();
                this[aTestMethodName].apply(this);
                this.setSynchronousPartDone(true);
                if((this.getNumberToMonitor() - this.getNumberMonitored()) == 0) {
                    this.__success();
                }
            } catch (ex) {
                this.__failure(ex);
            }
        },
        
        monitor: function(aFunction) {
            var self = this;
            this.setNumberToMonitor(this.getNumberToMonitor() + 1);
            return function() {
                try {
                    self.setNumberMonitored(self.getNumberMonitored() + 1);
                    aFunction.apply(this, arguments);
                    if((self.getNumberToMonitor() - self.getNumberMonitored()) == 0) {
                        self.__success.call(self);
                    }
                } catch (ex) {
                    self.__failure.call(self, ex);
                }
            };            
        },
        
        ok: function(value, message) {
            assert.ok.apply(null, arguments);
        },
        
        equal: function(actual, expected, message) {
            assert.equal.apply(null, arguments);
        },
        
        __reset: function() {
            this.setRunningTest(null);
            this.setSuccessCallback(null);
            this.setFailureCallback(null);
            this.setSynchronousPartDone(false);
            this.setNumberToMonitor(0);
            this.setNumberMonitored(0);  
        },
        
        __success: function() {
            this.__clearTimeout();
            this.getSuccessCallback().apply(this);
        },
        
        __failure: function(exception) {
            this.__clearTimeout();
            this.getFailureCallback().call(this, exception);
        },
        
        __setTimeout: function() {
            var self = this;
            this.setTimeoutID(
                JooseX.IDE.VJ.instance().getGlobalWindow().setTimeout(
                    function() {
                        self.setTimeoutID(null);
                        self.__failure.call(self, new Error("timed out"));
                    }, 10000));
        },
        
        __clearTimeout: function() {
            if(this.getTimeoutID()) {
                JooseX.IDE.VJ.instance().getGlobalWindow().clearTimeout(
                    this.getTimeoutID());
            }
        }
    }
});

Class("JooseX.IDE.framework.test.TestCaseRunner", {    
    methods: {
        runTest: function(aTestCaseClass, aTestMethodName) {         
            var tc = new aTestCaseClass();
            var resultWindow = JooseX.IDE.VJ.instance().getGlobalWindow().open();
            resultWindow.document.write('<html><head><title>Running testcase '
                + aTestCaseClass.meta.name + '.' + aTestMethodName
                +'</title></head><body></body></html>');
            tc.runTest(aTestMethodName,
                function() {
                    resultWindow.document.write('<html><head><title>Green light</title></head><body><p>:-)</p></body></html>');
                    resultWindow.document.bgColor = 'GREEN';
                    resultWindow.setTimeout(function() {resultWindow.close();}, 500);
                },
                function(exception) {
                    resultWindow.document.write('<html><head><title>Red light</title></head><body><p>:-(</p><pre>'
                        + exception.toString()
                        + '\n\nq'
                        + (JooseX.IDE.VJ.instance().getGlobalWindow().printStackTrace(exception)).join('\n')
                        +'</pre></body></html>');
                    resultWindow.document.bgColor = 'RED';
                    resultWindow.setTimeout(function() {resultWindow.close();}, 500);
                    answer = resultWindow.confirm('The test failed, do you want to debug it?');
                    if (answer) {
                        debugger;
                        tc.runTest(cm.getTitle());
                    }
                });
        }
    }
});
