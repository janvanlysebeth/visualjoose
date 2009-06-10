Joose.Managed.Property.MethodModifier.Before = new Joose.Proto.Class('Joose.Managed.Property.MethodModifier.Before', {
    
	isa : Joose.Managed.Property.MethodModifier,

    prepareWrapper : function(name, modifier, originalCall, originalArgCall, superProto) {
    	
        var BEFORE = function () {
            modifier.apply(this, arguments)
            return originalCall.apply(this, arguments)
        }
        
        return BEFORE
    }
    
}).c