'use strict';

var path = require('path');

var app = {};

app.configuration = path.join(__dirname, 'configuration');

app.source = path.join(__dirname, 'sources');

app.script = path.join(app.source, 'script');
app.stylus = path.join(app.source, 'stylus');
app.jade = path.join(app.source, 'jade');

app.mainScript = path.join(app.script, 'main.js');
app.fallbackScript = path.join(app.script, 'fallback.min.js');
app.vendorScript = path.join(app.script, 'vendor.js');
app.singleFileScript = path.join(app.script, 'single-file');
app.singleFileScriptAll = path.join(app.singleFileScript, '*.js');

app.stylusMain = path.join(app.stylus, 'main.styl');
app.stylusAll = path.join(app.stylus, '*.styl');

app.jadeUtils = path.join(app.jade, 'utils.js');

app.asset = path.join(app.source, 'asset');
app.image = path.join(app.asset, 'image');
app.imageAll = path.join(app.image, '**/*.*');
app.font = path.join(app.asset, 'font');

app.lib = path.join(app.source, 'lib');
app.libAll = path.join(app.lib, '*');
app.libScript = path.join(app.libAll, '*.js');
app.libStylus = path.join(app.libAll, '*.styl');
app.libTask = path.join(app.libAll, 'task');
app.libTaskAll = path.join(app.libTask, '*.js');
app.libAsset = path.join(app.libAll, 'asset');
app.libImage = path.join(app.libAsset, 'image');
app.libImageAll = path.join(app.libImage, '**/*.*');

app.component = path.join(app.source, 'component');
app.componentAll = path.join(app.component, '*');
app.componentJade = path.join(app.componentAll, '*.jade');
app.componentStylus = path.join(app.componentAll, '*.styl');
app.componentScript = path.join(app.componentAll, '*.js');
app.componentAsset = path.join(app.componentAll, 'asset');
app.componentImage = path.join(app.componentAsset, 'image');
app.componentImageAll = path.join(app.componentImage, '**/*.*');

app.pageBlock = path.join(app.source, 'page-block');
app.pageBlockAll = path.join(app.pageBlock, '*');
app.pageBlockJade = path.join(app.pageBlockAll, '*.jade');
app.pageBlockStylus = path.join(app.pageBlockAll, '*.styl');
app.pageBlockScript = path.join(app.pageBlockAll, '*.js');
app.pageBlockAsset = path.join(app.pageBlockAll, 'asset');
app.pageBlockImage = path.join(app.pageBlockAsset, 'image');
app.pageBlockImageAll = path.join(app.pageBlockImage, '**/*.*');

app.layout = path.join(app.source, 'layout');
app.layoutAll = path.join(app.layout, '*');
app.layoutJade = path.join(app.layoutAll, '*.jade');
app.layoutStylus = path.join(app.layoutAll, '*.styl');
app.layoutScript = path.join(app.layoutAll, '*.js');
app.layoutAsset = path.join(app.layoutAll, 'asset');
app.layoutImage = path.join(app.layoutAsset, 'image');
app.layoutImageAll = path.join(app.layoutImage, '**/*.*');

app.page = path.join(app.source, 'page');
app.pageAll = path.join(app.page, '*');
app.pageJade = path.join(app.pageAll, '*.jade');
app.pageStylus = path.join(app.pageAll, '*.styl');
app.pageScript = path.join(app.pageAll, '*.js');
app.pageAsset = path.join(app.pageAll, 'asset');
app.pageImage = path.join(app.pageAsset, 'image');
app.pageImageAll = path.join(app.pageImage, '**/*.*');

/*----------------------------------------------------*/

app.build = path.join(__dirname, 'build');

app.server = path.join(app.build, '**');

app.stylesheet = path.join(app.build, 'stylesheet');
app.javascript = path.join(app.build, 'javascript');

module.exports = app;