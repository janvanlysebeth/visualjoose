Module("com.test.me", function () {
    Role("Doer", {
        methods: {
            doSomething: function() { alert("I'm doing something") }
        }
    });
        
	Class("TestClass", {
		isa: Joose.Method,
        does: com.test.me.Doer,
        have: {
            simpleAttrib: 'foo'
        },
        has: {
            bar: {
                is: "rw",
                init: "world"
            }
        },
		//does: Joose.Decorator,
		methods: {
			hello: function () { return "world" }
		},
		my: {
            have: {
                baz: "a class attribute"
            },
			methods: {
				foo: function () { alert("bar") }
			}
		}
	})
})
