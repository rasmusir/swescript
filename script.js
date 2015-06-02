var elements = {};
var TYPE = {RAW:0,ALL:Infinity}
var frameworks = {
    ops: [],
    add: function(obj)
    {
        obj.ops.forEach(function(op) {
            op.regex = new RegExp(op.pattern.replace(/\(|\)/g,"").replace(/\?((?=[^:])|$)/g,"(\\(.+?\\)|\\\".*?\\\"|(?!\\s)\\S+(?=\\s*))").trim(),"i");

            var hrx = op.pattern.split(/\s+/);
            var ct = 0;
            hrx = hrx.join("\\s+").replace(/\?((?=[^:])|$)/g,"(?:\\(.+?\\)|\\\".*?\\\"|(?!\\s)\\S+(?=\\s*))").trim();
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
            elements.console.appendChild(div);
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
        snips.push({ snip:snip[0], word:!!snip[3], string: !!snip[2], group: !!snip[1] });
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
        var args = snip.match(reg);
        return op.code(args.slice(1));
    }
    else
        return snip;
}

function Do(line)
{
    if (!line)
        return{err:true};
    var lineraw = line;
    line = line.trim();

    if (line == "")
        return "\n";

    var splitter = /\(.+?\)|\".*?\"|(?!\s)\S+(?=\s*)/g;
    var parts = [];
    var arr;
    while ( (arr = splitter.exec(line)) !== null)
    {
        parts.push({ word:arr[0], construct:arr[1] !== undefined });
    }


    var pattern = line.substr(0,line.indexOf(" "));
    var op = null;
    var reg = null;

    for (var i = 0; i< frameworks.ops.length; i++)
    {
        var p = frameworks.ops[i];
        reg = p.regex;
        if (reg.test(line))
        {
            op = p;
            break;
        }
    }

    if (op)
    {
        var all = line.match(reg);
        var argsraw = all.slice(1);
        var args = [];
        for (var i=0; i<argsraw.length; i++)
        {
            var split = /\(.*?\)|".*?"|\S+/g;
            splitter.lastIndex = 0;
            var parts = split.exec(argsraw[i]);

            var res = Do(argsraw[i]);
            if (res.err)
            {
                args.push(argsraw[i]);
                continue;
            }
            args.push(res);
        }

        if (op.code)
        {
            var res = op.code(args);
            if (res.err)
                return {err:{line: line,num: curline,msg: res.message}};
        }
        else
            res = all.input;
        return res;
    }
    else
    {

    }
    //return {err:{line: line,num: curline}};

    curline++;
}

function Error(message)
{
    this.message = message;
}
