Class('Test.Run.Result', {
    
    have : {
        description : null
    },
    
    
    methods : {
        
        toString : function () {
            return this.description
        }
        
    }
        
})
//eof Test.Run.Result

/**
 * @namespace Test.Run
 * @class Test.Run.Result
 * This class represent an abstract result of test execution
 * @author Nickolay (SamuraiJack) Platonov 
 * @version 0.01
 */

/**
 * @property description Description of the result
 * @type {String} 
 */

/**
 * Return string presentation of this result. Defaults to value of 'description' property
 * @method toString
 * @return {String} 
 */
;
Class('Test.Run.Result.Diagnostic', {
    
    isa : Test.Run.Result
    
})


/**
 * @namespace Test.Run.Result
 * @class Test.Run.Result.Diagnostic
 * @extends Test.Run.Result
 * This class represent a diagnostic message
 * @author Nickolay (SamuraiJack) Platonov 
 * @version 0.01
 */
;
Class('Test.Run.Result.Assertion', {
    
    isa : Test.Run.Result,
    

    have : {
        pass : null,
        
        indx : null
    },
    
    
    methods : {
        
        toString : function () {
            return (this.pass ? 'ok' : 'not ok') + ' ' + this.indx + ' - ' + this.description
        }
        
    }
        
})


/**
 * @namespace Test.Run.Result
 * @class Test.Run.Result.Assertion
 * @extends Test.Run.Result
 * This class represent an result of assertion testing
 * @author Nickolay (SamuraiJack) Platonov 
 * @version 0.01
 */

/**
 * @property pass Pass/fail sign
 * @type {Boolean} 
 */

/**
 * @property indx The index of this result in the results queue
 * @type {Number} 
 */

/**
 * Return TAP presentation of the assertion
 * @method toString
 * @return {String} 
 */
;
Class('Test.Run.Test', {
    
    have : {
        
        url : null,
        
        assertPlanned : null,
        assertCount : 0,
        
        diagCount : 0,
        
        passCount : 0,
        failCount : 0,
        
        results : null,
        
        run : null,
        
        harness : null,
        
        failed : false,
        failedException : null,
        
        startDate : null,
        execEnd : null,
        
        topScope : null,
        
        passThroughEx : false
    },
    
    
    after : {
    
        initialize : function (config) {
            if (typeof this.run != 'function') throw "The body of test absent"
            
            this.results = []
        }
        
    },
    
    
    methods : {
        
        toString : function() {
            return this.url
        },
        
        
        plan : function (value) {
            if (this.assertPlanned != null) throw "Test plan can't be changed"
            
            this.assertPlanned = value; 
        },
        
        
        addResult : function (result) {
            if (this.assertPlanned == null && this.assertCount) throw "Plan wasn't setuped"
            
            this.results.push(result)
            
            this.harness.testUpdate(this, result)
        },
        
        
        diag : function (desc) {
            this.diagCount++
            
            this.addResult(new Test.Run.Result.Diagnostic({
                description : desc
            }))
        },
        
        
        //XXX pass&fail should be more flexible and overridable (for TODO, SKIP, etc)
        pass : function (desc) {
            this.passCount++
            
            this.addResult(new Test.Run.Result.Assertion({
                pass : true,
                
                description : desc,
                
                indx : ++this.assertCount
            }))
        },
        
        
        fail : function (desc) {
            this.failCount++
            
            this.addResult(new Test.Run.Result.Assertion({
                pass : false,
                
                description : desc,
                
                indx : ++this.assertCount
            }))
        },
        
        
        ok : function (condition, desc) {
            if (condition) this.pass(desc); else this.fail(desc)
        },
        
        
        is : function (got, expected, desc) {
            this.ok(got == expected, desc)
        },

        
        start : function () {
            this.startDate = new Date()
            
            this.harness.testStart(this)
            
            var me = this
            var run = this.run
            
            var e = this.topScope.__EXCEPTION_CATCHER__(function(){
                run(me)
            })
            
            if (e) {
                this.failed = true
                this.failedException = e
                
                this.harness.testFail(this, e)
                
                this.finalize()
                
                if (this.passThroughEx) throw e
                
                return
            } 
            
            this.finalize()
        },
        
        
        finalize : function () {
            this.execEnd = new Date()
            
            this.harness.testEnd(this)
        },
        
        
        getSummaryMessage : function () {
            var res = []
            
            var passCount = this.passCount
            var failCount = this.failCount
            
            res.push('Passed: ' + passCount)
            res.push('Failed: ' + failCount)
            
            if (!this.failed) {
                if (failCount + passCount < this.assertPlanned) res.push('Looks like you planned ' + this.assertPlanned + ' tests, but ran only ' +  (failCount + passCount))
                if (failCount + passCount > this.assertPlanned) 
                    res.push('Looks like you planned ' + this.assertPlanned + ' tests, but ran ' +  (failCount + passCount - this.assertPlanned) + ' extra tests, ' + (failCount + passCount) + ' total.')
                
                if (passCount == this.assertPlanned && !failCount) res.push('All tests successfull')
            } else {
                res.push('Test suite threw an exception: ' + this.failedException)
            }
            
            return res
        },
        
        
        isPassed : function () {
            return !this.failed && !this.failCount && this.passCount >= this.assertPlanned
        }
        
    }
        
})
//eof Test.Run.Test


