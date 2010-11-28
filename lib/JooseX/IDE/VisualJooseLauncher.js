Class("JooseX.IDE.VisualJooseLauncher", {
    isa: JooseX.IDE.framework.ApplicationModel,
    
    methods: {        
        registerEventHandlers: function() {
            this.$$('#openChangeLog').onclick = 
                this._eh(this.openChangeLog, false);
        },
        
        openFirstClassBrowser: function() {
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
            this.browserWindow = window;
            this.openFirstClassBrowser();
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
        openApplicationModel: function(anApplicationModel, onReadyCallback) {
            var aChildWindow = this.getGlobalWindow().open(anApplicationModel.my.url);
            this.getOpenApplications().push(anApplicationModel);
            var self = this; 
            aChildWindow.onload = function() {
                //all code should run in the global window
                self.executeInGlobalWindow(function() {
                    anApplicationModel.initializeInWindow(aChildWindow);
                    if(typeof onReadyCallback == 'function') {
                        onReadyCallback();
                    }
                });
            };  
        },
            
        executeInGlobalWindow: function(aFunction) {
            //all code should run in the global window
            this.getGlobalWindow().setTimeout(aFunction, 0);
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
