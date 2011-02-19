Class("JooseX.IDE.framework.ApplicationModel", {
    has: {        
        browserWindow: {
            is: 'rw'
        }
    },
    
    methods: {
        getDocument: function() {
            return this.getBrowserWindow().document;
        },
        
        asHtmlId: function(aString) {
            return aString.replace(/(:|\.|\s+)/g,'__');
        },
        
        as$id: function (aString) { 
            return '#' + this.asHtmlId(aString);
        },
        
        $: function (id) {
            return $(id, this.getDocument());
        },
        
        $$: function (id) {
            return $(id, this.getDocument())[0];
        },
        
        close: function() {
            this.getBrowserWindow().close();
        },
        
        _eh: function eventHandler(aFunction, aBoolean) {
            var self = this;
            return function (event) {
                var args = (Array.prototype.slice.call(arguments));
                args.push(event || window.event);                
                //this is the this of the eventHandler an HTMLSelectElement for e.g.
                args.push(this);
                aFunction.apply(self, args);
                return aBoolean;
            }
        },
        
        _bind: function (aFunction, anObject) {
            var self = anObject || this;
            return function (event) {
                return aFunction.apply(self, arguments);
            }
        }
    },
    
    my: {
        has: {           
            HOST: null
        },
        
        methods: {            
            open: function(onReadyCallback, onFailureCallback) {
                var inst = new this.HOST();
                JooseX.IDE.VJ.instance().openApplicationModel(
                    inst, onReadyCallback, onFailureCallback);
                return inst;
            }
        }
    }
});