/**
 * @namespace Test.Run
 * @class Test.Run.Test
 * This class represent a single test file (group of assertions). <br><br>
 * Testing statements should be wrapped with the 'function' statement and this function should be passed to StartTest call.
 * The wrapper function will receive an instance of Test.Run.Test as a 1st argument. All assertion checks should be done as method calls on that instance.
 * For example: <pre>
<b>StartTest</b>(function(<b>t</b>){

    <b>t</b>.plan(4)
    
    <b>t</b>.diag('Starting..')
    
    <b>t</b>.pass('Just passed')
    
    <b>t</b>.ok(true, 'True is ok')
    
    <b>t</b>.is(2 * 2, 4, 'Math is still working')
    
    <b>t</b>.ok(String instanceof Object, 'String isa Object')
    
    ...
})
</pre>
 * Each test should have a plan - a planned number of assertions to test. Plan should be defined before any of assertions were checked. <br><br>
 * For additional types of assertions, please refer to {@link Test.Run.Test.More} and {@link Test.Run.Test.Browser} 
 * 
 * @author Nickolay (SamuraiJack) Platonov 
 * @version 0.01
 */
 

/**
 * @property url Url of the test file.
 * @type {String} 
 */


/**
 * @property assertPlanned Planned number of assertions to test.
 * @type {Number}
 */
 

/**
 * @property assertCount Current number of processed assertions
 * @type {Number}
 */


/**
 * @property diagCount Current number of processed diagnostic messages
 * @type {Number}
 */


/**
 * @property passCount Current number of passed assertions
 * @type {Number}
 */


/**
 * @property failCount Current number of failed assertions
 * @type {Number}
 */


/**
 * @property results Array of {@link Test.Run.Result} instances (represent either assertion or diagnostic message)
 * @type {Array}
 */


/**
 * @property run The function, which contain test statements (is invoking with StartTest)
 * @type {Function}
 */


/**
 * @property harness Reference to {@link Test.Run.Harness} (or subclass) instance, which reprsents the harness, under which the test is running
 * @type {Test.Run.Harness}
 */


/**
 * @property failed The sign whether the test has threw an exception 
 * @type {Boolean}
 */
      

/**
 * @property failedException Thrown exception (see also 'failed')
 * @type {Object}
 */


/**
 * @property startDate Timestamp of test starting time
 * @type {Date}
 */


/**
 * @property execEnd Timestamp of test finishing time
 * @type {Date}
 */


/**
 * @property topScope The top scope object in which test function was declared (usually an iframe in which test is running)
 * @type {Object}
 */


/**
 * @property passThroughEx The sign whether the test should re-throw any exceptions caught (useful for debugging with FireBug). Defaults to 'false' 
 * @type {Boolean}
 */


/**
 * This method setups test's plan. It should be called before any assertions were checked. The only parameter passed should be a number of planned assertions in this test file.
 * @method plan 
 * @param {Number} tests Planned number of assertions
 */


/**
 * Return string presentation of this test. Defaults to value of 'url' property
 * @method toString
 * @return {String} 
 */


/**
 * This method is 'protected' and should be used only for class extensions. 
 * This method adds the instance of {@link Test.Run.Result} to results queue. The result can be either assertion ({@link Test.Run.Result.Assertion}) 
 * or diagnostic message ({@link Test.Run.Result.Diagnostic})
 * @method addResult
 * @param {Test.Run.Result} result The result instance to add
 */


/**
 * This method add the diagnostic message into results queue. The actual presentation logic of the message is delegated to harness. 
 * @method diag
 * @param {String} desc The text of diagnostic message
 */


/**
 * This method add the passed assertion into results queue. The actual presentation logic of the passed assertion is delegated to harness. 
 * @method pass
 * @param {String} desc The text of the assertion
 */
        

/**
 * This method add the failed assertion into results queue. The actual presentation logic of the failed assertion is delegated to harness. 
 * @method fail
 * @param {String} desc The text of the assertion
 */
        

/**
 * This method add the passed or failed assertion into results queue. The type of assertion to add is determined from 1st argument.
 * @method ok
 * @param {Boolean} condition The boolean condition, indicating wheter assertions is passed or failed
 * @param {String} desc The text of the assertion
 */
        

/**
 * This method add the passed or failed assertion into results queue. The type of assertion to add is determined from comparison of 1st and 2nd arguments.
 * Comparison is performed with '==' operator
 * @method is
 * @param {Any} value1 The 1st value for comparison
 * @param {Any} value2 The 2st value for comparison
 * @param {String} desc The text of the assertion
 */
        
        
