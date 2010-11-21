Class("JooseX.IDE.CBMethodCodeModel", {
    has: {
        clazz: {
            is: 'rw'
        },
        
        method: {
            is: 'rw'
        }
    },
    
    methods: {
        getTitle: function() {
            return this.method.name;
        },
        
        getBody: function() {
            return this.method.init.toString();
        },
        
        save: function(aTitleBodyObject) {
            (new JooseX.IDE.CodeChanges()).saveMethod(this.clazz, aTitleBodyObject);
        },
        
        del: function(aTitleBodyObject) {
            (new JooseX.IDE.CodeChanges()).deleteMethod(this.clazz, aTitleBodyObject);
        },
        
        discard: function(aTitleBodyObject) {
            
        }
    }
});
