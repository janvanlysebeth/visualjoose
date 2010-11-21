Class("JooseX.IDE.VisualJooseLauncher", {
    isa: JooseX.IDE.framework.ApplicationModel,
    
    has: {
        globalWindow: {
            is: 'ro'
        },
        
        openApplications: {
            is: 'ro',
            init: function() {return []}
        }
    },
    
    methods: {
        BUILD: function(aBrowserWindow) {
            return {window: aBrowserWindow};
        },
        
        registerEventHandlers: function() {
            this.$('#openChangeLog').onclick = 
                this._eh(this.openChangeLog, false);
        },
        
        openFirstClassBrowser: function() {
          this.openApplications.push(
               JooseX.IDE.CBClassBrowser.my.open(this.getGlobalWindow()));  
        },
        
        openClassBrowser: function() {
        },
        
        openChangeLog: function() {
            var changeLogTool = new JooseX.IDE.ChangeLogTool(this.globalWindow);
            this.openApplications.push(changeLogTool);
            return changeLogTool;
        }
    },
    
    after: {
        initialize: function(props) {
            this.globalWindow = props.window;
            this.browserWindow = this.globalWindow;
            this.openFirstClassBrowser();
            this.registerEventHandlers();
        }
    }
});
