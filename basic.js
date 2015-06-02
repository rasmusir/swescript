frameworks.add({name: "basic",ops:[
    {
        pattern: "(skriv) ?",
        type: ["keyword"],
        code: function(args) {
            return "console.log("+args[0]+");";
        }
    },
    {
        pattern: "(skapa) (privat|eget|egen) ?",
        type: ["keyword","keyword"],
        code: function(args) {
            return "this."+args[0]+";";
        }
    },
    {
        pattern: "(skapa) ?",
        type: ["keyword"],
        code: function(args) {
            return "var "+args[0]+";";
        }
    },
    {
        pattern: "(sätt) ? (till) ?",
        type: ["keyword","keyword"],
        code: function(args) {
            return args[0] + " = " + args[1] + ";";
        }
    },
    {
        pattern: "^\s*(\\:)(?)",
        type: ["keyword","variable-3"],
        indent: true,
        code: function(args) {
            return "function " + args[0] + "()\n{";
        }
    },
    {
        pattern: "^\s*(stäng)",
        type: ["keyword variable-3"],
        dedent: true,
        code: function(args) {
            return "}";
        }
    },
    {
        pattern: "(kör) (?)",
        type: ["keyword","variable-3"],
        code: function(args) {
            return args[0] + "();";
        }
    },
    {
        pattern: "(klona) (?) (till) ?",
        type: ["keyword","variable-3","keyword"],
        code: function(args) {
            return "var " + args[1] + " = new " + args[0] + "();";
        }
    },
    {
        pattern: "(mitt|min)\\.(?)",
        type: ["keyword","variable"],
        nonewline:true,
        code: function (args) {
            return "this."+(args[0]||args[1]);
        }
    },
]});