/**
 * This method is 'protected' and should be used only for class extensions.
 * This method starts the test execution. Execution is performing by running the function in the 'run' attribute.
 * @method start
 */

/**
 * This method is 'protected' and should be used only for class extensions.
 * This method is called when the test finished execution. It setup the 'execEnd' attribute
 * @method finalize
 */
        
/**
 * This method is 'protected' and should be used only for class extensions.
 * This method returns the summary message for this test. Should be called after the test has finished execution.
 * Summary message is returning in the array of strings
 * @method getSummaryMessage
 * @return {String[]} 
 */
        
/**
 * This method is 'protected' and should be used only for class extensions.
 * This method returns the sign whether the whole test passed or failed. The test is considered passed, when a) no exceptions were thrown,
 * b) there is no failing assertions c) the number of passed assertions is greater or equal to planned assertions number. 
 * @method isPassed
 * @return {Boolean} 
 */
        ;
Role('Test.Run.Test.More', {
    
    methods : {
        
        like : function (string, regex, desc) {
            if (regex instanceof RegExp) 
                this.ok(string.match(regex), desc)
            else
                this.ok(string.indexOf(regex) != -1, desc)
        },
        
        
        unlike : function(string, regex, desc) {
            if (regex instanceof RegExp) 
                this.ok(!string.match(regex), desc)
            else
                this.ok(string.indexOf(regex) == -1, desc)
        },        
        
        
        throws_ok : function(func, expected, desc) {
            if (typeof func != 'function') throw 'throws_ok accepts a function as 1st argument'
            
            var e = this.topScope.__EXCEPTION_CATCHER__(func)
            
            if (e instanceof this.topScope.Error)
                //IE uses non-standard 'description' property for error msg
                e = e.message || e.description
            
            this.like('' + e, expected, desc + ' (got [' + e + '], expected [' + expected + '])')
        }    
        
    }
        
})
//eof Test.Run.Test.More

Test.Run.Test.meta.extend({
    does : [ Test.Run.Test.More ]
})


/**
 * @namespace Test.Run.Test
 * @class Test.Run.Test.More
 * This class is actually a Role. Methods which are defined here a plugged into Test.Run.Test class.<br><br>
 * This role provides several additional assertion types, which can be used in tests.
 * Example: <pre>
StartTest(function(t){

    t.plan(3)
    
    t.diag('Starting..')
    
    t.like('this', /this/, 'Probably similar things')
    
    t.unlike('this', 'that', 'Unlikely..')
    
    t.throws_ok(function(){
        throw "Ups"
    }, /ups/i, 'Ups was thrown correctly')
    
    ...
})
</pre>
 * @author Nickolay (SamuraiJack) Platonov 
 * @version 0.01
 */
 
/**
 * This method add the passed or failed assertion into results queue. The type of assertion to add is determined from testing the 1st argument (which is expected to be a string)
 * against a regular expression, passed as 2nd argument
 * @method like
 * @param {String} string The string to test
 * @param {String|RegExp} regex The regex against which to test the string, can be also a plain string
 * @param {String} desc The text of the assertion
 */


/**
 * This method is the opposite of 'like' 
 * @method unlike
 * @param {String} string The string to test
 * @param {String|RegExp} regex The regex against which to test the string, can be also a plain string
 * @param {String} desc The text of the assertion
 */


/**
 * This method add the passed or failed assertion into results queue. The type of assertion to add is determined from the following:
 * The passed 'func' function is executing, and its expected to throw an exception. Then the exception object is stringified and passed to 'like' method along with 'expected' parameter.  
 * @method throws_ok
 * @param {Function} func The function to execute
 * @param {String|RegExp} expected The regex against which to test the stringified exception, can be also a plain string
 * @param {String} desc The text of the assertion
 */;
Class('Test.Run.Test.Browser', {
    
    isa : Test.Run.Test,
    
    have : {
        iframe : null,
        
        timeoutIds : null,
        
        finished : false
    },
    
    
    after : {
        
        initialize : function () {
            this.timeoutIds = {}
        }
        
    },
    
    
    methods : {
        
        beginAsync : function (time) {
            var me = this
            
            var timeoutId = this.topScope.setTimeout(function () {
                me.endAsync(timeoutId)
            }, time || 1e4)
            
            this.timeoutIds[timeoutId] = true
            
            return timeoutId
        },
        
        
        endAsync : function (timeoutId) {
            var counter = 0
            
            if (!timeoutId) Joose.O.each(this.timeoutIds, function (value, name) {
                timeoutId = name
                if (counter++) throw "Calls to endAsync without argument should only be performed if you have single beginAsync statement" 
            })
            
            this.topScope.clearTimeout(timeoutId)
            delete this.timeoutIds[timeoutId]
            
            if (this.finished) this.finalize()
        },
        
        
        finalize : function () {
            this.finished = true
            
            if (!Joose.O.isEmpty(this.timeoutIds)) return
            
            this.SUPER()
        }
        
    }
    
})
//eof Test.Run.Test.Browser

