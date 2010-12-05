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
            var change = JooseX.IDE.AddMethodCodeChange.create(
                aTitleBodyObject.title, aTitleBodyObject.body, this.getClazz());
            change.execute();
        },
        
        del: function(aTitleBodyObject) {
            var change = JooseX.IDE.DeleteMethodCodeChange.create(
                aTitleBodyObject.title, this.getClazz());
            change.execute();
        },
        
        discard: function(aTitleBodyObject) {
            
        }
    }
});
