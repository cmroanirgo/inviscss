// build process for inviscss
(function(){
"use strict";

var fs = require("fs");
var path = require("path");

function getFiles(dir, ext) {
	var files = fs.readdirSync(dir).filter(function(filename) {
		return path.extname(filename)==ext;
	}).map(function(filename) {
		return path.join(dir, filename);
	});
	return files;
}


function execCmd(cmd, cb){ // from: https://gist.github.com/millermedeiros/4724047, but modified to actually work.

    var child_process = require('child_process');
    console.log('executing: ' + cmd);
	var p = child_process.exec(cmd, {cwd:__dirname});
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

// remove references to less in the demo html
getFiles(path.join(__dirname, 'dist', 'demo'), '.html').forEach(function(file) {
	var html = fs.readFileSync(file, 'utf8');
	//html = html.replace('<link rel="stylesheet/less" href="../less/inviscss.less" media="all" type="text/css" />', '<link rel="stylesheet" href="../css/inviscss.min.css" media="all" type="text/css" />');
	//html = html.replace('rel="stylesheet/less" href="../less/inviscss.less"', 'rel="stylesheet" href="../css/inviscss.min.css"');
	html = html.replace(/rel="stylesheet\/less"/g, 'rel="stylesheet"');
	html = html.replace(/less\//g, 'css/');
	html = html.replace(/themes\//g, 'css/');
	html = html.replace(/\.less/g, '.min.css');
	html = html.replace(/<!--build:rm-begin[\w\W]*?build:rm-end-->/g, '');
	fs.writeFileSync(file, html);
});

var cmds = [ ];
function less(lessname) {
	var dst = path.join('dist', 'css', path.basename(lessname, '.less'));

	cmds.push('node ' + path.join('node_modules','.bin','lessc') + ' ' + lessname + ' ' + dst + '.css ' + process.env.npm_package_config_less_options)
	cmds.push('node ' + path.join('node_modules','.bin','lessc') + ' ' + lessname + ' ' + dst + '.min.css ' + process.env.npm_package_config_less_min_options)
};
//console.log(process.env)
less('less/inviscss.less');

// also compile the theme files
getFiles(path.join(__dirname, 'themes'), '.less').forEach(function(file) {
	less(file);	
})

execSeries(cmds, function(err) {
	if (err) console.error(err);
})
})();