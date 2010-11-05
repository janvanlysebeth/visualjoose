Class("JooseX.IDE.CBClassBrowser", {
    isa: JooseX.IDE.framework.ApplicationModel,
    
    has: {        
        editor: {
            is: 'rw'
        },
        browserWindow: {
            is: 'rw'
        }
    },
    
    methods: {
        initializeInWindow: function(aWindow) {
            this.setBrowserWindow(aWindow);
            this.initializeEditor(aWindow);
            this.fillModules(this.getAllModules());
        },
            
        initializeEditor: function(aWindow) {
            this.setEditor(new JooseX.IDE.CBBrowserEditor());
            this.getEditor().initializeInWindow(aWindow);
        },
        
        fillModules: function (anArray) {
            this.fillSelect(
                this.moduleSelect(), 
                anArray,
                true
            )
        },
    
        getAllClasses: function(aNamespaceKeeper) {
            var allClasses = [];
            Joose.O.eachOwn(aNamespaceKeeper.meta.ns.properties, 
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
            Joose.O.eachOwn(array, function (thing) {
                var option = that.getDocument().createElement("option");
                var name   = thing.name;
                if(useMeta) {
                    name = thing.meta.name;
                }
                option.setAttribute('id',name);
                option.innerHTML   = name;
                option.valueObject = thing;
                options.push(option);
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
            if(cat.name == "Class Attributes" && clazz.my) {
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
            return this.$('#JooseCBElementsSelect')
        },
        
        categoriesSelect: function () {
            return this.$('#JooseCBCategoriesSelect')
        },
        
        classSelect: function () {
            return this.$('#JooseCBClassesSelect')
        },
        
        moduleSelect: function () {
            return this.$('#JooseCBModulesSelect')
        },
            
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
        }        
    },
    
    my: {
        methods: {
            open: function(aWindow) {
                var inst = new JooseX.IDE.CBClassBrowser();
                aWindow.cb = inst;
                inst.initializeInWindow(aWindow);
                return inst;
            },
            
            openInNewWindow: function(globalWindow, onReadyCallback) {
                var aChildWindow = globalWindow.open("./class_browser_stripped.html");
                var inst = new JooseX.IDE.CBClassBrowser();
                aChildWindow.cb = inst;
                aChildWindow.onload = function() {
                    //all code should run in the global window
                    globalWindow.setTimeout(function() {
                        inst.initializeInWindow(aChildWindow);
                        onReadyCallback();
                    }, 0);
                };
                return inst;
            }
        }
    }
});