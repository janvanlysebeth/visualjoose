Class("JooseX.IDE.CBClassOrRoleCodeModel", {
    has: {
        classOrRole: {
            is: 'rw'
        }
    },
    
    methods: {
        getTitle: function() {
            return this.classOrRole.meta.name;
        },
        
        getBody: function() {
            var html = "{";
            html += "isa: "+this.classOrRole.meta.superClass;
            var roles = this.classOrRole.meta.getRoles();
            Joose.A.each(roles, function(role) {
                html += ",\n";
                html += "does: "+role;
            });
            html    += "}";
            return html;
        },
        
        save: function(aTitleBodyObject) {  
            var props;
            eval("props = " + aTitleBodyObject.body);
            Class(aTitleBodyObject.title, props);
        },
        
        del: function(aTitleBodyObject) {
            this.classOrRole.meta.parentNs.removeProperty(this.getLocalTitle());
        },
        
        discard: function(aTitleBodyObject) {
            
        },
        
        getLocalTitle: function() {
            return (Joose.S.saneSplit(this.getTitle(), '.').pop());
        }
    }
});
