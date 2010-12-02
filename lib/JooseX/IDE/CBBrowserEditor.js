Class("JooseX.IDE.CBBrowserEditor", {
    isa: JooseX.IDE.framework.ApplicationModel,
    
    has: {
        codeModel: {is: 'rw'},        
        titleEditor: {is: 'rw'},
        bodyEditor: {is: 'rw'}
    },
    
    methods: {
        initializeInWindow: function(aWindow) {
            this.setBrowserWindow(aWindow);
            this.initializeTitleEditorOn(this.$$("#JooseCBTitle"));
            this.initializeBodyEditorOn(this.$$("#JooseCBBody"));
        },
        
        initializeTitleEditorOn: function(aDOMNode) {
            this.titleEditor = new CodeMirror(aDOMNode, {
                parserfile: ["parsedummy.js"],
                path: "lib/CodeMirror/js/",
                stylesheet: "lib/CodeMirror/css/jscolors.css",
                height: "2em"});
        },
        
        initializeBodyEditorOn: function(aDOMNode) {
            var self = this;
            this.bodyEditor = new CodeMirror(aDOMNode, {
                parserfile: ["tokenizejavascript.js", "parsejavascript.js"],  
                path: "lib/CodeMirror/js/",
                stylesheet: "lib/CodeMirror/css/jscolors.css",
                height: "35em",
                saveFunction: function() {
                    self.saveBody();
                },
                initCallback: function() {
                    //TODO: design command infrastructure to replace this
                    self.bodyEditor.grabKeys(
                        function() {
                            var cm = self.getCodeModel();
                            if(cm.meta.name == "JooseX.IDE.CBMethodCodeModel"
                                    && cm.clazz.meta.isa(JooseX.IDE.framework.test.AbstractTestCase)
                                    && cm.method.name.indexOf('test') === 0) {
                                JooseX.IDE.TestTool.runSingleTest(
                                    cm.clazz, cm.getTitle());                                
                            }
                        },
                        function(keyCode) {
                            return keyCode == 113 /* F2 */});
                }
            });
        },
        
        getBody: function () {
            return this.getBodyEditor().getCode();
        },
        
        setBody: function (aString) {
            this.getBodyEditor().setCode(aString || "");
        },
        
        clearBody: function () {
            this.getBodyEditor().setCode("");
        },
        
        getTitle: function () {
            return this.getTitleEditor().getCode();
        },
        
        setTitle: function (aString) {
            this.getTitleEditor().setCode(aString || "");
        },
        
        clearTitle: function () {
            this.getTitleEditor().setCode("");
        },
        
        clearBodyAndTitle: function() {
            this.clearBody();
            this.clearTitle();
        },
        
        clear: function() {
            this.clearBodyAndTitle();
            this._basicSetCodeModel(null);
        },
        
        refresh: function() {
            this.clearBodyAndTitle();
            this.setTitle(this.codeModel.getTitle());
            this.setBody(this.codeModel.getBody());
        },
        
        setCodeModel: function(aCodeModel) {
            this._basicSetCodeModel(aCodeModel);
            this.refresh();
        },
        
        _basicSetCodeModel: function(aCodeModel) {
            this.codeModel = aCodeModel;
        },
        
        getTitleBodyObject: function() {
            return {
                title: this.getTitle(),
                body: this.getBody()
            }
        },
        
        saveBody: function() {
            this.codeModel.save(this.getTitleBodyObject());
            this.refresh();
        },            
        
        discardBody: function() {
            this.codeModel.discard(this.getTitleBodyObject());
            this.refresh();
        },
        
        deleteBody: function() {
            this.codeModel.del(this.getTitleBodyObject());
            this.refresh();
        },
                
    }
})