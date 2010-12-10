Class("JooseX.IDE.CBAttributeCodeModel", {
    has: {
        clazz: {
            is: 'rw'
        },
        
        attribute: {
            is: 'rw'
        },
        
        isClassAttribute: {
            is: 'rw',
            init: function() { return false;}
        }
    },
    
    methods: {            
        getTitle: function() {
            return this.attribute.name;
        },
        
        getBody: function() {
            return (new JooseX.IDE.AttributeSourceBuilder(this.attribute)).toSource()
        },
        
        save: function(aTitleBodyObject) {
            var change = JooseX.IDE.AddAttributeCodeChange.create(
                aTitleBodyObject.title, 
                aTitleBodyObject.body, 
                this.getClazz(),
                this.getIsClassAttribute());
            change.execute();
        },
        
        del: function(aTitleBodyObject) {
            var change = JooseX.IDE.DeleteAttributeCodeChange.create(
                aTitleBodyObject.title, 
                this.getClazz(),
                this.getIsClassAttribute());
            change.execute();
        },
        
        discard: function(aTitleBodyObject) {
            
        }
    }
});
                   
Class("JooseX.IDE.AttributeSourceBuilder", {
    have: {
        attribute: null,
        isFirstAppend: true,
    },
    
    has: {        
        buffer: {
            is: 'ro',
            init: function() { return []}
        }
    },
    
    methods: {
        BUILD : function (anAttribute) {
            return {attribute : anAttribute}
        },
        
        toSource: function() {
            this.buffer.push("{\n");
            this.__appendProperty("is");
            this.__appendProperty("init");
            this.buffer.push("\n}");
            return this.buffer.join('');
        },
        
        __appendProperty: function(aString) {
            if (this.attribute[aString]) {
                this.__appendKeyValue(aString, 
                    JooseX.IDE.VJ.instance().toSource(this.attribute[aString]));
            }
        },
        
        __appendKeyValue: function(aKey, aValue) {
            if(this.isFirstAppend) {
                this.isFirstAppend = false;
            } else {
                this.buffer.push(",\n");
            }
            this.buffer.push(aKey);
            this.buffer.push(': ');
            this.buffer.push(aValue);            
        }
    },
    
    after : {
        initialize : function (props) {
            this.attribute = props.attribute
        }
    }
});
