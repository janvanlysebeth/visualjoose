Class("JooseX.IDE.VisualJooseLauncher", {
    isa: JooseX.IDE.framework.ApplicationModel,
    
    methods: {        
        registerEventHandlers: function() {
            this.$$('#openChangeLog').onclick = 
                this._eh(this.openChangeLog, false);
        },
        
        __openFirstClassBrowser: function() {
          var inst = new JooseX.IDE.CBClassBrowser();
          inst.initializeInWindow(window);
          JooseX.IDE.VJ.instance().getOpenApplications().push(inst);  
        },
        
        openChangeLog: function() {
            return JooseX.IDE.ChangeLogTool.my.open();
        }
    },
    
    after: {
        initialize: function(props) {
            this.browserWindow = JooseX.IDE.VJ.instance().getGlobalWindow();
            this.__openFirstClassBrowser();
            this.registerEventHandlers();
        }
    }
});

Class("JooseX.IDE.VJ", {
    has: {
        globalWindow: {
            is: 'ro',
            init: function() {
                return window;
            }
        },
        launcher: {is: 'ro',},
        codeChanges: {is: 'ro'},        
        openApplications: {
            is: 'ro',
            init: function() {return []}
        }
    },
    
    methods: {        
        openApplicationModel: function(anApplicationModel, onReadyCallback, onFailureCallback) {
            var aChildWindow = this.getGlobalWindow().open(anApplicationModel.my.url);
            this.getOpenApplications().push(anApplicationModel);
            var self = this;
            if (onFailureCallback) {
                aChildWindow.onerror = function () {
                    var msg = [];
                    msg.push('uncaught exception:');
                    for(var i = 0; i < arguments.length; i++) {
                        msg.push(arguments[i]);
                    }
                    onFailureCallback.call(null, new Error(msg.join('\n')));
                }
            }
            aChildWindow.onload = function() {
                //all code should run in the global window
                //self.executeInGlobalWindow(function() {
                    anApplicationModel.initializeInWindow(aChildWindow);
                    if(typeof onReadyCallback == 'function') {
                        onReadyCallback();
                    }
                //});
            };  
        },
        
        toSource: function(anObject) {
            // thanks to http://blog.stchur.com/2007/04/06/serializing-objects-in-javascript/
            // Let Gecko browsers do this the easy way
            if (typeof anObject.toSource !== 'undefined' && typeof anObject.callee === 'undefined')
            {
               return anObject.toSource();
            }
            
            // Other browsers must do it the hard way
            switch (typeof anObject)
            {
                // numbers, booleans, and functions are trivial:
                // just return the object itself since its default .toString()
                // gives us exactly what we want
                case 'number':
                case 'boolean':
                case 'function':
                   return anObject;
                   break;
          
                // for JSON format, strings need to be wrapped in quotes
                case 'string':
                   return '\'' + anObject + '\'';
                   break;
          
                case 'object':
                   var str;
                   if (anObject.constructor === Array || typeof anObject.callee !== 'undefined')
                   {
                      str = '[';
                      var i, len = anObject.length;
                      for (i = 0; i < len-1; i++) { str += serialize(anObject[i]) + ','; }
                      str += serialize(anObject[i]) + ']';
                   }
                   else
                   {
                      str = '{';
                      var key;
                      for (key in anObject) { str += key + ':' + serialize(anObject[key]) + ','; }
                      str = str.replace(/\,$/, '') + '}';
                   }
                   return str;
                   break;
          
                default:
                   return 'UNKNOWN';
                   break;
            }
        }
    },
    
    my: {
        has: {
            _singleton: {is: 'rw'}
        },
        
        methods: {
            instance: function() {
                /* important: to avoid initialization loops the VJ instance
                    is assigned as soon as possible */
                if (this._singleton == null) {
                    this._singleton = new JooseX.IDE.VJ();
                    this._singleton.launcher = new JooseX.IDE.VisualJooseLauncher();
                    this._singleton.codeChanges = new JooseX.IDE.CodeChanges();
                }
                return this._singleton;
            },
            
            start: function() {
                this.instance();
            }
        }
    }
});
