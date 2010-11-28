Class("JooseX.IDE.CodeChanges", {
    methods: {        
        deleteMethod: function(clazz, aTitleBodyObject) {
            this.jooseDeleteMethod(clazz, aTitleBodyObject.title);
            var change = new JooseX.IDE.CodeChange();
            change.setId(Date.now().toString());
            change.setType('deleteMethod');
            change.setContext(clazz.meta.name);
            change.setTitle(aTitleBodyObject.title);
            change.setBody(aTitleBodyObject.body);
            this.store(change);
        },
        
        jooseDeleteMethod: function(clazz, methodName) {
            clazz.meta.getMethod(methodName).unapply(clazz);
            clazz.meta.stem.properties.methods.open();
            clazz.meta.removeMethod(methodName);
            clazz.meta.stem.properties.methods.close();
        },
        
        jooseAddMethod: function(clazz, methodName, methodBody) {
            var bodyFunction;
            eval("bodyFunction = " + methodBody);
            clazz.meta.stem.properties.methods.open();
            clazz.meta.addMethod(methodName, bodyFunction);
            clazz.meta.stem.properties.methods.close();
            clazz.meta.getMethod(methodName).apply(clazz);
        },
        
        store: function(aCodeChange) {
            localStorage.setItem(
                aCodeChange.getId(), JSON.stringify(aCodeChange.asStateObject()));
        },
        
        loadAllChanges: function() {
            var changes = [];
            var item, itemObject;
            for (var i = 0; i < localStorage.length; i++) {
                item = localStorage.getItem(localStorage.key(i));
                if (item != null) {
                    try {
                        itemObject = JSON.parse(item);
                        changes.push(
                            JooseX.IDE.CodeChange.fromStateObject(itemObject));
                    } catch (ex) {}
                }
            }
            return changes;
        },
        
        deleteChangesByIds: function(anArrayOfIds) {
            var self = this;
            Joose.A.each(anArrayOfIds, function(anId) {
                self.deleteChangeById(anId);
            });
        },
        
        deleteChangeById: function(anId) {
            localStorage.removeItem(anId);
        }
    }    
});

Class("JooseX.IDE.CodeChange", {
    has: {
        id: {
            is: 'rw',
            init: function() {return Date.now().toString();}
        },
        
        type: {
            is: 'rw'
        },
        
        context: {
            is: 'rw'
        },
        
        title: {
            is: 'rw'
        },
        
        body: {
            is: 'rw'
        }
    },
    
    methods: {
        execute: function() {
            this.basicExecute();
            JooseX.IDE.VJ.instance().getCodeChanges().store(this);
            
        },
        
        displayIdString: function() {
            var buf = [];
            buf.push(this.type);
            buf.push(this.context);
            buf.push(this.title);
            return buf.join(' ');
        }
    },
    
    my: {
        methods: {
            fromStateObject: function(anObject) {
                var changeClass = this._objectAtNamespace(anObject.type);
                return changeClass.my.createFromStateObject(anObject);
            },
            
            _objectAtNamespace: function(identifier) {        
                var parts = identifier.split('.');
                var ns = JooseX.IDE.VJ.instance().getGlobalWindow();
                for (var i = 0; i < parts.length; i++) {
                    if (!ns[parts[i]]) {
                        return null;
                    }
                    ns = ns[parts[i]];
                }
        
                return ns;
            }
        }
    }
});

Class("JooseX.IDE.AddMethodCodeChange", {
    isa: JooseX.IDE.CodeChange,
    
    has: {
        contextString: {
            is: 'rw'
        }
    },
    
    methods: {        
        asStateObject: function() {
            return {
                id: this.getId(),
                type: this.getType(),
                title: this.getTitle(),
                body: this.getBody(),
                context: this.getContextString(),
            };
        },
        
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
        has: {           
            HOST: null
        },
        
        methods: {
            create: function(aMethodName, aMethodBody, aClazz) {
                var inst = new this.HOST();
                inst.setType("JooseX.IDE.AddMethodCodeChange");
                inst.setContext(aClazz);
                inst.setContextString(aClazz.meta.name);
                inst.setTitle(aMethodName);
                inst.setBody(aMethodBody);
                return inst;
            },
            
            createFromStateObject: function(anObject) {
                var inst = new this.HOST();
                inst.setId(anObject.id);
                inst.setType(anObject.type);
                inst.setContextString(anObject.context);
                var clazz = this._objectAtNamespace(anObject.context);
                inst.setContext(clazz);
                inst.setTitle(anObject.title);
                inst.setBody(anObject.body);
                return inst;
            }
        }
    }
});
