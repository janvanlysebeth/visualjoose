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
            return $(id, this.getBrowserWindow().document)[0];
        }
    }
});
