/* Joose Extensions */

Joose.Managed.PropertySet.Namespace.meta.extend({
    qualifiedName: function() {
        return this.container.meta.name;
    },
    
    localName: function() {
        return this.name;
    }
});

var classAndRoleExtensionMethods = {            
    qualifiedName: function() {
        return this.name;
    },
    
    localName: function() {
        return this.name.split('.').pop();
    }
};

Joose.Meta.Class.meta.extend({
    methods: classAndRoleExtensionMethods
});

Joose.Meta.Role.meta.extend({
    methods: classAndRoleExtensionMethods
});

Joose.O.eachOwnArray = function(object) {
    result = [];
    Joose.O.eachOwn(object, function(value, name) {
        result.push(value);
    });
    return result;
};    

Class("JooseX.IDE.JooseFacade", {
    my: {
        methods: {
            getAllModules: function() {
                var allModules = [];
                function flattenNameSpaceTree(aNamespace) {
                    try {
                        if (aNamespace != null && aNamespace.meta instanceof Joose.Namespace.Keeper) {
                            allModules.push(aNamespace);
                            Joose.O.eachOwn(aNamespace.meta.ns.properties, 
                                function(prop, name) {
                                    flattenNameSpaceTree(prop);
                                });
                        }
                    } catch(ex) {
                        /* swallow security exceptions in firefox which are thrown
                        when accessing all properties of the window object.
                        TODO: show on transcript when transcript exists */             
                        
                    }
                }
                Joose.O.eachOwn((new Joose.Namespace.Manager()).globalNs.container, 
                    function(property, name) {flattenNameSpaceTree(property)});
                return allModules;
            },
            
            getAllClassesForModule: function(aNamespaceKeeper) {
                var allClasses = [];
                if (aNamespaceKeeper) {
                    Joose.O.eachOwn(aNamespaceKeeper.meta.ns.properties, 
                        function(prop, name) {
                            if (prop.meta instanceof Joose.Proto.Class &&
                                !(prop.meta instanceof Joose.Namespace.Keeper)) {
                                allClasses.push(prop);
                            }
                        });
                }
                return allClasses;
            }
        }
    }
});

JooseX.IDE.objectAt = function(aString, aRoot) {
    var ns = aRoot || window;
    var parts = aString.split('.');
    for (var i = 0; i < parts.length; i++) {
        if (!ns[parts[i]]) {
            return null;
        }
        ns = ns[parts[i]];
    }    
    return ns;
};
