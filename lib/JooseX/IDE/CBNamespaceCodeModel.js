Class("JooseX.IDE.CBNamespaceCodeModel", {
    has: {
        namespace: {
            is: 'rw'
        }
    },
    
    methods: {
        getTitle: function() {
            return this.namespace.meta.name;
        },
        
        getBody: function() {
            return null;
        },
        
        
        save: function(aTitleBodyObject) {
            Module(aTitleBodyObject.title, function(){});
        },
        
        del: function(aTitleBodyObject) {
            this.namespace.meta.parent.removeProperty(this.namespace.meta.localName);
        },
        
        discard: function(aTitleBodyObject) {
            
        }
    }
});
