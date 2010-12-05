Class("JooseX.IDE.AbstractMethodCodeChange", {
    isa: JooseX.IDE.CodeChange,
    
    has: {
        contextString: {
            is: 'rw'
        }
    },
    
    methods: {
    },
    
    override: {
        asStateObject: function() {
            var stateObject = this.SUPERARG(arguments);
            stateObject.context = this.getContextString();
            return stateObject;
        }
    },
    
    my: {
        override: {            
            createFromStateObject: function(anObject) {
                var inst = this.SUPERARG(arguments);
                inst.setContextString(anObject.context);
                var clazz = this._objectAtNamespace(anObject.context);
                inst.setContext(clazz);
                return inst;
            }
        }
    }
});

Class("JooseX.IDE.AddMethodCodeChange", {
    isa: JooseX.IDE.AbstractMethodCodeChange,
    
    methods: {        
        basicExecute: function() {  
            var bodyFunction;
            eval("bodyFunction = " + this.getBody());
            this.getContext().meta.stem.properties.methods.open();
            this.getContext().meta.addMethod(this.getTitle(), bodyFunction);
            this.getContext().meta.stem.properties.methods.close();
            this.getContext().meta.getMethod(this.getTitle()).apply(this.getContext());            
        }
    },
    
    my: {        
        methods: {
            create: function(aMethodName, aMethodBody, aClazz) {
                var inst = new this.HOST();
                inst.setType("JooseX.IDE.AddMethodCodeChange");
                inst.setContext(aClazz);
                inst.setContextString(aClazz.meta.name);
                inst.setTitle(aMethodName);
                inst.setBody(aMethodBody);
                return inst;
            }
        }
    }
});

Class("JooseX.IDE.DeleteMethodCodeChange", {
    isa: JooseX.IDE.AbstractMethodCodeChange,
    
    methods: {        
        basicExecute: function() {  
            this.getContext().meta.getMethod(this.getTitle()).unapply(this.getContext());
            this.getContext().meta.stem.properties.methods.open();
            this.getContext().meta.removeMethod(this.getTitle());
            this.getContext().meta.stem.properties.methods.close();           
        }
    },
    
    my: {        
        methods: {
            create: function(aMethodName, aClazz) {
                var inst = new this.HOST();
                inst.setType("JooseX.IDE.DeleteMethodCodeChange");
                inst.setContext(aClazz);
                inst.setContextString(aClazz.meta.name);
                inst.setTitle(aMethodName);
                return inst;
            }
        }
    }
});
