Class("JooseX.IDE.framework.ApplicationModel", {
    has: {
        targetDocument: {
            is: 'rw',
            init: function() {
                return window.document; 
            }
        }
    },
    
    methods: {
        $: function (id) {
            return this.getTargetDocument().getElementById(id)
        }
    }
});
