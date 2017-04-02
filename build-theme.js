// build process for inviscss themes
(function(){
"use strict";

var fs = require("fs");
var path = require("path");
var execSeries = require("./build-tools").execSeries;

var skip_zip = process.argv.indexOf('--no-zip')>=0;
if (skip_zip)
	console.log("Skipping ZIP")


var cmds = [ ];

var target = process.cwd();
var src_dir = __dirname;

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
var less_name = path.join(target, 'dist', 'less', theme_name+'.less');
var css_name_no_ext = path.join(target, 'dist', 'css', theme_name);
addCommand('mkdir -p dist && rm -rf dist/*', target)
addCommand('cp -fpR dist/* '+path.join(target, 'dist',''), src_dir); // copy inviscss files to target folder
addCommand('rm -rf dist/css/*', target); // remove inviscss css files we don't need
addCommand('cp -fp '+path.join('..','theme-base.less')+ ' dist/less', target); // copy base theme
addCommand('cp -fp *.less dist/less', target); // copy theme's less file(s)

// copy normalise.css
var normal_path = path.join('node_modules','normalize.css');
var normal_css = path.join(normal_path,'normalize.css');
addCommand('mkdir -p '+path.join(target,'dist', normal_path)+' 2> /dev/null || true')
addCommand('cp -fp '+path.join(src_dir,normal_css)+ ' ' + path.join(target, 'dist', normal_css)); 

// run less compiler
var lessc = 'node ' + path.join(src_dir, 'node_modules','.bin','lessc'); 
addCommand(lessc + ' ' + less_name + ' ' + css_name_no_ext + '.css ' + process.env.npm_package_config_less_options)
addCommand(lessc + ' ' + less_name + ' ' + css_name_no_ext + '.min.css ' + process.env.npm_package_config_less_min_options)

// copy theme css to docs folder
addCommand('cp -fp dist/css/* ../../docs/themes/', target)


if (!skip_zip) {
	// zip -rq dist-zip/$npm_package_config_theme-$npm_package_version.zip dist/*
	addCommand('zip -rq ../../../dist-zip/'+theme_name+'-'+process.env.npm_package_version+'.zip js/* css/* less/* fonts/* README.md', path.join(target, 'dist'))
}


//console.log(cmds)
console.log("Building " + theme_name);
execSeries(cmds, function(err) {
	if (err) return console.error(err);
	prepFile(path.join(src_dir, 'themes/_common/package_dist.json'), path.join(target, 'dist/package.json'), base_theme_name)
	prepFile(path.join(src_dir, 'themes/_common/README.md'), path.join(target, 'dist/README.md'), base_theme_name)
})

})();
