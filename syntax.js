


function swe() {

    var tmpbacktrackdata;

    function tokenfunc(stream,state,backtrackdata) {
        backtrackdata = backtrackdata || tmpbacktrackdata;
        tmpbacktrackdata = null;

        if (backtrackdata)
        {
            var res = backtrack(state);
            tmpbacktrackdata = backtrackdata;
            return res.token;
        }

        function backtrack(state)
        {
            var data = backtrackdata.parts[backtrackdata.current];

            if (data)
            {
                if (backtrackdata.lastpos < data.start)
                {
                    var res = tokenfunc(stream,state);
                    backtrackdata.lastpos += stream.pos-stream.start;

                    return { token:res, done: false };
                }


                for (var i = data.start; i < data.end; i++)
                {
                    stream.next();
                }
                var tmp = backtrackdata.current;
                backtrackdata.current++;
                backtrackdata.lastpos = data.end;

                if (backtrackdata.current >= backtrackdata.parts.length)
                {
                    backtrackdata = null;
                    tmpbacktrackdata = null;
                    return {token: data.token[tmp], done: true};

                }
                return {token: data.token[tmp], done: false};
            }
            stream.next();
            return {token: null, done: true}
        }

        for(var o = 0; o<sshighlight.length; o++)
        {
            var op = sshighlight[o];


            var reg = sshighlight[o].regex;
            var raw;

            if ((raw = stream.match(/(".*?")/,true)) !== null)
            {
                return "string";
            }


            if ((raw = stream.match(reg,false)) !== null)
            {
                var indentation = state.indented;

                if (op.indent)
                    indentation = stream.indentation()+4;
                if (op.dedent)
                    indentation = stream.indentation()-4;

                state.indented = indentation;

                var last = 0;
                //var raw = /(sätt)\s+\S+\s+(till)+\s+\S+/
                backtrackdata = {
                    parts: [],
                    current: 0,
                    lastpos: 0,
                    firstnontoken: 0
                };
                for (var i = 1; i<raw.length; i++)
                {
                    if (raw[i] == null)
                        continue;
                    last = raw[0].indexOf(raw[i],last);

                    backtrackdata.parts.push({
                        start:last,
                        end: last+raw[i].length,
                        token: sshighlight[o].token
                    });

                    if (last == 0)
                        backtrackdata.firstnontoken = last+raw[i].length;

                    tmpbacktrackdata = backtrackdata;
                }


                return backtrack(state).token;
            }
        }

        stream.next();
        return null;
    };

    function indentfunc(state, textAfter)
    {
        console.log(state.indented);

        return state.indented;
    }

    function startstate(basecolumn)
    {
        return {
            indented: 0
        };
    }

    return {token: tokenfunc, indent: indentfunc, startState: startstate};
}
