Class("JooseX.IDE.CBMethodCodeModel", {
    has: {
        clazz: {
            is: 'rw'
        },
        
        method: {
            is: 'rw'
        },
        
        isClassMethod: {
            is: 'rw',
            init: function() { return false;}
        }
    },
    
    methods: {
        getTitle: function() {
            return this.method ? this.method.name : "";
        },
        
        getBody: function() {
            return this.method ? this.method.init.toString() : "";
        },
        
        save: function(aTitleBodyObject) {
            if (aTitleBodyObject.title) {
                var change = JooseX.IDE.AddMethodCodeChange.create(
                    aTitleBodyObject.title, 
                    aTitleBodyObject.body, 
                    this.getClazz(),
                    this.getIsClassMethod());
                change.execute();
            }
        },
        
        del: function(aTitleBodyObject) {
            if (aTitleBodyObject.title) {
                var change = JooseX.IDE.DeleteMethodCodeChange.create(
                    aTitleBodyObject.title, 
                    this.getClazz(),
                    this.getIsClassMethod());
                change.execute();
            }
        },
        
        discard: function(aTitleBodyObject) {
            
        }
    }
});
