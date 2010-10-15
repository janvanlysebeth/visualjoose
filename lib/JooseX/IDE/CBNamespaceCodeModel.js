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
            this.namespace.meta.parentNs.removeProperty(this.getLocalTitle());
        },
        
        discard: function(aTitleBodyObject) {
            
        },
        
        getLocalTitle: function() {
            return (Joose.S.saneSplit(this.getTitle(), '.').pop());
        }
    }
});
