console.log = function(string)
{
    window.parent.postMessage({action:"log",args:[string]},"*");
};