/**
 * @namespace Test.Run.Test
 * @class Test.Run.Test.Browser
 * @extends Test.Run.Test
 * This class represent a test file, which is supposed to be executed in browser. Thus it assumes the presence of setTimeout/clearTimeout 
 * functions and provides the ability of asynchornous testsing.<br><br>
 * 
 * Before testing assertions asynchronously, you need to obtain a timeoutId from the {@link #beginAsync} call. As the assertions were checked, the timeoutId should be
 * released with the {@link #endAsync} call.<br>
 * Test will not be finished until there are active timeouts. If the {@link #endAsync} was not called, it will called implicitly after the time interval, passed to the {@link #beginAsync},
 * will expire.<br><br>
 * Example: <pre>
StartTest(function(t){

    t.plan(1)
    
    t.diag('Starting..')
    
    var async1 = <b>t.beginAsync(3000)</b>
    
    Ext.Ajax.request({
        url: '/foo?bar=baz',
        
        success: function (response) {
            t.ok(response == 'response', 'Response is valid')
            
            <b>t.endAsync(async1)</b>
        },
    })

    
    ...
})
</pre>

 * @author Nickolay (SamuraiJack) Platonov 
 * @version 0.01
 */


/**
 * @property iframe The iframe in which this test is executing 
 * @type {DOMObject}
 */


/**
 * @property timeoutIds The hash which keep the timeout ids, generated by beginAsync call
 * @type {Object}
 */


/**
 * @property finished The sign whether this test has finished execution. Harness may be still notified, until there are active "asynchronous frames"
 * @type {Boolean}
 */


/**
 * This method starts the asynchronous testing. The test will not finished, until the specified time will finish 
 * @method beginAsync
 * @param {Number?} time The maximum number of milliseconds, which this "async frame" can last, defaults to 10000
 * @return {Number} The timeoutId, which can be used in endAsync call
 */


/**
 * This method finalize the "asynchronous frame" started with beginAsync.  
 * @method endAsync
 * @param {Number} timeoutId The timeoutId, returned by beginAsync call
 */


/**
 * This method is 'protected' and should be used only for class extensions.
 * This method is overriden to support beginAsync/endAsync calls
 * @method finalize
 */
;
Class('Test.Run.Harness', {
    
    my : {
        
        have : {
            testClass : Test.Run.Test,
            
            tests : null,
            
            passThroughEx : false,
            
            urls : null,
            testsGiven : 0
        },
        
        
        after : {
            
            initialize : function () {
                this.tests = []
                this.urls = {}
            }
        },
        
        
        methods : {
            
            testUpdate : function (test, result) {
            },
            
            
            testFail : function (test, exception) {
            },
            
            
            testStart : function (test) {
            },
            
            
            testEnd : function (test) {
                if (!this.isRunning()) this.testSuiteEnd()
            },
            
            
            testSuiteEnd : function () {
            },
            
            
            configure : function (config) {
                Joose.O.copy(config, this)
            },
            
            
            startTest : function (func, testClass, topScope) {
                var test = new (testClass || this.testClass)({
                    harness : this,
                    run : func,
                    topScope : topScope,
                    passThroughEx : this.passThroughEx
                })
                
                this.recordTest(test)
                
                test.start()
            },
            
            
            removeTest : function (test) {
                this.tests = Joose.A.remove(this.tests, test)
            },
            
            
            reRunTest : function (test) {
                this.removeTest(test)
            },
            
            
            reRunSuite : function () {
                Joose.A.each(this.tests, function (test) {
                    this.reRunTest(test)
                }, this)
            },
            
            
            recordTest : function (test) {
                this.tests.push(test)
            },
            
            
            start : function () {
                this.testSuiteStart()
                
                this.testsGiven = arguments.length
                
                Joose.A.each(arguments, function (url) {
                    this.processUrl(url)
                }, this)
                
                this.testSuiteProcessed()
            },
            
            
            testSuiteStart : function () {
                Test.Run.my.configure({
                    harness : this
                })
            },
            
            
            testSuiteProcessed : function () {
            },
            
            
            processUrl : function (url) {
                this.urls[url] = {}
            },
            
            
            isPassed : function () {
                var res = true
                
                Joose.A.each(this.tests, function (test) {
                    if (!test.isPassed()) res = false
                })
                
                return res
            },
            
            
            isRunning : function () {
                if (this.testsGiven != this.tests.length) return true
                
                var res = false
                
                Joose.A.each(this.tests, function (test) {
                    if (!test.execEnd) res = true
                })
                
                return res
            }
            
        }
        
    }
    //eof my
})
//eof Test.Run.Harness



/**
 * @namespace Test.Run
 * @class Test.Run.Harness
 * This class represent an abstract harness, which control the execution of several test files (test suite).
 * This class provides no UI, you should use one of it subclasses, for example {@link Test.Run.Harness.Browser.Multi}
 * @singleton
 * @author Nickolay (SamuraiJack) Platonov 
 * @version 0.01
 */


