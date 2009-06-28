Class("JooseX.IDE.CBClassOrRoleCodeModel", {
    has: {
        classOrRole: {
            is: 'rw'
        }
    },
    
    methods: {
        getTitle: function() {
            return this.classOrRole.meta.localName;
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
            var fullname = this.classOrRole.meta.parent.name 
                + '.' + aTitleBodyObject.title;
            var props;
            eval("props = " + aTitleBodyObject.body);
            Class(fullname, props);
        },
        
        del: function(aTitleBodyObject) {
            this.classOrRole.meta.parent.removeProperty(
                this.classOrRole.meta.localName);
        },
        
        discard: function(aTitleBodyObject) {
            
        }
    }
});
