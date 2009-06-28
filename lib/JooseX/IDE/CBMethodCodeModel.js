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
            return this.method.props.init.toString();
        },
        
        save: function(aTitleBodyObject) {
            var bodyFunction;
            eval("bodyFunction = " + aTitleBodyObject.body);
            this.clazz.meta.stem.properties.methods.openWithoutDeCompose();
            this.clazz.meta.addMethod(aTitleBodyObject.title, bodyFunction);
            this.clazz.meta.stem.properties.methods.close();
            this.clazz.meta.getMethod(aTitleBodyObject.title).apply(this.clazz);
        },
        
        del: function(aTitleBodyObject) {
            this.clazz.meta.getMethod(aTitleBodyObject.title).unapply(this.clazz);
            this.clazz.meta.stem.properties.methods.openWithoutDeCompose();
            this.clazz.meta.removeMethod(aTitleBodyObject.title);
            this.clazz.meta.stem.properties.methods.close();
        },
        
        discard: function(aTitleBodyObject) {
            
        }
    }
});