/**
 * @property testClass The test class which will be used for running tests, defaults to Test.Run.Test. 
 * @type {Class} 
 */


/**
 * @property tests The array of test instances
 * @type {Test.Run.Test[]} 
 */


/**
 * @property passThroughEx The sign whether the each test in suite should re-throw any exceptions caught (useful for debugging with FireBug). Defaults to 'false'
 * @type {Boolean} 
 */


/**
 * @property urls Hash of test files urls.
 * @type {Object} 
 */


/**
 * @property testsGiven The number of test files url, given in 'start'
 * @type {Number} 
 */


/**
 * This method is called each time the test in the test suite has been updated (new result appeared in results queue) 
 * @method testUpdate
 * @param {Test.Run.Test} test The test instance which was updated
 * @param {Test.Run.Result} result The results instance which was added
 */


/**
 * This method is called each time the test in the test suite has been failed (the exception was thrown) 
 * @method testFail
 * @param {Test.Run.Test} test The test instance which failed
 * @param {Object} result The thrown exception
 */


/**
 * This method is called each time the test in the test suite has been started 
 * @method testStart
 * @param {Test.Run.Test} test The test instance which started
 */


/**
 * This method is called each time the test in the test suite has been finished execution 
 * @method testEnd
 * @param {Test.Run.Test} test The test instance which finished
 */


/**
 * This method is called when the whole test suite has finished execution 
 * @method testSuiteEnd
 */


/**
 * This method configure the harness instance. It just copies the passed configuration option into instance.
 * @method configure
 * @param {Object} config The configuration options
 */


/**
 * This method starts the execution of a single test file.
 * @method startTest
 * @param {Function} func The function, which contain test statements. The instance of test will be passed to it as 1st argument  
 * @param {Class} testClass The class which should be used for instantiation of test (defaults to value of 'testClass' property)
 * @param {Object} topScope The top scope in which this test was declared
 */


/**
 * This method removes the test from harness. All necesery cleanup should be done here. 
 * @method removeTest
 * @param {Test.Run.Test} test The test instance being removed
 */


/**
 * This method re-runs a single test from harness.  
 * @method reRunTest
 * @param {Test.Run.Test} test The test instance being re-ran
 */


/**
 * This method re-runs a whole test suite.  
 * @method reRunSuite
 */


/**
 * This method records a test to internal structures.  
 * @method recordTest
 * @param {Test.Run.Test} test The test instance being recorded
 */


/**
 * This method starts a test suite  
 * @method start
 * @param {String*} url The variable number of test files urls
 */


/**
 * This method is called when the whole test suite has started execution 
 * @method testSuiteStart
 */


/**
 * This method is called when the whole test suite was processed. Note that at this point some tests may still running. See also 'testSuiteEnd'
 * @method testSuiteProcessed
 */


/**
 * This method process a single test file url.  
 * @method processUrl
 * @param {String} url The test file url
 */


/**
 * This method return 'true' if all tests in test suite were passed succefully, 'false' otherwise
 * @method isPassed
 * @return {Boolean}
 */


/**
 * This method return 'true' if there is any test in test suite which is still running, 'false' otherwise
 * @method isRunning
 * @return {Boolean}
 */
