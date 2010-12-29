Class("JooseX.IDE.CBNamespaceCodeModel", {
    has: {
        namespace: {
            is: 'rw'
        }
    },
    
    methods: {
        getTitle: function() {
            return this.namespace ? this.namespace.meta.name : "";
        },
        
        getBody: function() {
            return null;
        },
        
        
        save: function(aTitleBodyObject) {
            if (aTitleBodyObject.title) {
                Module(aTitleBodyObject.title, function(){});
            }
        },
        
        del: function(aTitleBodyObject) {
            if (aTitleBodyObject.title) {
                this.namespace.meta.parentNs.removeProperty(this.getLocalTitle());
            }
        },
        
        discard: function(aTitleBodyObject) {
            
        },
        
        getLocalTitle: function() {
            return (Joose.S.saneSplit(this.getTitle(), '.').pop());
        }
    }
});
