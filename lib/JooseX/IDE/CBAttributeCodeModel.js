Class("JooseX.IDE.CBAttributeCodeModel", {
    has: {
        clazz: {
            is: 'rw'
        },
        
        attribute: {
            is: 'rw'
        }
    },
    
    methods: {
        getTitle: function() {
            return this.attribute.name;
        },
        
        getBody: function() {
            return this.attribute.props.toSource();
        },
        
        save: function(aTitleBodyObject) {
            var props;
            eval("props = " + aTitleBodyObject.body);
            this.clazz.meta.stem.properties.attributes.openWithoutDeCompose();
            this.clazz.meta.addAttribute(aTitleBodyObject.title, props);
            this.clazz.meta.stem.properties.attributes.close();
            this.clazz.meta.getAttribute(aTitleBodyObject.title).apply(this.clazz);
        },
        
        del: function(aTitleBodyObject) {
            this.clazz.meta.getAttribute(aTitleBodyObject.title).unapply(this.clazz);
            this.clazz.meta.stem.properties.attributes.openWithoutDeCompose();
            this.clazz.meta.removeAttribute(aTitleBodyObject.title);
            this.clazz.meta.stem.properties.attributes.close();
        },
        
        discard: function(aTitleBodyObject) {
            
        }
    }
});
