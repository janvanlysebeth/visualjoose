Class("JooseX.IDE.CBBrowserEditor", {
    isa: JooseX.IDE.framework.ApplicationModel,
    
    has: {
        codeModel: {
            is: 'rw'
        }
    },
    
    methods: {        
        _getBodyEditor: function() {
            return this.getTargetDocument().bodyEditor;
        },
        
        _getTitleEditor: function() {
            return this.getTargetDocument().titleEditor;
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