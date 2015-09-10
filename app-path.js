'use strict';

var path = require('path');

var appPath = {};

appPath.configuration = path.join(__dirname, 'configuration');

appPath.source = path.join(__dirname, 'sources');

appPath.script = path.join(appPath.source, 'script');
appPath.stylus = path.join(appPath.source, 'stylus');
appPath.jade = path.join(appPath.source, 'jade');

appPath.mainScript = path.join(appPath.script, 'main.js');
appPath.fallbackScript = path.join(appPath.script, 'fallback.min.js');
appPath.vendorScript = path.join(appPath.script, 'vendor.js');
appPath.singleFileScript = path.join(appPath.script, 'single-file');
appPath.singleFileScriptAll = path.join(appPath.singleFileScript, '*.js');

appPath.stylusMain = path.join(appPath.stylus, 'main.styl');
appPath.stylusAll = path.join(appPath.stylus, '*.styl');

appPath.jadeUtils = path.join(appPath.jade, 'utils.js');

appPath.asset = path.join(appPath.source, 'asset');
appPath.image = path.join(appPath.asset, 'image');
appPath.imageAll = path.join(appPath.image, '**/*.*');
appPath.font = path.join(appPath.asset, 'font');

appPath.lib = path.join(appPath.source, 'lib');
appPath.libAll = path.join(appPath.lib, '*');
appPath.libScript = path.join(appPath.libAll, '*.js');
appPath.libStylus = path.join(appPath.libAll, '*.styl');
appPath.libTask = path.join(appPath.libAll, 'task');
appPath.libTaskAll = path.join(appPath.libTask, '*.js');
appPath.libAsset = path.join(appPath.libAll, 'asset');
appPath.libImage = path.join(appPath.libAsset, 'image');
appPath.libImageAll = path.join(appPath.libImage, '**/*.*');

appPath.component = path.join(appPath.source, 'component');
appPath.componentAll = path.join(appPath.component, '*');
appPath.componentJade = path.join(appPath.componentAll, '*.jade');
appPath.componentStylus = path.join(appPath.componentAll, '*.styl');
appPath.componentScript = path.join(appPath.componentAll, '*.js');
appPath.componentAsset = path.join(appPath.componentAll, 'asset');
appPath.componentImage = path.join(appPath.componentAsset, 'image');
appPath.componentImageAll = path.join(appPath.componentImage, '**/*.*');

appPath.layout = path.join(appPath.source, 'layout');
appPath.layoutAll = path.join(appPath.layout, '*');
appPath.layoutJade = path.join(appPath.layoutAll, '*.jade');
appPath.layoutStylus = path.join(appPath.layoutAll, '*.styl');
appPath.layoutScript = path.join(appPath.layoutAll, '*.js');
appPath.layoutAsset = path.join(appPath.layoutAll, 'asset');
appPath.layoutImage = path.join(appPath.layoutAsset, 'image');
appPath.layoutImageAll = path.join(appPath.layoutImage, '**/*.*');

appPath.page = path.join(appPath.source, 'page');
appPath.pageAll = path.join(appPath.page, '*');
appPath.pageJade = path.join(appPath.pageAll, '*.jade');
appPath.pageStylus = path.join(appPath.pageAll, '*.styl');
appPath.pageScript = path.join(appPath.pageAll, '*.js');
appPath.pageAsset = path.join(appPath.pageAll, 'asset');
appPath.pageImage = path.join(appPath.pageAsset, 'image');
appPath.pageImageAll = path.join(appPath.pageImage, '**/*.*');

/*----------------------------------------------------*/

appPath.build = path.join(__dirname, 'build');

appPath.server = path.join(appPath.build, '**');

appPath.stylesheet = path.join(appPath.build, 'stylesheet');
appPath.javascript = path.join(appPath.build, 'javascript');

module.exports = appPath;