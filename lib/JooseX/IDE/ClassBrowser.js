Module("JooseX.IDE", function () {
    Class("ClassBrowser", {
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
            },
            
            initialize: function () {
                this.SUPER();
                this.fillSelect(
                    this.moduleSelect(), 
                    this.getAllModules(),
                    true
                )
            },
	    
            getAllModules: function() {
                var allModules = [];
                function flattenNameSpaceTree(aNamespace) {
                if (aNamespace.meta instanceof Joose.Namespace.Keeper) {
                    allModules.push(aNamespace);
                    Joose.O.eachSafe(aNamespace.meta.ns.properties, 
                    function(prop, name) {
                        flattenNameSpaceTree(prop);
                    });
                }
                }
                Joose.O.eachSafe(__global__.properties, 
                function(property, name) {flattenNameSpaceTree(property)});
                return allModules;
            },
            
            getNames: function (array) {
                var names = [];
                Joose.A.each(array, function (ele) { names.push(ele.meta.getName()) });
                return names
            },
            
            fillSelect: function (select, array, useMeta) {
                
                select.innerHTML = ""
                
                var options = []
                
                var that = this;
                Joose.O.each(array, function (thing) {
                    var option = that.getTargetDocument().createElement("option");
                    var name   = thing.name;
                    if(useMeta) {
                        name = thing.meta.name
                    }
                    option.innerHTML   = name
                    option.valueObject = thing
                    options.push(option)
                })
                Joose.A.each(options, function (option) { select.appendChild(option) })
            },
            
            clearSelect: function (select) {
                select.innerHTML = "";
            },
            
            selectedModule: function (select) {
                var module = this.selectedValueObject(select);
                this.fillSelect(this.classSelect(), this.getAllClasses(module), true)
                this.clearBodyAndTitle()
                this.clearSelect(this.categoriesSelect())
                this.clearSelect(this.elementsSelect())
            },
        
            getAllClasses: function(aModule) {
                var allClasses = [];
                Joose.O.eachSafe(aModule.meta.ns.properties, 
                    function(prop, name) {
                        if (prop.meta instanceof Joose.Proto.Class &&
                            !(prop.meta instanceof Joose.Namespace.Keeper)) {
                            allClasses.push(prop);
                        }
                    });
                return allClasses;
            },
            
            selectedClass: function (select) {
                this.clearSelect(this.elementsSelect());
                this.clearBodyAndTitle();
                var c = this.selectedValueObject(select);
                this.fillSelect(this.categoriesSelect(), [
                    {c: c, name: "Instance Methods"},
                    {c: c, name: "Attributes"},
                    {c: c, name: "Class Methods"},
                    {c: c, name: "Class Attributes"},
                ])
                
                var html = "<p><strong>"+c.meta.localName+"</strong></p>"
                html    += "<ul>"
                html    +=   "<li>Super Classes: "+c.meta.superClass+"</li>"
                html    +=   "<li>Roles: "+c.meta.getRoles()+"</li>"
                html    += "</ul>"
                
                this.setTitle(c.meta.name);
                this.setBody(html);
            },
            
            getBodyEditor: function() {
                return this.getTargetDocument().bodyEditor;
            },
            
            getTitleEditor: function() {
                return this.getTargetDocument().titleEditor;
            },
            
            getBody: function () {
                return this.getBodyEditor().getCode();
            },
            
            setBody: function (aString) {
                this.getBodyEditor().setCode(aString);
            },
            
            clearBody: function () {
                this.getBodyEditor().setCode("");
            },
            
            getTitle: function () {
                return this.getTitleEditor().getCode();
            },
            
            setTitle: function (aString) {
                this.getTitleEditor().setCode(aString);
            },
            
            clearTitle: function () {
                this.getTitleEditor().setCode("");
            },
            
            clearBodyAndTitle: function() {
                this.clearBody();
                this.clearTitle();
            },
            
            selectedCategory: function (select) {
                this.clearSelect(this.elementsSelect());
                this.clearBodyAndTitle();
                var cat = this.selectedValueObject(select);
                var c   = cat.c
                if(cat.name == "Instance Methods") {
                    this.fillSelect(this.elementsSelect(), c.meta.methods)
                }
                if(cat.name == "Class Methods" && c.my) {
                    this.fillSelect(this.elementsSelect(), c.my.meta.methods)
                }
                if(cat.name == "Attributes") {
                    this.fillSelect(this.elementsSelect(), c.meta.attributes)
                }
                if(cat.name == "Class Attributes" && c.my) {
                    this.fillSelect(this.elementsSelect(), c.my.meta.attributes)
                }
            },
            
            selectedElement: function (select) {
                var ele = this.selectedValueObject(select);
                var html = "";
                
                this.setTitle(ele.name);
                if(ele instanceof Joose.Managed.Property.MethodModifier) {
                    this.setBody(ele.props.init.toString()); 
                } 
                else if(ele instanceof Joose.Managed.Property.Attribute) {
                    this.setBody(ele.props.toSource());
                }
            },
            
            selectedValueObject: function (select) {
                return select.options[select.selectedIndex].valueObject
            },
            
            elementsSelect: function () {
                return this.$('JooseCBElementsSelect')
            },
            
            categoriesSelect: function () {
                return this.$('JooseCBCategoriesSelect')
            },
            
            classSelect: function () {
                return this.$('JooseCBClassesSelect')
            },
            
            moduleSelect: function () {
                return this.$('JooseCBModulesSelect')
            },
            
            saveBody: function() {
/*                var cat = this.selectedValueObject(this.categoriesSelect());
                var c   = cat.c
                if(cat.name == "Instance Methods" || cat.name == "Class Methods") {
                    var clazz = this.selectedValueObject(this.classSelect());
                    var clazzName = clazz.meta.getName();
                    var i = clazzName.lastIndexOf('.');
                    if (i > 0) {
                        var moduleName = clazzName.substring(0, i);
                        var m;
                        var allModules = Joose.Module.getAllModules();
                        for (j = 0; j < allModules.length; j++) {
                            if (allModules[j].meta.getName() === moduleName) {
                                m = allModules[j];
                            }
                        };
                    }
                    var bodyFunction;
                    eval("bodyFunction = " + this.getBody());
                    if(cat.name == "Class Methods") {
                        clazz.meta.addClassMethod(this.getTitle(), bodyFunction);
                    } else {
                        clazz.meta.addClassMethod(this.getTitle(), bodyFunction);
                    }
                }
                if(cat.name == "Attributes") {
                    var props;
                    eval("props = " + this.getBody());
                    var at = new Joose.Attribute(this.getTitle(), props);
                    var clazz = this.selectedValueObject(this.classSelect());
                    at.apply(clazz);
                }*/
            }
        }
    })
})