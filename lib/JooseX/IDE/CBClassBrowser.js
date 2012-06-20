Class("JooseX.IDE.CBClassBrowser", {
    isa: JooseX.IDE.framework.ApplicationModel,
    
    has: {        
        editor: {is: 'rw'},
        modules: {is: 'ro', init: function() {return ko.observableArray([]);}},
        classes: {is: 'ro', init: function() {return ko.observableArray([]);}},
        categories: {is: 'ro', init: function() {return ko.observableArray([]);}},
        elements: {is: 'ro', init: function() {return ko.observableArray([]);}},
        selectedModule: {is: 'ro', init: function() {return ko.observable();}},
        selectedClass: {is: 'ro', init: function() {return ko.observable();}},
        selectedCategory: {is: 'ro', init: function() {return ko.observable();}},
        selectedElement: {is: 'ro', init: function() {return ko.observable();}}
    },
    
    methods: {
        initializeInWindow: function(aWindow, onReadyCallback) {
            this.setBrowserWindow(aWindow);
            this.initializeEditor(aWindow);
            this.modules(this.getAllModules());
            this.initializeViewModel();
            this.initializeEventListeners();
            var self = this;
            this.executeCallbackWhen(onReadyCallback, function() {
                return self.getEditor().getIsInitialized();
            });
        },
        
        initializeViewModel: function() {
            this.selectedModule.subscribe(this._bind(this.onModuleSelected));
            this.selectedClass.subscribe(this._bind(this.onClassSelected));
            this.selectedCategory.subscribe(this._bind(this.onCategorySelected));
            this.selectedElement.subscribe(this._bind(this.onElementSelected));
            ko.applyBindings(this, this.getDocument().body);
        },
        
        initializeEventListeners: function() {
            JooseX.IDE.VJ.instance().bind('codeChangedEvent.JooseX.IDE.AddMethodCodeChange', 
                this._bind(this.onAddMethodCodeChangeEvent));
        },
        
        doAddElement: function() {
            if (this.selectedClass() && this.selectedCategory()){
                this.getEditor().setCodeModel(new JooseX.IDE.CBMethodCodeModel(
                        {method: null,
                        clazz: this.selectedClass(),
                        isClassMethod: (this.selectedCategory() == "Class Methods")}));
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
        
        clearElements: function() {            
            this.elements([]);
            this.selectedElement(null);
        },
        
        clearCategories: function() {            
            this.categories([]);
            this.selectedCategory(null);
        },
        
        clearClasses: function() {            
            this.classes([]);
            this.selectedClass(null);
        },
        
        clearModules: function() {
            this.modules([]);
            this.selectedModule(null);
        },
        
        onAddMethodCodeChangeEvent: function(event) {
            if(event.extraEventData.getContext() != this.selectedClass())
                return;
                
            if(this.selectedCategory() == "Instance Methods") {
                this.elements(Joose.O.eachOwnArray(
                    this.selectedClass().meta.methods));
            } else if(this.selectedCategory() == "Class Methods" && this.selectedClass().my) {
                this.elements(Joose.O.eachOwnArray(
                    this.selectedClass().my.meta.methods));
            }                
        },
        
        onModuleSelected: function (module) {
            this.selectedClass(null);
            this.classes(this.getAllClassesForModule(module));
            this.editor.setCodeModel(
                new JooseX.IDE.CBNamespaceCodeModel({namespace: module}));
        },
        
        onClassSelected: function (clazz) {
            if (clazz) {
                this.categories(
                    ["Instance Methods","Attributes", "Class Methods", "Class Attributes"]);            
                this.editor.setCodeModel(new JooseX.IDE.CBClassOrRoleCodeModel({classOrRole: clazz}));
            } else {
                this.categories([]);
                this.editor.setCodeModel(new JooseX.IDE.CBNamespaceCodeModel(
                    {namespace: this.selectedModule()}));
            }
            this.selectedCategory(null);
        },
        
        onCategorySelected: function (cat) {
            this.selectedElement(null);
            this.editor.clear();
            if (cat) {
                if(cat == "Instance Methods") {
                    this.elements(Joose.O.eachOwnArray(
                        this.selectedClass().meta.methods));
                }
                if(cat == "Class Methods" && this.selectedClass().my) {
                    this.elements(Joose.O.eachOwnArray(
                        this.selectedClass().my.meta.methods));
                }
                if(cat == "Attributes") {
                    this.elements(Joose.O.eachOwnArray(
                        this.selectedClass().meta.attributes));
                }
                if(cat == "Class Attributes" && this.selectedClass().my) {
                    this.elements(Joose.O.eachOwnArray(
                        this.selectedClass().my.meta.attributes));
                }
            } else {
                this.elements([]);
                this.editor.setCodeModel(new JooseX.IDE.CBClassOrRoleCodeModel(
                    {classOrRole: this.selectedClass()}));
            }
        },
        
        onElementSelected: function (ele) {
            this.editor.clear();            
            if(ele instanceof Joose.Managed.Property.MethodModifier) {
                this.editor.setCodeModel(new JooseX.IDE.CBMethodCodeModel(
                    {method: ele,
                    clazz: this.selectedClass(),
                    isClassMethod: (this.selectedCategory() == "Class Methods")})); 
            } else if(ele instanceof Joose.Managed.Property.Attribute) {
                this.editor.setCodeModel(new JooseX.IDE.CBAttributeCodeModel(
                    {attribute: ele,
                    clazz: this.selectedClass(),
                    isClassAttribute: (this.selectedCategory() == "Class Attributes")}));
            } else {                           
                this.editor.setCodeModel(new JooseX.IDE.CBClassOrRoleCodeModel(
                    {classOrRole: this.selectedClass()}));
            }
                
        },
            
        getAllModules: function() {
            return JooseX.IDE.JooseFacade.getAllModules();
        },
    
        getAllClassesForModule: function(aNamespaceKeeper) {
            return JooseX.IDE.JooseFacade.getAllClassesForModule(
                aNamespaceKeeper);
        },
        
        selectMethod: function(aClass, aMethod, aBoolean) {
            this.selectClass(aClass);
            if (aBoolean) {
                this.selectedCategory("Class Methods");
            } else {
                this.selectedCategory("Instance Methods");
            }
            if (typeof aMethod === "string"){
                if (aBoolean) {
                    aMethod = this.selectedClass().my.meta.methods[aMethod];
                } else {
                    aMethod = this.selectedClass().meta.methods[aMethod];
                }
            }
            this.selectedElement(aMethod);
        },
        
        selectClassMethod: function(aClass, aMethod) {
            this.selectMethod(aClass, aMethod, true);
        },
        
        selectAttribute: function(aClass, anAttribute, aBoolean) {
            this.selectClass(aClass);
            if (aBoolean) {
                this.selectedCategory("Class Attributes");
            } else {
                this.selectedCategory("Attributes");
            }
            if (typeof anAttribute === "string"){
                if (aBoolean) {
                    anAttribute = this.selectedClass().my.meta.attributes[anAttribute];
                } else {
                    anAttribute = this.selectedClass().meta.attributes[anAttribute];
                }
            }
            this.selectedElement(anAttribute);
        },
        
        selectClassAttribute: function(aClass, anAttribute) {
            this.selectAttribute(aClass, anAttribute, true);
        },
        
        selectModule: function(aModule) {
            if (typeof aModule === "string"){
                aModule = JooseX.IDE.objectAt(aModule);
            }
            if (aModule.meta && aModule.meta instanceof Joose.Namespace.Keeper) {
                this.selectedModule(aModule);
            }             
        },
        
        selectClass: function(aClass) {
            if (typeof aClass === "string"){
                var parts = aClass.split('.');
                var localName = parts.pop();
                this.selectModule(parts.join('.'));
                aClass = JooseX.IDE.objectAt(aClass);
            } else if (aClass.meta && aClass.meta instanceof Joose.Meta.Class) {
                this.selectModule(aClass.meta.parentNs.qualifiedName());
            }
            this.selectedClass(aClass);
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