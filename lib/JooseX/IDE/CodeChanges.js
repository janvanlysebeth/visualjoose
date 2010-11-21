Class("JooseX.IDE.CodeChanges", {
    methods: {
        saveMethod: function(clazz, aTitleBodyObject) {
            this.jooseAddMethod(
                clazz, aTitleBodyObject.title, aTitleBodyObject.body);
            var change = new JooseX.IDE.CodeChange();
            change.setId(Date.now().toString());
            change.setType('saveMethod');
            change.setContext(clazz.meta.name);
            change.setTitle(aTitleBodyObject.title);
            change.setBody(aTitleBodyObject.body);
            this.store(change);
        },
        
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
                aCodeChange.getId(), JSON.stringify(aCodeChange));
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
                            JooseX.IDE.CodeChange.my.fromJSONObject(itemObject));
                    } catch (ex) {}
                }
            }
            return changes;
        }
    }    
});

Class("JooseX.IDE.CodeChange", {
    has: {
        id: {
            is: 'rw'
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
            fromJSONObject: function(anObject) {
                var inst = new JooseX.IDE.CodeChange();
                inst.id = anObject.id;
                inst.type = anObject.type;
                inst.context = anObject.context;
                inst.title = anObject.title;
                inst.body = anObject.body;
                return inst;
            }
        }
    }
});
