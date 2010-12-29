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
            this.$('#JooseCBModulesSelect').change(this._eh(this.onModuleSelected));
            this.classSelect().onchange = this._eh(this.onClassSelected);
            this.categoriesSelect().onchange = this._eh(this.onCategorySelected);
            this.elementsSelect().onchange = this._eh(this.onElementSelected);
            this.$$('#JooseCBSaveAction').onclick = this._eh(this.doSaveBody);
            this.initializeElementCommands();
            this.$$('#JooseCBDiscardAction').onclick = this._eh(this.doDiscardBody);
            this.$$('#JooseCBDeleteAction').onclick = this._eh(this.doDeleteBody);
        },
        
        initializeElementCommands: function() {
            this.$('#addElementAnchor').click(this._eh(this.doAddElement, false));
            this.$('#searchElementAnchor').click(this._eh(this.doSearchElement));
            this.$('#deleteElementAnchor').click(this._eh(this.doDeleteElement));
            this.disableElementCommands();
        },
        
        disableElementCommands: function() {
            this.$('#addElementAnchor').attr('disabled', true);
            this.$('#searchElementAnchor').attr('disabled', true);
            this.$('#deleteElementAnchor').attr('disabled', true);
        },
        
        enableElementCommands: function() {
            this.$('#addElementAnchor').removeAttr('disabled');
            this.$('#searchElementAnchor').removeAttr('disabled');
            this.$('#deleteElementAnchor').removeAttr('disabled');
        },
        
        doAddElement: function() {
            if (this.selectedClass() && this.selectedCategory()){
                this.getEditor().setCodeModel(new JooseX.IDE.CBMethodCodeModel(
                        {method: null,
                        clazz: this.selectedClass(),
                        isClassMethod: (this.selectedCategory().name == "Class Methods")}));
                this.getEditor().setTitle("newMethod");
                this.getEditor().selectTitleAndGiveFocus();
            }
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
                function(aModule) {
                    return aModule.meta.qualifiedName();
                }
            )
        },
        
        fillClasses: function (anArray) {
            this.fillSelect(
                this.classSelect(), 
                anArray,
                function(aClass) {
                    return aClass.meta.localName();
                }
            )
        },
        
        fillCategories: function (anArray) {
            this.fillSelect(
                this.categoriesSelect(), 
                anArray,
                function(aCategory) {
                    return aCategory.name;
                }
            )
        },        
        
        
        fillElementsWithInstanceMethodsOf: function (aClass) {
            this.fillElements(aClass.meta.methods);
        },        
        
        
        fillElementsWithClassMethodsOf: function (aClass) {
            this.fillElements(aClass.my.meta.methods);
        },       
        
        
        fillElementsWithInstanceAttributesOf: function (aClass) {
            this.fillElements(aClass.meta.attributes);
        },                 
        
        
        fillElementsWithClassAttributesOf: function (aClass) {
            this.fillElements(aClass.my.meta.attributes);
        },
        
        fillElements: function (anArray) {
            this.fillSelect(
                this.elementsSelect(), 
                anArray,
                function(anElement) {
                    return anElement.name;
                }
            )
        },
        
        fillSelect: function(select, array, nameCallback) {
            
            select.innerHTML = ""
            
            var options = []
            
            var self = this;
            Joose.O.eachOwn(array, function (thing) {
                var option = self.getDocument().createElement("option");
                var name   = nameCallback(thing);
                option.setAttribute('id',self.asHtmlId(name));
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
            this.disableElementCommands();
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
            this.fillClasses(this.getAllClassesForModule(module));
            this.clearCategories();
            this.clearElements();
            this.editor.setCodeModel(new JooseX.IDE.CBNamespaceCodeModel({namespace: module}));
        },
        
        onClassSelected: function (select) {
            this.clearElements();
            var clazz = this.selectedClass();
            if (clazz) {
                this.fillCategories(
                    [{clazz: clazz, name: "Instance Methods"},
                    {clazz: clazz, name: "Attributes"},
                    {clazz: clazz, name: "Class Methods"},
                    {clazz: clazz, name: "Class Attributes"}]);            
                this.editor.setCodeModel(new JooseX.IDE.CBClassOrRoleCodeModel({classOrRole: clazz}));
            } else {
                this.onModuleSelected();
            }
        },
        
        onCategorySelected: function (select) {
            this.clearElements();
            this.editor.clear();
            var cat = this.selectedCategory();
            if (cat) {
                var clazz   = cat.clazz;
                if(cat.name == "Instance Methods") {
                    this.fillElementsWithInstanceMethodsOf(clazz);
                }
                if(cat.name == "Class Methods" && clazz.my) {
                    this.fillElementsWithClassMethodsOf(clazz);
                }
                if(cat.name == "Attributes") {
                    this.fillElementsWithInstanceAttributesOf(clazz);
                }
                if(cat.name == "Class Attributes" && clazz.my) {
                    this.fillElementsWithClassAttributesOf(clazz);
                }
            }
            this.enableElementCommands();
        },
        
        onElementSelected: function (select) {
            this.editor.clear();
            var ele = this.selectedElement();            
            var clazz = this.selectedClass();
            
            if(ele instanceof Joose.Managed.Property.MethodModifier) {
                this.editor.setCodeModel(new JooseX.IDE.CBMethodCodeModel(
                    {method: ele,
                    clazz: clazz,
                    isClassMethod: (this.selectedCategory().name == "Class Methods")})); 
            } else if(ele instanceof Joose.Managed.Property.Attribute) {
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
            return JooseX.IDE.JooseFacade.getAllModules();
        },
    
        getAllClassesForModule: function(aNamespaceKeeper) {
            return JooseX.IDE.JooseFacade.getAllClassesForModule(
                aNamespaceKeeper);
        },
        
        selectCategory: function(aString) {
            this.__selectOption("JooseCBCategoriesSelect", aString);
            this.onCategorySelected();
        },
        
        selectElement: function(anId) {
            this.__selectOption("JooseCBElementsSelect", anId);
            this.onElementSelected();            
        },
        
        selectMethod: function(aClass, aMethod, aBoolean) {
            this.selectClass(aClass);
            if (aBoolean) {
                this.selectCategory("Class Methods");
            } else {
                this.selectCategory("Instance Methods");
            }
            if (typeof aMethod === "string"){
                this.selectElement(aMethod);
            } else if (aMethod) {
                this.selectElement(aMethod.name);
            }            
        },
        
        selectClassMethod: function(aClass, aMethod) {
            this.selectMethod(aClass, aMethod, true);
        },
        
        selectAttribute: function(aClass, anAttribute, aBoolean) {
            this.selectClass(aClass);
            if (aBoolean) {
                this.selectCategory("Class Attributes");
            } else {
                this.selectCategory("Attributes");
            }
            if (typeof anAttribute === "string"){
                this.selectElement(anAttribute);
            } else if (anAttribute) {
                this.selectElement(anAttribute.name);
            }            
        },
        
        selectClassAttribute: function(aClass, anAttribute) {
            this.selectAttribute(aClass, anAttribute, true);
        },
        
        selectModule: function(aModule) { 
            if (typeof aModule === "string"){
                this.selectModuleWithQualifiedName(aModule);
            } else if (aModule.meta && aModule.meta instanceof Joose.Namespace.Keeper) {
                this.selectModuleWithQualifiedName(aModule.meta.ns.qualifiedName());
            }             
        },
        
        selectModuleWithQualifiedName: function(aString) {
            this.__selectOption("JooseCBModulesSelect", aString);
            this.onModuleSelected();
        },
        
        selectClass: function(aClass) {
            if (typeof aClass === "string"){
                var parts = aClass.split('.');
                var localName = parts.pop();
                this.selectModule(parts.join('.'));
                this.selectClassWithLocalName(localName);
            } else if (aClass.meta && aClass.meta instanceof Joose.Meta.Class) {
                this.selectModule(aClass.meta.parentNs.qualifiedName());
                this.selectClassWithLocalName(aClass.meta.ns.localName());
            }            
        },
        
        selectClassWithLocalName: function(aString) {
            this.__selectOption("JooseCBClassesSelect", aString);
            this.onClassSelected();
        },
        
        __selectOption: function(selectId, optionId) {
            this.$(this.as$id(selectId)).find(this.as$id(optionId))
                .attr("selected", true);
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