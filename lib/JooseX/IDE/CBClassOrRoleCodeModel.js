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
            var change = JooseX.IDE.AddClassCodeChange.create(
                aTitleBodyObject.title, aTitleBodyObject.body);
            change.execute();
        },
        
        del: function(aTitleBodyObject) {            
            var change = JooseX.IDE.DeleteClassCodeChange.create(
                aTitleBodyObject.title);
            change.execute();
        },
        
        discard: function(aTitleBodyObject) {
            
        }
    }
});
