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
                this.$$('#JooseCBBody'), {
                parserfile: ["tokenizejavascript.js", "parsejavascript.js"],  
                path: "lib/CodeMirror/js/",
                stylesheet: "lib/CodeMirror/css/jscolors.css",
                height: "35em"
                });
        },
        
        registerEventHandlers: function() {
            this.$$('#codeChangesSelect').onchange = this._eh(this.onCodeChangeSelected);
            this.$$('#replayChangesAction').onclick = this._eh(this.doReplayChanges);
            this.$$('#deleteChangesAction').onclick = this._eh(this.doDeleteChanges);
        },
        
        loadChanges: function() {
            var changes = (new JooseX.IDE.CodeChanges()).loadAllChanges();
            var select = this.$$('#codeChangesSelect');
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
            var selectedOptions = this.$('#codeChangesSelect :selected');
            var newCode = '';
            if(selectedOptions.length == 1) {
                newCode = selectedOptions[0].valueObject.body;
            } 
            this.getEditor().setCode(newCode);
        },
        
        selectedCodeChanges: function() {
            return this.selectedCodeChangeOptions().map(function() {
                return this.valueObject;
            }).get();
        },
        
        selectedCodeChangeOptions: function() {
            return this.$('#codeChangesSelect :selected')
        },
        
        doDeleteChanges: function() {
            var ids = Joose.A.map(this.selectedCodeChanges(), function(aCodeChange) {
                return aCodeChange.id;
            });
            (new JooseX.IDE.CodeChanges()).deleteChangesByIds(ids);
            this.selectedCodeChangeOptions().remove();
        },
        
        doReplayChanges: function() {
            Joose.A.map(this.selectedCodeChanges(), function(aCodeChange) {
                aCodeChange.basicExecute();
            });
        }
    },  

    my: { 
        has: {
            url: {
                is: 'ro',
                init: function() {return "./change_list.html"}
            }
        }
    }
});