;
Class('Test.Run.Harness.Browser', {
    
    isa : Test.Run.Harness,
    
    my : {
        
        have : {
            testClass : Test.Run.Test.Browser,
            
            title : null,
            
            disableCaching : true,
            
            isIE : /msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent),
            
            baseUrl : window.location.href.replace(/\?.*$/,'').replace(/\/[^/]*$/, '/'),
            baseHost : window.location.host,
            baseProtocol : window.location.protocol,
            
            preload : null,
            
            componentsExpanded : false
        },
        
        
        after : {
        
            recordTest : function (test) {
                Joose.O.each(this.urls, function (value, url) {
                    
                    if (value.iframe.contentWindow == test.topScope) {
                        test.iframe = value.iframe
                        test.url = url
                        
                        value.test = test
                    }
                })
            },
            
            
            reRunTest : function (test) {
                this.processUrl(test.url)
            }
            
        },
        
        
        before : {
            
            start : function () {
                if (!this.preload && window.COMPONENTS) this.setPreloadFromTaskName('core')
                
                this.preload = this.expandPreload(this.preload)
            },
            
            
            configure : function (config) {
                var browser = /browser=(.+)/.exec(window.location.search)
                
                if (browser) {
                    Test.Run.Harness.Browser.meta.extend({
                        does : [ Test.Run.Harness.Browser.Proven ]
                    });
                    
                    config.browser = browser[1]
                }
                
                if (typeof config.preload == 'string') {
                    this.setPreloadFromTaskName(config.preload)
                    delete config.preload
                }
            },
            
            
            removeTest : function (test) {
                var url = test.url
                
                document.body.removeChild(test.iframe)
                
                delete this.urls[url].iframe
                delete this.urls[url].test
                delete test.iframe
            }
            
        },
        
        
        methods : {
            
            expandComponents : function () {
                if (this.componentsExpanded || !window.COMPONENTS) return
                
                Joose.O.each(COMPONENTS, function (components, taskName) {
                    var res = []
                    
                    Joose.A.each(components, function (comp) {
                        var match = /^\+(.+)/.exec(comp)
                        
                        res = res.concat(match ? COMPONENTS[match[1]] : comp)
                    })
                    
                    COMPONENTS[taskName] = res
                })
                
                this.componentsExpanded = true
            },
            
            
            setPreloadFromTaskName : function (taskName) {
                this.preload = COMPONENTS[taskName]
            },
            
            
            expandPreload : function (preload) {
                this.expandComponents()
                
                var expanded = []
                
                Joose.A.each(preload, function (comp) {
                    var match
                    
                    if (typeof comp == 'object' || /\.js$/.test(comp))
                        expanded.push(comp)
                    else if (match = /^\+(.+)/.exec(comp))
                        expanded = expanded.concat(this.expandPreload(COMPONENTS[match[1]]))
                    else
                        expanded.push('../lib/' + comp.split('.').join('/') + '.js')
                }, this)
                
                return expanded
            },
            
            
            startTest : function (func, testClass, topScope) {
                if (window.parent && window.parent.Test && window.parent.Test != Test) {
                    Test = window.parent.Test
                    Test.run.start(func, testClass, topsScope)
                    return
                }
                this.SUPERARG(arguments)
            },            
            
            
            //webkit bug - base urls for iframes are broken
            //https://bugs.webkit.org/show_bug.cgi?id=13364
            resolveUrl : function (url, onlyResolve) {
                var resolved
                
                if (!/^http/.test(url))
                    if (!/^\//.test(url))
                        resolved = this.baseUrl + url
                    else
                        resolved = this.baseProtocol + '//' + this.baseHost + url
                
                if (this.disableCaching && !onlyResolve) resolved += '?disableCaching=' + new Date().getTime()
                
                return resolved
            },
            
            
            processUrl : function (url) {
                this.SUPER(url)
                
                var me = this
                
                var resolved = this.resolveUrl(url)
                
                var iframe = document.createElement('iframe')
                //pointing to non-existed file, to satisfy same-origin policy
                //of course IE foollows its own way
                iframe.src = this.isIE ? this.baseProtocol + '//' + this.baseHost : this.resolveUrl('dummyFile.js', true)
                
                
                iframe.onload = iframe.onreadystatechange = function () {
                    if (!iframe.readyState || iframe.readyState == "complete" || iframe.readyState == "loaded") me.setupIframe(iframe, resolved) 
                }
                
                this.customizeIframe(iframe)
                
                document.body.appendChild(iframe)
                
                this.urls[url].iframe = iframe
            },
            
            
            customizeIframe : function (iframe) {
            },
            
            
            setupIframe : function (iframe, resolvedUrl) {
                var me = this
                
                var urlCopy = resolvedUrl.replace(/\?.*$/,'')
                
                if (/\.js$/.test(urlCopy)) 
                    this.finalizeUrl(iframe, resolvedUrl)
                else
                    if (/\.html$/.test(urlCopy)) 
                        iframe.src = resolvedUrl
                    else
                        throw "Unknow url type: [" + resolvedUrl + "]"
            },
            
            
            finalizeUrl : function (iframe, resolvedUrl) {
                var ifrWindow = iframe.contentWindow
                var ifrDoc = ifrWindow.document
                var ifrHead = ifrDoc.body
                
                var scriptTags = []
                
                
                if (this.preload) Joose.A.each(this.preload, function (preloadUrl) {
                    if (typeof preloadUrl == 'object') {
                        scriptTags.push([ preloadUrl.text, null, null, ifrDoc ])
                    } else {
                        preloadUrl = this.resolveUrl(preloadUrl)
                        
                        scriptTags.push([ null, preloadUrl, null, ifrDoc ])
                    }
                }, this)
                    
                scriptTags.push([
                    'StartTest = function(testFunc, testClass) { window.parent.Test.Run.my.start(testFunc, testClass, this) }; ' +
                    '__EXCEPTION_CATCHER__ = function (func) { var ex; try { func() } catch (e) { ex = e; }; return ex; };',
                    null, 
                    null, 
                    ifrDoc
                ])
                
                scriptTags.push([ null, resolvedUrl, null, ifrDoc ])
                
                this.processScripTagQueue(ifrHead, scriptTags)
            },
            
            
            processScripTagQueue : function (ifrHead, queue) {
                if (queue.length) {
                    var params = queue.shift()
                    
                    //no text - loading via 'src'
                    if (!params[0]) {
                        var me = this
                        params[2] = function () {
                            me.processScripTagQueue(ifrHead, queue)
                        }
                    }
                    
                    ifrHead.appendChild(this.createScriptTag.apply(this, params))
                    
                    //have text - need to process further manually
                    if (params[0]) this.processScripTagQueue(ifrHead, queue)
                }
            },
            
            
            createScriptTag : function (text, url, onload, doc) {
                var node = (doc || document).createElement("script")
                
                node.setAttribute("type", "text/javascript")
                
                if (url) node.setAttribute("src", url)
                
                if (text) node.text = text
                
                if (onload) node.onload = node.onreadystatechange = function() {
                    if (!node.readyState || node.readyState == "loaded" || node.readyState == "complete" || node.readyState == 4 && node.status == 200)
                        //surely for IE6..
                        setTimeout(onload, 1)
                }
                
                return node
            }
            
        }
        
    }
    //eof my
})
//eof Test.Run.Harness.Browser



