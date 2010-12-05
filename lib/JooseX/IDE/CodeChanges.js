Class("JooseX.IDE.CodeChanges", {
    methods: {        
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
            return changes.sort(function(aChange, anotherChange) {
                return aChange.getId() - anotherChange.getId();
            });
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
        
        asStateObject: function() {
            return {
                id: this.getId(),
                type: this.getType(),
                title: this.getTitle(),
                body: this.getBody(),
                context: this.getContext(),
            };
        },
        
        displayIdString: function() {
            var buf = [];
            buf.push(this.getType());
            buf.push(this.getContext());
            buf.push(this.getTitle());
            return buf.join(' ');
        },
        
        _objectAtNamespace: function(aString) {
            return this.my._objectAtNamespace(aString);
        }
    },
    
    my: {
        has: {           
            HOST: null
        },
        
        methods: {
            fromStateObject: function(anObject) {
                var changeClass = this._objectAtNamespace(anObject.type);
                return changeClass.my.createFromStateObject(anObject);
            },
            
            createFromStateObject: function(anObject) {
                var inst = new this.HOST();
                inst.setId(anObject.id);
                inst.setType(anObject.type);
                inst.setContext(anObject.context);
                inst.setTitle(anObject.title);
                inst.setBody(anObject.body);
                return inst;
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
