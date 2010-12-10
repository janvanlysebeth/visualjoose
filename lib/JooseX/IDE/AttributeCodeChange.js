Class("JooseX.IDE.AbstractAttributeCodeChange", {
    isa: JooseX.IDE.CodeChange,
    
    has: {
        contextString: {
            is: 'rw'
        },
        
        isClassAttribute: {
            is: 'rw',
            init: function() {return false;}
        }
    },
    
    methods: {
        getClassToApplyTo: function() {
            return this.getIsClassAttribute() ? this.getContext().my : this.getContext();
        },
        
        getAttributeLiteral: function() {
            return "{" + this.getTitle() +  ": " + this.getBody() + "}";
        }
    },
    
    override: {
        asStateObject: function() {
            var stateObject = this.SUPERARG(arguments);
            stateObject.context = this.getContextString();
            stateObject.isClassAttribute = this.getIsClassAttribute();
            return stateObject;
        }
    },
    
    my: {
        override: {            
            createFromStateObject: function(anObject) {
                var inst = this.SUPERARG(arguments);
                inst.setIsClassAttribute(anObject.isClassAttribute);
                inst.setContextString(anObject.context);
                var clazz = this._objectAtNamespace(anObject.context);
                inst.setContext(clazz);
                return inst;
            }
        }
    }
});

Class("JooseX.IDE.AddAttributeCodeChange", {
    isa: JooseX.IDE.AbstractAttributeCodeChange,
    
    methods: {        
        basicExecute: function() {  
            var props;
            eval("props = " + this.getAttributeLiteral());
            this.getClassToApplyTo().meta.stem.open();
            this.getClassToApplyTo().meta.builder.has(
                this.getClassToApplyTo().meta, props);       
            this.getClassToApplyTo().meta.stem.close();
            //this.getClassToApplyTo().meta.getAttribute(this.getTitle()).apply(this.getClassToApplyTo());
        }
    },
    
    my: {        
        methods: {
            create: function(anAttributeName, anAttributeBody, aClazz, forClassAttribute) {
                var inst = new this.HOST();
                inst.setType("JooseX.IDE.AddAttributeCodeChange");
                inst.setContext(aClazz);
                inst.setContextString(aClazz.meta.name);
                inst.setTitle(anAttributeName);
                inst.setBody(anAttributeBody);
                if (forClassAttribute != 'undefined' && forClassAttribute) {
                    inst.setIsClassAttribute(true);
                }
                return inst;
            }
        }
    }
});

Class("JooseX.IDE.DeleteAttributeCodeChange", {
    isa: JooseX.IDE.AbstractAttributeCodeChange,
    
    methods: {        
        basicExecute: function() {  
            //this.getClassToApplyTo().meta.getAttribute(this.getTitle()).unapply(this.getClassToApplyTo());
            this.getClassToApplyTo().meta.stem.open();
            this.getClassToApplyTo().meta.builder.hasnt(
                this.getClassToApplyTo().meta, [this.getTitle()]);   
            this.getClassToApplyTo().meta.stem.close();           
        }
    },
    
    my: {        
        methods: {
            create: function(anAttributeName, aClazz, forClassAttribute) {
                var inst = new this.HOST();
                inst.setType("JooseX.IDE.DeleteAttributeCodeChange");
                inst.setContext(aClazz);
                inst.setContextString(aClazz.meta.name);
                inst.setTitle(anAttributeName);
                if (forClassAttribute != 'undefined' && forClassAttribute) {
                    inst.setIsClassAttribute(true);
                }
                return inst;
            }
        }
    }
});