/**
 * @namespace Test.Run.Harness
 * @class Test.Run.Harness.Browser
 * @extends Test.Run.Harness
 * This class represent a harness, which is running into browser. This class provides no UI, you should use one of it subclasses, for example {@link Test.Run.Harness.Browser.Multi}
 * @singleton
 * @author Nickolay (SamuraiJack) Platonov 
 * @version 0.01
 */


/**
 * @property testClass The test class which will be used for running tests, defaults is redefined to Test.Run.Test.Browser. 
 * @type {Class} 
 */


/**
 * @property title The title of the test suite 
 * @type {String} 
 */
            
            
/**
 * @property disableCaching The sign whether the harness should surpress the browser caching for each loading operation. Defaults to 'true' 
 * @type {Boolean} 
 */


/**
 * @property isIE 'true' if running under MS IE. 
 * @type {Boolean} 
 */

            
/**
 * @property baseUrl Base url of harness file. 
 * @type {String} 
 */


/**
 * @property baseHost Base host of harness file. 
 * @type {String} 
 */


/**
 * @property baseProtocol Protocol of base url. 
 * @type {String} 
 */


/**
 * @property preload The array which contain information about which files should be preloaded into each test's iframe. See also {@link #expandPreload} 
 * @type {String[]} 
 */


/**
 * This method initialize the 'iframe' and 'url' properties of test instance. It is actually an 'after' modifier.  
 * @method recordTest
 * @param {Test.Run.Test} test The test instance being recorded
 */


/**
 * This method re-runs a single test from harness. It is actually an 'after' modifier.
 * @method reRunTest
 * @param {Test.Run.Test} test The test instance being re-ran
 */



/**
 * This method preprocess the 'preload' property, with call to 'expandPreload'. It is actually a 'before' modifier.
 * @method start
 * @param {String*} url The variable number of test files urls
 */


/**
 * This method checks if the harness files is opened with 'browser' parameter in URL. If so - it applies additional Test.Run.Harness.Browser.Proven role,
 * which implements the reporting behaviour for JSAN::Prove.
 * This method also allows to specify the 'preload' property value as a string. In this case, it will be used as a parameter in call to 'setPreloadFromTaskName' method.
 * It is actually a 'before' modifier.
 * @method configure
 * @param {Object} config The configuration options
 */


/**
 * This method performs additional cleanup during removing of test (notably, removing the iframe's DOM element ). 
 * @method removeTest
 * @param {Test.Run.Test} test The test instance being removed
 */


/**
 * This method expands the global COMPONENTS specification. Each component, which starts with '+' is replaced with the corresponding components sequence.  
 * @method expandComponents
 */


/**
 * This method initialize the preloading sequence with the COMPONENTS sequence of the given name 
 * @method setPreloadFromTaskName
 * @param {String} taskName The name of components sequence
 */


/**
 * This method expands the given preloading sequence by following rules:<br>
 * 1. All entries starting with '+' are replaced with corresponding components sequences<br>
 * 2. If the component entry represent a class name (for example : Test.Run.Test) it is converting to the url, like "../lib/Test/Run/Test.js"<br>
 * 3. If the component entry ends with ".js", its supposed to be the url and is passing without modifications.<br>
 * Note, that original preloading sequnce is not modified, method returns a new array. 
 * @method expandPreload
 * @param {String[]} preload The preload sequence to expand
 * @return {String[]} expanded preload sequence
 */


/**
 * This method checks if there is parent window, and a Test.Run instance in it. If it was detected, method call is delegated to that instance in parent window.
 * This is intended to support tests in *.html files, which may accidentally include a copy of Test.Run. 
 * @method startTest
 * @param {Function} func The function, which contain test statements. The instance of test will be passed to it as 1st argument  
 * @param {Class} testClass The class which should be used for instantiation of test (defaults to value of 'testClass' property)
 * @param {Object} topScope The top scope in which this test was declared
 */


/**
 * This method returns the absolutized URL. "Absolutization" is performing against 'baseUrl' property. As an addition, if 'onlyResolve' parameter is 'false' or not passed
 * and 'disableCaching' is set to 'true', the url will be appended with 'disableCaching' parameter. 
 * @method resolveUrl
 * @param {String} url The url to resolve  
 * @param {Boolean} onlyResolve The sign, whether the url should be strictly only absolutized and not appended with disableCaching parameter
 */



