var elements = {};
var TYPE = {RAW:0,ALL:Infinity}
var frameworks = {
    ops: [],
    add: function(obj)
    {
        obj.ops.forEach(function(op) {
            var types = op.pattern.match(/\?|@/g);
            if (types)
                op.argumentTypes = types;
            var hrx = op.pattern.split(/\s+/);
            op.regex = new RegExp(hrx.join("\\s+").replace(/\(|\)/g,"").replace(/\?((?=[^:])|$|(?=[^!]))/g,"(\\(.+?\\)|\\\".*?\\\"|(?!\\s)\\S+(?=\\s*))").replace(/@/g,"(.*)").trim(),"im");

            var ct = 0;
            hrx = hrx.join("\\s+").replace(/\?((?=[^:])|$)/g,"(?:\\(.+?\\)|\\\".*?\\\"|(?!\\s)\\S+(?=\\s*))").replace(/@/g,".*").trim();
            sshighlight.push({regex:new RegExp(hrx,"i") , token: op.type, sol: op.sol, indent: op.indent, dedent: op.dedent});

            frameworks.ops.push(op);
        });
    }
};

var curline = 0;
var curcode = [];

window.addEventListener("load",function() {


    elements.output = document.querySelector("#output");
    elements.console = document.querySelector("#console");
    var div = document.createElement("div");
    div.innerHTML = ">"
    elements.input = document.createElement("input");
    div.appendChild(elements.input);
    elements.console.appendChild(div);

    elements.input.onkeypress = function(e) {
        if (e.keyCode == 13)
        {
            elements.output.contentWindow.postMessage({action:"read",text:elements.input.value},"*");
            e.preventDefault();

            var div = document.createElement("div");
            div.innerHTML = elements.input.value;
            elements.console.insertBefore(div,elements.console.lastChild);
            elements.console.scrollTop = 100000000;

            elements.input.value = "";
        }
    };

    elements.run = document.querySelector("#run");
    elements.run.onclick = Compile;

    //CodeMirror.defineSimpleMode("swe", sshighlight);
    CodeMirror.defineMode("swe",swe);
    CodeMirror.defineMIME("text/x-swe","swe");

    elements.code = new CodeMirror(document.querySelector("#code"),{value:"",mode:"swe"});
    Editor();
});

window.addEventListener("message", function(event) {
    var data = event.data;

    switch (data.action)
    {
        case "log":
            var div = document.createElement("div");
            div.innerHTML = data.args[0];
            elements.console.insertBefore(div,elements.console.lastChild);
            elements.console.scrollTop = 100000000;
            break;
    }
});


function Editor()
{
    var editor = elements.code;
    var currentline = null;
}

function GetText()
{
    var text = "";
    for (var i = 0; i<elements.code.childNodes.length; i++)
    {
        var node = elements.code.childNodes[i];
        text += node.textContent+"\n";
    }

    return text;
}

function Compile()
{
    var raw = elements.code.getValue();

    var rawarray = raw.split("\n");

    curline = 1;
    curcode = [];

    rawarray.forEach(function(line) {
        var res = ReadSnippet(line);
        if (res && res.err)
        {
            console.error(res.err.msg + " på rad "+res.err.num+": "+res.err.line);
        }
        else
        {
            curcode.push(res);
        }
    });

    var code = curcode.join("\n");

    document.querySelector("#js").innerHTML = code.replace(/\n/g,"<br>");

    var script = document.createElement("script");
    script.innerHTML = code;

    elements.output.contentWindow.document.body.innerHTML = "";
    elements.output.contentWindow.document.body.appendChild(script);

    //eval(code);
}

function ReadSnippet(snippet,group)
{
    var splitter = /(\(.*?\))|(".*?")|(\S+)/g;
    var snips = [];
    var snip;
    while ((snip = splitter.exec(snippet)) !== null)
    {
        snips.push({ snip:snip[0], word:!!snip[3], string: !!snip[2], group: !!snip[1]});
    }

    var parts = [];

    snips.forEach(function(snip) {
        if (snip.word)
        {
            var res = TryExecute(snip.snip);
            parts.push(res);
        }
        else if (snip.string)
        {
            parts.push(snip.snip);
        }
        else if (snip.group)
        {
            var s = snip.snip.substr(1,snip.snip.length-2);
            parts.push(ReadSnippet(s,true));
        }
    });

    if (group)
        return "("+parts.join(" ")+")";

    return TryExecute(parts.join(" "));

    console.log(args);
}

function TryExecute(snip)
{

    var pattern = snip;
    var op = null;
    var reg = null;

    for (var i = 0; i< frameworks.ops.length; i++)
    {
        var p = frameworks.ops[i];
        reg = p.regex;
        if (reg.test(snip))
        {
            op = p;
            break;
        }
    }
    if (op)
    {
        var args = snip.match(reg).slice(1);
        var a = [];
        var neg = 0;
        for (var i = 0; i<args.length; i++)
        {
            if (!args[i])
            {
                neg++;
                continue;
            }
            if (op.argumentTypes[i] == "?")
            {
                a.push(args[i]);
                continue;
            }
            a.push(args[i].match(/(\(.*?\))|(".*?")|(\S+)/g));
        }

        return op.code(a);
    }
    else
        return snip;
}
