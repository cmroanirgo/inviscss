// build process for JS files
(function(){
"use strict";

var fs = require("fs");
var path = require("path");
var execSeries = require("./build-tools").execSeries;


var cmds = [ ];

var target = process.cwd();
var pkg = require(path.join(target, 'package.json'));
//var src_dir = __dirname;


function addCommand(str, working_dir) {
	var cmd = { cmd:str };
	if (working_dir)
		cmd.cwd = working_dir;
	cmds.push(cmd);
}

addCommand('mkdir -p ../../dist-zip && rm ../../dist-zip/'+pkg.name+'-*.zip || true', target)
addCommand('zip -rq ../../dist-zip/'+pkg.name+'-'+pkg.version+'.zip js/* css/* less/* fonts/* README.md package.json', target)

//console.log(cmds)
console.log("Zipping: " + pkg.name);
execSeries(cmds, function(err) {
	if (err) { return console.error(err); throw err; }
})

})();
