Class("JooseX.IDE.CBClassBrowser", {
    isa: JooseX.IDE.framework.ApplicationModel,
    
    has: {        
        editor: {
            is: 'rw'
        }
    },
    
    methods: {
        initializeInWindow: function(aWindow) {
            this.setBrowserWindow(aWindow);
            this.initializeEditor(aWindow);
            this.fillModules(this.getAllModules());
            this.registerEventHandlers();
        },
        
        registerEventHandlers: function() {
            this.moduleSelect().onchange = this._eh(this.onModuleSelected);
            this.classSelect().onchange = this._eh(this.onClassSelected);
            this.categoriesSelect().onchange = this._eh(this.onCategorySelected);
            this.elementsSelect().onchange = this._eh(this.onElementSelected);
            this.$$('#JooseCBSaveAction').onclick = this._eh(this.doSaveBody);
            this.$$('#JooseCBDiscardAction').onclick = this._eh(this.doDiscardBody);
            this.$$('#JooseCBDeleteAction').onclick = this._eh(this.doDeleteBody);
        },
        
        doSaveBody: function() {
            this.getEditor().saveBody();
        },
        
        doDiscardBody: function() {
            this.getEditor().discardBody();
        },
        
        doDeleteBody: function() {
            this.getEditor().deleteBody();
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
        
        fillSelect: function(select, array, useMeta) {
            
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
        
        clearSelect: function(select) {
            select.innerHTML = "";
        },
        
        clearElements: function() {            
            this.clearSelect(this.elementsSelect());
        },
        
        clearCategories: function() {            
            this.clearSelect(this.categoriesSelect());
        },
        
        clearClasses: function() {            
            this.clearSelect(this.classSelect());
        },
        
        clearModules: function() {            
            this.clearSelect(this.moduleSelect());
        },
        
        selectedModule: function() {
            return this.selectedValueObject(this.moduleSelect());
        },
        
        selectedClass: function() {
            return this.selectedValueObject(this.classSelect());
        },
        
        selectedCategory: function() {
            return this.selectedValueObject(this.categoriesSelect());
        },
        
        selectedElement: function() {
            return this.selectedValueObject(this.elementsSelect());
        },
        
        selectedValueObject: function (select) {
            if(select.selectedIndex < 0) return null;
            return select.options[select.selectedIndex].valueObject
        },
        
        onModuleSelected: function () {
            var module = this.selectedModule();
            this.fillSelect(this.classSelect(), this.getAllClassesForModule(module), true)
            this.clearCategories();
            this.clearElements();
            this.editor.setCodeModel(new JooseX.IDE.CBNamespaceCodeModel({namespace: module}));
        },
        
        onClassSelected: function (select) {
            this.clearElements();
            var clazz = this.selectedClass();
            this.fillSelect(this.categoriesSelect(), [
                {clazz: clazz, name: "Instance Methods"},
                {clazz: clazz, name: "Attributes"},
                {clazz: clazz, name: "Class Methods"},
                {clazz: clazz, name: "Class Attributes"},
            ]);
            
            this.editor.setCodeModel(new JooseX.IDE.CBClassOrRoleCodeModel({classOrRole: clazz}));
        },
        
        onCategorySelected: function (select) {
            this.clearElements();
            this.editor.clear();
            var cat = this.selectedCategory();
            var clazz   = cat.clazz;
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
        
        onElementSelected: function (select) {
            var ele = this.selectedElement();            
            var clazz = this.selectedClass();
            
            if(ele instanceof Joose.Managed.Property.MethodModifier) {
                this.editor.setCodeModel(new JooseX.IDE.CBMethodCodeModel(
                    {method: ele,
                    clazz: clazz,
                    isClassMethod: (this.selectedCategory().name == "Class Methods")})); 
            } 
            else if(ele instanceof Joose.Managed.Property.Attribute) {
                this.editor.setCodeModel(new JooseX.IDE.CBAttributeCodeModel(
                    {attribute: ele,
                    clazz: clazz,
                    isClassAttribute: (this.selectedCategory().name == "Class Attributes")}));
            }
        },
        
        elementsSelect: function () {
            return this.$$('#JooseCBElementsSelect')
        },
        
        categoriesSelect: function () {
            return this.$$('#JooseCBCategoriesSelect')
        },
        
        classSelect: function () {
            return this.$$('#JooseCBClassesSelect')
        },
        
        moduleSelect: function () {
            return this.$$('#JooseCBModulesSelect')
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
        },
    
        getAllClassesForModule: function(aNamespaceKeeper) {
            var allClasses = [];
            Joose.O.eachOwn(aNamespaceKeeper.meta.ns.properties, 
                function(prop, name) {
                    if (prop.meta instanceof Joose.Proto.Class &&
                        !(prop.meta instanceof Joose.Namespace.Keeper)) {
                        allClasses.push(prop);
                    }
                });
            return allClasses;
        }      
    },
    
    my: {
        has: {
            url: {
                is: 'ro',
                init: function() {return "./class_browser_stripped.html"}
            }
        }
    }
});