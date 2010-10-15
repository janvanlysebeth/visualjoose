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
            this.initializeTitleEditorOn(this.$("#JooseCBTitle"));
            this.initializeBodyEditorOn(this.$("#JooseCBBody"));
        },
        
        initializeTitleEditorOn: function(aDOMNode) {
            this.titleEditor = new CodeMirror(aDOMNode, {
                parserfile: ["tokenizejavascript.js", "parsejavascript.js"],  
                path: "lib/CodeMirror/js/",
                stylesheet: "lib/CodeMirror/css/jscolors.css",
                height: "2em"});
        },
        
        initializeBodyEditorOn: function(aDOMNode) {
            this.bodyEditor = new CodeMirror(aDOMNode, {
                parserfile: ["tokenizejavascript.js", "parsejavascript.js"],  
                path: "lib/CodeMirror/js/",
                stylesheet: "lib/CodeMirror/css/jscolors.css",
                height: "35em"});
         },
        
        _getBodyEditor: function() {
            return this.getBodyEditor();
        },
        
        _getTitleEditor: function() {
            return this.getTitleEditor();
        },
        
        getBody: function () {
            return this._getBodyEditor().getCode();
        },
        
        setBody: function (aString) {
            this._getBodyEditor().setCode(aString || "");
        },
        
        clearBody: function () {
            this._getBodyEditor().setCode("");
        },
        
        getTitle: function () {
            return this._getTitleEditor().getCode();
        },
        
        setTitle: function (aString) {
            this._getTitleEditor().setCode(aString || "");
        },
        
        clearTitle: function () {
            this._getTitleEditor().setCode("");
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