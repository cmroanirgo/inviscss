// build process for inviscss
(function(){
"use strict";

var fs = require("fs");
var path = require("path");

// remove references to less in the dmeo html
var files = "index,nav".split(',').forEach(function(filebase) {
	var file = path.join(__dirname, 'dist', 'demo', filebase + '.html');
	var html = fs.readFileSync(file, 'utf8');
	html = html.replace('<link rel="stylesheet/less" href="../less/inviscss.less" media="all" type="text/css" />', '<link rel="stylesheet" href="../css/inviscss.min.css" media="all" type="text/css" />');
	html = html.replace(/<!--build:rm-begin[\w\W]*build:rm-end-->/, '');
	fs.writeFileSync(file, html)

})

})();