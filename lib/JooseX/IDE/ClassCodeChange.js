Class("JooseX.IDE.AddClassCodeChange", {
    isa: JooseX.IDE.CodeChange,
    
    methods: {        
        basicExecute: function() {             
            var props;
            eval("props = " + this.getBody());
            Class(this.getTitle(), props);            
        }
    },
    
    my: {        
        methods: {
            create: function(aClassName, aClassBody) {
                var inst = new this.HOST();
                inst.setType("JooseX.IDE.AddClassCodeChange");
                inst.setTitle(aClassName);
                inst.setBody(aClassBody);
                return inst;
            }
        }
    }
});

Class("JooseX.IDE.DeleteClassCodeChange", {
    isa: JooseX.IDE.CodeChange,
    
    methods: {        
        basicExecute: function() {  
            var clazz = JooseX.IDE.objectAt(this.getTitle());
            clazz.meta.parentNs.removeProperty(this.getLocalTitle());
        },       
        
        getLocalTitle: function() {
            return (Joose.S.saneSplit(this.getTitle(), '.').pop());
        }
    },
    
    my: {        
        methods: {
            create: function(aClassName) {
                var inst = new this.HOST();
                inst.setType("JooseX.IDE.DeleteClassCodeChange");
                inst.setTitle(aClassName);
                return inst;
            }
        }
    }
});
