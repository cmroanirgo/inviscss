# InvisCSS theme - {{base_theme_name}}

This theme is a specialisation of the generic css framework: [InvisCSS](https://github.com/cmroanirgo/inviscss).

Theme demos are available [here](https://cmroanirgo.github.io/inviscss/demo/themes.html).

![Theme Preview](https://cmroanirgo.github.io/inviscss/demo/images/{{base_theme_name}}-preview.png)


## Installation - NPM

You can install this theme from npm using:

```
npm install inviscss-{{base_theme_name}}
```

And then include the css and js in your project:

```
<link rel="stylesheet" href="node_modules/inviscss-{{base_theme_name}}/css/inviscss-{{base_theme_name}}.min.css" media="all" type="text/css" />
<script src="node_modules/inviscss-{{base_theme_name}}/js/inviscss.min.js" type="text/javascript"></script>
```

## Installation - CDN

You can use the NPM CDN (unpkg.com) directly, without any installation whatsoever:

```
<link rel="stylesheet" href="https://unpkg.com/inviscss-{{base_theme_name}}/css/inviscss-{{base_theme_name}}.min.css" media="all" type="text/css" />
<script src="https://unpkg.com/inviscss-{{base_theme_name}}" type="text/javascript"></script>
```


## Installation - Download

<p>Rather than using npm, or it's CDN, you can download the latest <code>inviscss-{{base_theme_name}}-xxx.zip</code> from <a href="https://github.com/cmroanirgo/inviscss/releases/latest"><i class="fa fa-github"></i>github.com/cmroanirgo/inviscss</a>.</p>

Then include the css and js directly into your project:

```
<link rel="stylesheet" href="css/inviscss-{{base_theme_name}}.min.css" media="all" type="text/css" />
<script src="js/inviscss.min.js" type="text/javascript"></script>
```

## Building LESS

Both installation versions also include the original <code>.less</code> source files, if you wish to build/ integrate with other systems. You will need to run `npm install` in order to bring in the base [InvisCSS](https://www.npmjs.com/package/inviscss) project (and its dependencies), but this is not needed if using the provided css and js (and font) files.

