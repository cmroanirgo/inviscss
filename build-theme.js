// build process for inviscss themes
(function(){
"use strict";

var fs = require("fs");
var path = require("path");
var execSeries = require("./build-tools").execSeries;



var cmds = [ ];

var target = process.cwd();
var src_dir = __dirname;
var pkg = require(path.join(target, 'package.json'));

function addCommand(str, working_dir) {
	var cmd = { cmd:str };
	if (working_dir)
		cmd.cwd = working_dir;
	cmds.push(cmd);
}

function prepFile(sourceFile, destFile, base_theme_name) {
	// make a package.json/README.md
	var txt = fs.readFileSync(sourceFile, 'utf8');
	txt = txt.replace(/\{\{base_theme_name\}\}/g, base_theme_name);
	txt = txt.replace(/\{\{version\}\}/g, process.env.npm_package_version); // only for 
	fs.writeFileSync(destFile, txt);
}


var base_theme_name = path.basename(target);
var theme_name = 'inviscss-' + base_theme_name;
if (theme_name!=pkg.name) {
	throw new SyntaxError("Unexpected error in '"+target+"'. package.name!='"+theme_name+"' (got '"+pkg.name+"')")
}
var base_dir = path.join(target, 'node_modules/inviscss')
addCommand('cp -fpR js ../..', base_dir); // copy inviscss js files to target folder
addCommand('cp -fpR fonts ../..', base_dir); // copy inviscss font files to target folder

// run less compiler
var less_name = path.join(target, 'less', theme_name+'.less');
var css_name_no_ext = path.join(target, 'css', theme_name);
var lessc = 'node ' + path.join(src_dir, 'node_modules','.bin','lessc'); 
addCommand(lessc + ' ' + less_name + ' ' + css_name_no_ext + '.css ' + process.env.npm_package_config_less_options)
addCommand(lessc + ' ' + less_name + ' ' + css_name_no_ext + '.min.css ' + process.env.npm_package_config_less_min_options)


//console.log(cmds)
console.log("Building " + theme_name);
execSeries(cmds, function(err) {
	if (err) return console.error(err);
	prepFile(path.join(src_dir, 'themes/_common/README.md'), path.join(target, 'README.md'), base_theme_name)
})

})();
