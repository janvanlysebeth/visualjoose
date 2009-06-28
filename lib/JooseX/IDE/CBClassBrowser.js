Class("JooseX.IDE.CBClassBrowser", {
    isa: JooseX.IDE.framework.ApplicationModel,
    
    has: {        
        editor: {
            is: 'ro',
            init: function() {
                return new JooseX.IDE.CBBrowserEditor();
            }
        }
    },
    
    methods: {
        fillModules: function (anArray) {
            this.fillSelect(
                this.moduleSelect(), 
                anArray,
                true
            )
        },
    
        getAllClasses: function(aNamespaceKeeper) {
            var allClasses = [];
            Joose.O.eachSafe(aNamespaceKeeper.meta.ns.properties, 
                function(prop, name) {
                    if (prop.meta instanceof Joose.Proto.Class &&
                        !(prop.meta instanceof Joose.Namespace.Keeper)) {
                        allClasses.push(prop);
                    }
                });
            return allClasses;
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
            this.clearSelect(this.categoriesSelect())
            this.clearSelect(this.elementsSelect())
            this.editor.setCodeModel(new JooseX.IDE.CBNamespaceCodeModel({namespace: module}));
        },
        
        selectedClass: function (select) {
            this.clearSelect(this.elementsSelect());
            var clazz = this.selectedValueObject(select);
            this.fillSelect(this.categoriesSelect(), [
                {clazz: clazz, name: "Instance Methods"},
                {clazz: clazz, name: "Attributes"},
                {clazz: clazz, name: "Class Methods"},
                {clazz: clazz, name: "Class Attributes"},
            ])
            
            this.editor.setCodeModel(new JooseX.IDE.CBClassOrRoleCodeModel({classOrRole: clazz}));
        },
        
        selectedCategory: function (select) {
            this.clearSelect(this.elementsSelect());
            this.editor.clear();
            var cat = this.selectedValueObject(select);
            var clazz   = cat.clazz
            if(cat.name == "Instance Methods") {
                this.fillSelect(this.elementsSelect(), clazz.meta.methods)
            }
            if(cat.name == "Class Methods" && clazz.my) {
                this.fillSelect(this.elementsSelect(), clazz.my.meta.methods)
            }
            if(cat.name == "Attributes") {
                this.fillSelect(this.elementsSelect(), clazz.meta.attributes)
            }
            if(cat.name == "Class Attributes" && c.my) {
                this.fillSelect(this.elementsSelect(), clazz.my.meta.attributes)
            }
        },
        
        selectedElement: function (select) {
            var ele = this.selectedValueObject(select);            
            var clazz = this.selectedValueObject(this.classSelect());
            
            if(ele instanceof Joose.Managed.Property.MethodModifier) {
                this.editor.setCodeModel(new JooseX.IDE.CBMethodCodeModel(
                    {method: ele,
                    clazz: clazz})); 
            } 
            else if(ele instanceof Joose.Managed.Property.Attribute) {
                this.editor.setCodeModel(new JooseX.IDE.CBAttributeCodeModel(
                    {attribute: ele,
                    clazz: clazz}));
            }
        },
        
        selectedValueObject: function (select) {
            if(select.selectedIndex < 0) return null;
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
        }
        
    },
    
    my: {
        methods: {
            open: function() {
                var inst = new JooseX.IDE.CBClassBrowser();
                inst.fillModules(this.getAllModules());
                return inst;
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
            }
        }
    }
});