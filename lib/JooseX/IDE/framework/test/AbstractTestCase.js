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

Class("JooseX.IDE.TestTool", {
    isa: JooseX.IDE.framework.ApplicationModel,
    
    methods: {
        initializeInWindow: function(aBrowserWindow) {
            this.setBrowserWindow(aBrowserWindow);
        },
        
        
        runTest: function(aTestCaseClass, aTestMethodName) {
            var self = this;
            var tc = new aTestCaseClass();
            tc.runTest(aTestMethodName,
                function() { self.onSuccess.call(self);},
                function(exception) {self.onFailure.call(self, exception);});
        },
        
        onSuccess: function() {
            this.getDocument().bgColor = 'GREEN';
            this.__closeAfterMilliseconds(500);
        },
        
        onFailure: function(exception) {
            var stackTrace = exception.toString()
                + '\n\nq'
                + (JooseX.IDE.VJ.instance().getGlobalWindow().printStackTrace(exception)).join('\n');
            this.$('#result').html(stackTrace);
            this.getDocument().bgColor = 'RED';
            this.__closeAfterMilliseconds(500);
            answer = this.getBrowserWindow().confirm('The test failed, do you want to debug it?');
            if (answer) {
                debugger;
                //tc.runTest(cm.getTitle());
            }
        },
        
        __closeAfterMilliseconds: function(anInteger) {
            var self = this;
            JooseX.IDE.VJ.instance().getGlobalWindow().setTimeout(
                function() {self.close();}, anInteger);
        }
            
    }, 

    my: { 
        has: {
            url: {
                is: 'ro',
                init: function() {return "./test_tool.html"}
            }
        },
        
        methods: {
            runSingleTest: function(aTestCaseClass, aTestMethodName) {
                inst = this.open();
                inst.runTest(aTestCaseClass, aTestMethodName);
            }
        }
    }
});
