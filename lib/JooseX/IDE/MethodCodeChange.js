Class("JooseX.IDE.AbstractMethodCodeChange", {
    isa: JooseX.IDE.CodeChange,
    
    has: {
        contextString: {
            is: 'rw'
        },
        
        isClassMethod: {
            is: 'rw',
            init: function() {return false;}
        }
    },
    
    methods: {
        getClassToApplyTo: function() {
            return this.getIsClassMethod() ? this.getContext().my : this.getContext();
        }
    },
    
    override: {
        asStateObject: function() {
            var stateObject = this.SUPERARG(arguments);
            stateObject.context = this.getContextString();
            stateObject.isClassMethod = this.getIsClassMethod();
            return stateObject;
        }
    },
    
    my: {
        override: {            
            createFromStateObject: function(anObject) {
                var inst = this.SUPERARG(arguments);
                inst.setIsClassMethod(anObject.isClassMethod);
                inst.setContextString(anObject.context);
                var clazz = JooseX.IDE.objectAt(anObject.context);
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
            this.getClassToApplyTo().meta.stem.open();
            this.getClassToApplyTo().meta.addMethod(this.getTitle(), bodyFunction);
            this.getClassToApplyTo().meta.stem.close();           
        }
    },
    
    my: {        
        methods: {
            create: function(aMethodName, aMethodBody, aClazz, forClassMethod) {
                var inst = new this.HOST();
                inst.setType("JooseX.IDE.AddMethodCodeChange");
                inst.setContext(aClazz);
                inst.setContextString(aClazz.meta.name);
                inst.setTitle(aMethodName);
                inst.setBody(aMethodBody);
                if (forClassMethod != 'undefined' && forClassMethod) {
                    inst.setIsClassMethod(true);
                }
                return inst;
            }
        }
    }
});

Class("JooseX.IDE.DeleteMethodCodeChange", {
    isa: JooseX.IDE.AbstractMethodCodeChange,
    
    methods: {        
        basicExecute: function() {
            this.getClassToApplyTo().meta.stem.open();
            this.getClassToApplyTo().meta.removeMethod(this.getTitle());
            this.getClassToApplyTo().meta.stem.close();           
        }
    },
    
    my: {        
        methods: {
            create: function(aMethodName, aClazz, forClassMethod) {
                var inst = new this.HOST();
                inst.setType("JooseX.IDE.DeleteMethodCodeChange");
                inst.setContext(aClazz);
                inst.setContextString(aClazz.meta.name);
                inst.setTitle(aMethodName);
                if (forClassMethod != 'undefined' && forClassMethod) {
                    inst.setIsClassMethod(true);
                }
                return inst;
            }
        }
    }
});
