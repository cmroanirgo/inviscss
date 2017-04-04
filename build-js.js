// build process for JS files
(function(){
"use strict";

var fs = require("fs");
var path = require("path");
var execSeries = require("./build-tools").execSeries;
var args = process.argv.slice(2);
if (!args.length || args[0].indexOf('.js')<0) {
	throw new SyntaxError('build-js.js expected a "filename.js" file as the first argument')
}

var cmds = [ ];

var target = process.cwd();
var src_dir = __dirname;
var js_name = path.join(target, args[0])
var js_min = js_name.replace('.js', '.min.js');

function addCommand(str, working_dir) {
	var cmd = { cmd:str };
	if (working_dir)
		cmd.cwd = working_dir;
	cmds.push(cmd);
}

// run uglifier: uglifyjs js/inviscss.js -c -m --comments -o js/inviscss.min.js
var uglifyjs = 'node ' + path.join(src_dir, 'node_modules','.bin','uglifyjs'); 
addCommand(uglifyjs + ' ' + js_name + ' -c -m --comments -o ' + js_min)

//console.log(cmds)
console.log("Building js: " + args[0]);
execSeries(cmds, function(err) {
	if (err) { return console.error(err); throw err; }
})

})();
