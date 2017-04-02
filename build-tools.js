function execCmd(cmd, cb){ // from: https://gist.github.com/millermedeiros/4724047, but modified to actually work.

    var child_process = require('child_process');
    var opts = {cwd:__dirname};
    if (cmd.env)
    	opts.env = cmd.env;
    if (cmd.cwd)
    	opts.cwd = cmd.cwd;
    if (typeof cmd !== 'string') { // we can accept: 'ls *' or {cmd:'ls *',cwd:'/some/dir/'}
		cmd = cmd.cmd;    	
    }
    console.log('executing: ' + cmd);

	var p = child_process.exec(cmd, opts);
	p.stdout.on('data', (data) => {
	  console.log(data);
	});

	p.stderr.on('data', (data) => {
	  console.log(data);
	});
    p.on('exit', function(code){
         var err = null;
        if (code) {
            err = new Error('command "'+ cmd +'" exited with wrong status code "'+ code +'"');
            err.code = code;
            err.cmd = cmd;
        }
        if (cb) cb(err);
    });
};

function execSeries(cmds, cb) {
    var execNext = function() {
        execCmd(cmds.shift(), function(err) {
            if (err) {
                cb(err);
            } else {
                if (cmds.length) execNext();
                else cb(null);
            }
        });
    };
    execNext();
};


module.exports = {
	execSeries:execSeries,
}