/**
 * This method creates an iframe for passed url.  
 * @method processUrl
 * @param {String} url The test file url
 */


/**
 * This method is called before appending the created iframe into DOM. Its intented for overloading in custom classes and performing additional customization of the iframe.  
 * @method customizeIframe
 * @param {DOMObject} iframe The iframe being customizing
 */


/**
 * This method creates a script tag, with the given behaviour. 
 * @method createScriptTag
 * @param {String} text The textual content of the tag  
 * @param {String} url The url, which will be used as value for 'src' attribute
 * @param {Function} onload The 'onload' callback
 * @param {DOMObject} doc Optional 'document' which will be used as "element generator". Defaults to 'document' in the global scope. 
 * @return {DOMObject} Created <script> tag 
 */
;
Class('Test.Run.Harness.Browser.Single', {
    
    isa : Test.Run.Harness.Browser,
    
    my : {
        
        after : {
        
            testUpdate : function (test, result) {
                this.print(result)
            },
            
            
            testFail : function (test, exception) {
                this.print('Test threw an exception: ' + exception)
            },
            
            
            testEnd : function (test) {
                this.print(test.getSummaryMessage().join('<br>')); 
            }
        },

        
        methods : {
            
            print : function (text) {
                var div = document.createElement('div')
                div.innerHTML = text
                document.body.appendChild(div)
            }
            
        }
        
    }
    //eof my
})
//eof Test.Run.Harness.Browser.Single;
Role('Test.Run.Harness.Browser.Proven', {
    
    my : {
        
        have : {
            browser : null
        },
        
        after : {
            
//          testStart : function (test) {
//          },
//            
//            
//          testUpdate : function (test, result) {
//          },
//            
//            
//          testFail : function (test, exception) {
//          },
//
//            
//          testEnd : function (test) {
//          },
            
            
            testSuiteEnd : function () {
                var req = new JooseX.SimpleRequest()
                var provenUrl = '/proven/' + this.browser + '/' + (this.isPassed() ? 'pass' : 'fail')
                
                try {
                    req.getText(this.resolveUrl(provenUrl))
                } catch (e) {
                }
            }
            
        }
        
    }
    //eof my
})
//eof Test.Run.Harness.Browser.Proven;
Class('Test.Run', {
    
    my : {
        
        have : {
            harness : null
        },
        
        
        methods : {
            
            configure : function (config) {
                Joose.O.copy(config, this)
            },
            
            
            start : function (testFunc, testClass, topScope) {
                (this.harness || Test.Run.Harness.Browser.Single.my).startTest(testFunc, testClass, topScope)
            }
            
        }
        
    }
    //eof my
})
//eof Test.Run


//starter, which also capture the top scope - it will be re-defined in Test.Run.Harness.Browser
StartTest = function (testFunc, testClass) {
    Test.Run.my.start(testFunc, testClass, this)
}

__EXCEPTION_CATCHER__ = function (func) { var ex; try { func() } catch (e) { ex = e; }; return ex; }


/**
 * @namespace Test
 * @class Test.Run
 * 
 * Yet Another JavaScript Testing Platform, based on <a href="http://en.wikipedia.org/wiki/Test_Anything_Protocol">TAP</a>.<br><br>
 * Platform is written on Ext 3.0 <a href="http://extjs.com/forum/showthread.php?t=55968">bridged</a> to Joose.<br><br>
 * 
 * Platform is written as <a href="http://openjsan.org/">JSAN</a> distribution. For installation information please refer to this 
 * <a href="http://groups.google.com/group/jsan/browse_thread/thread/ee21fd9269ff1572">post</a>.<br><br>
 * 
 * Demo links: <br>
 * <a href="http://jsan.symbie.org/test.run/demo/multi.html">Simple test suite</a><br>
 * <a href="http://jsan.symbie.org/Joose3/mutability/t/">Joose test suite</a><br><br>
 * 
 * This class just stores the information about currently using harness, it should not be used directly. Instead use one of the harness classes, for example
 * {@link Test.Run.Harness.Browser.Multi}
 * 
 * @singleton
 * @author Nickolay (SamuraiJack) Platonov 
 * @version 0.01
 */


/**
 * @property harness Reference to {@link Test.Run.Harness} (or subclass) instance, which reprsents the current harness, to which all test launches will be redirected
 * defaults to {@link Test.Run.Harness.Browser.Single}
 * @type {Test.Run.Harness}
 */


/**
 * This method configures the Test.Run instance. It just copies the passed configuration option into instance.
 * @method configure
 * @param {Object} config The configuration options
 */


/**
 * This method starts the execution of a single test file, via delegatin to 'starTest' method of current harness.
 * @method start
 * @param {Function} func The function, which contain test statements. The instance of {@link Test.Run.Test} will be passed to it as 1st argument  
 * @param {Class} testClass The class which should be used for instantiation of test
 * @param {Object} topScope The top scope in which this test was declared
 */
;
