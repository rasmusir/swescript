console.log = function(string)
{
    window.parent.postMessage({action:"log",args:[string]},"*");
};

window.addEventListener("message", function(event) {
    var data = event.data;

    switch (data.action)
    {
        case "read":
            if (window.onread)
                window.onread(data.text);
            break;
    }
});
