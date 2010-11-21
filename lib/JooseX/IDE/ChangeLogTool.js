Class("JooseX.IDE.ChangeLogTool", {
    isa: JooseX.IDE.framework.ApplicationModel,
    
    has: {        
        editor: {
            is: 'rw'
        }
    },
    
    methods: {
        BUILD: function(globalWindow) {
            return {window: globalWindow};
        },
        
        initializeInWindow: function(aWindow) {            
            this.setBrowserWindow(aWindow);
            this.initializeEditor(aWindow);
            this.registerEventHandlers();
            this.loadChanges();
        },
        
        initializeEditor: function() {
            this.editor = new CodeMirror(
                this.$('#JooseCBBody'), {
                parserfile: ["tokenizejavascript.js", "parsejavascript.js"],  
                path: "lib/CodeMirror/js/",
                stylesheet: "lib/CodeMirror/css/jscolors.css",
                height: "35em"
                });
        },
        
        registerEventHandlers: function() {
            this.$('#codeChangesSelect').onchange = this._eh(this.onCodeChangeSelected);
            this.$('#replayChangesAction').onclick = this._eh(this.doReplayChanges);
            this.$('#deleteChangesAction').onclick = this._eh(this.doDeleteChanges);
        },
        
        loadChanges: function() {
            var changes = (new JooseX.IDE.CodeChanges()).loadAllChanges();
            var select = this.$('#codeChangesSelect');
            var option; 
            var self = this;
            Joose.A.each(changes, function(aChange) {
                option = self.getDocument().createElement("option");
                option.setAttribute('id', aChange.id);
                option.innerHTML   = aChange.displayIdString();
                option.valueObject = aChange;
                select.appendChild(option);
            });
        },
        
        onCodeChangeSelected: function() {
            var selectedChange = this.selectedCodeChange();
            this.getEditor().setCode(selectedChange.getBody());
        },
        
        selectedCodeChange: function() {
            var select = this.$('#codeChangesSelect');
            if(select.selectedIndex < 0) return null;
            return select.options[select.selectedIndex].valueObject;
        }
    },  

    after: {    
        initialize: function(props) {
            var self = this;         
            var aChildWindow = props.window.open("./change_list.html");
            aChildWindow.onload = function() {
                //all code should run in the global window
                props.window.setTimeout(function() {
                    self.initializeInWindow(aChildWindow);
                }, 0);
            };
        }
    }
});
