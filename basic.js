frameworks.add({name: "basic",ops:[
    {
        pattern: "(skriv) ?",
        type: ["variable-3"],
        code: function(args) {
            return "console.log("+args[0]+");";
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
        pattern: "^(börja) (?) (med) @",
        type: ["keyword","variable-3","keyword"],
        indent: true,
        code: function(args) {
            return "function " + args[0] + "("+(args[1] || []).join(",")+")\n{";
        }
    },
    {
        pattern: "^(börja) (?)",
        type: ["keyword","variable-3"],
        indent: true,
        code: function(args) {
            return "function " + args[0] + "("+(args[1] || []).join(",")+")\n{";
        }
    },
    {
        pattern: "^\s*(stäng)",
        type: ["keyword"],
        dedent: true,
        code: function(args) {
            return "}";
        }
    },
    {
        pattern: "(kör) (?) (med) @",
        type: ["keyword","variable-3","keyword"],
        code: function(args) {
            return args[0] + "("+args[1].join(",")+");";
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
    {
        pattern: "(om) @",
        type: ["keyword"],
        indent: true,
        code: function (args) {
            return  "if (" + ReadSnippet(args[0].join(" ")) + ") {";
        }
    },
    {
        pattern: "(annars)",
        type: ["keyword"],
        code: function (args) {
            return  "}\nelse{";
        }
    },
    {
        pattern: "(?) (är samma som) (?)",
        type: ["variable","keyword","variable"],
        code: function (args) {
            return args[0] + " == " + args[1];
        }
    },
    {
        pattern: "(?) (är större än) (?)",
        type: ["variable","keyword","variable"],
        code: function (args) {
            return args[0] + " > " + args[1];
        }
    },
    {
        pattern: "(?) (är mindre än) (?)",
        type: ["variable","keyword","variable"],
        code: function (args) {
            return args[0] + " < " + args[1];
        }
    },
]});

