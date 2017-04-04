// build process for LESS files
(function(){
"use strict";

var fs = require("fs");
var path = require("path");
var execSeries = require("./build-tools").execSeries;
var args = process.argv.slice(2);
if (!args.length || args[0].indexOf('.less')<0) {
	throw new SyntaxError('build-less.js expected a "filename.less" file as the first argument')
}

var cmds = [ ];

var target = process.cwd();
var src_dir = __dirname;
var less_name = path.join(target, args[0])
var css_name_no_ext = path.join(path.dirname(less_name), path.basename(less_name, '.less')).replace(/less/g, 'css');

function addCommand(str, working_dir) {
	var cmd = { cmd:str };
	if (working_dir)
		cmd.cwd = working_dir;
	cmds.push(cmd);
}

// run less compiler
var lessc = 'node ' + path.join(src_dir, 'node_modules','.bin','lessc'); 
var root_pkg = require(path.join(src_dir, 'package.json'));

// NB: run in src_dir so that 'browserlist' file is automatically picked up and used.
addCommand(lessc + ' ' + less_name + ' ' + css_name_no_ext + '.css ' + root_pkg.config.less_options, src_dir)
addCommand(lessc + ' ' + less_name + ' ' + css_name_no_ext + '.min.css ' + root_pkg.config.less_min_options, src_dir)

//console.log(cmds)
console.log("Building less: " + args[0]);
execSeries(cmds, function(err) {
	if (err) { return console.error(err); throw err; }
})

})();
