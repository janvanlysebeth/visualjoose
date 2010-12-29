Class("JooseX.IDE.test.CBClassBrowserTestCase", {
    isa: JooseX.IDE.framework.test.AbstractTestCase,
    methods: {
        testOpen: function() {
            var self = this;
            var cb = this.assertOpen(JooseX.IDE.CBClassBrowser, function() {
                var childWindow = cb.getBrowserWindow();
                self.equal(childWindow.document.title, 'Joose Class Browser');
                cb.close();
            });
        },
        
        testModuleList: function() {
            var self = this;
            var cb = JooseX.IDE.CBClassBrowser.open(this.monitor(function() {
                var foundComTestMeModules = cb.$('#JooseCBModulesSelect option')
                    .filter(function() { 
                        return "com.test.me" == this.text
                    });
                self.equal(1, foundComTestMeModules.size());
                foundComTestMeModules.attr("selected", true);
                cb.$('#JooseCBModulesSelect').change();
                self.equal(com.test.me, cb.selectedModule());
                var options = cb.$('#JooseCBClassesSelect option');
                self.equal(2, options.size());
                var texts = options.map(function() { return this.text });
                self.equal("Doer", texts.get(0));
                self.equal("TestClass", texts.get(1));
                cb.close();
            }));
        }
    }
});
