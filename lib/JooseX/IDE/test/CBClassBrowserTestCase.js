Class("JooseX.IDE.test.CBClassBrowserTestCase", {
    isa: JooseX.IDE.framework.test.AbstractTestCase,
    methods: {
        testOpen: function() {
            var self = this;
            var cb = JooseX.IDE.CBClassBrowser.openInNewChildWindow(window, function() {
                var childWindow = cb.getBrowserWindow();
                self.equal(childWindow.document.title, 'Joose Class Browser');
                childWindow.close();
            });
        }
    }
});
