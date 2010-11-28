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
        
        $: function (id) {
            return $(id, this.getBrowserWindow().document);
        },
        
        $$: function (id) {
            return $(id, this.getBrowserWindow().document)[0];
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
        }
    },
    
    my: {
        has: {           
            HOST: null
        },
        
        methods: {            
            open: function(onReadyCallback) {
                var inst = new this.HOST();
                JooseX.IDE.VJ.instance().openApplicationModel(inst, onReadyCallback);
                return inst;
            }
        }
    }
});
