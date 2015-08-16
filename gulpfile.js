var path = require('path');

var gulp = require('gulp');
var plumber = require('gulp-plumber');
var out = require('gulp-out');
var sourcemaps = require('gulp-sourcemaps');

var jade = require('gulp-jade');
var jadeGlobbing  = require('gulp-jade-globbing');
var replace = require('gulp-replace');

var stylus = require('gulp-stylus');
var nib = require('nib');
var jeet = require('jeet');

var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var browserify = require('gulp-browserify');

var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');

var watch = require('gulp-watch');
var batch = require('gulp-batch');

var open = require('open');
var connect = require('gulp-connect');

var header = require('gulp-header');

var mkdirp = require('mkdirp');

var _ = require('lodash');

/*----------replace example---------*/
/*
var blockRegex = /[\n\r]+(\t*)\<([\w\-]+)\>[\n\r]+/g;
var blockInclude = '\n$1include '+path.join("../../page-block", '$2.jade\n');

.pipe(replace(blockRegex, blockInclude))
*/
/*---------------------------------*/

/*===========================================*/
/*===========================================*/
/*===========================================*/

var appPath = {};

appPath.source = path.join(__dirname, 'sources');
appPath.javascript = path.join(appPath.source, 'javascript');
appPath.stylus = path.join(appPath.source, 'stylus');

var assetPath = path.join(sourcePath, 'asset'),
	imagePath = path.join(assetPath, 'image'),
	fontPath = path.join(assetPath, 'font');

var libPath = path.join(sourcePath, 'lib'),
	libAllPath = path.join(libPath, '*'),
	libJavascriptPath = path.join(libAllPath, '*.js'),
	libStylusPath = path.join(libAllPath, '*.styl'),
	libTaskPath = path.join(libAllPath, 'task'),
	libTaskAllPath = path.join(libTaskPath, '*.js');

var componentPath = path.join(sourcePath, 'component'),
	componentAllPath = path.join(componentPath, '*'),
	componentAssetPath = path.join(componentAllPath, 'asset'),
	componentImagePath = path.join(componentAssetPath, 'image'),
	componentFontPath = path.join(componentAssetPath, 'font'),
	componentJadePath = path.join(componentAllPath, '*.jade');

var pageBlockPath = path.join(sourcePath, 'page-block');
var layoutPath = path.join(sourcePath, 'layout');
var pagePath = path.join(sourcePath, 'page');



/*----------------------------------------------------*/

var buildPath = path.join(__dirname, 'build');

var stylesheetBuildPath = path.join(buildPath, 'stylesheet');
var javascriptBuildPath = path.join(buildPath, 'javascript');

/*===========================================*/
/*================Livereload=================*/
/*===========================================*/

var reloadDelay = 500;
var lastReloadTimestamp = 0;

var commandLineOptionIndex = {
	noOpen : _.contains(process.argv, "-no-open"),
	noImage : _.contains(process.argv, "-no-image"),
	prod : _.contains(process.argv, "-prod")
};

var browserYetOpen = commandLineOptionIndex.noOpen;

var serverFilesToReload = [];
serverFilesToReload.push(path.join(buildPath, '**'));

gulp.task('connect', function() {
  connect.server({
	root: path.join(buildPath, 'page'),
	livereload: true
  });
});

gulp.task('livereload', function() {
	var currentTimestamp = Date.now();

	if (currentTimestamp - lastReloadTimestamp >= reloadDelay) {
		gulp.src(serverFilesToReload)
		.pipe(plumber())
		.pipe(connect.reload());
	}

	gulp.start('open-once')

	lastReloadTimestamp = currentTimestamp;
});

gulp.task('open-once', function () {
	if (!browserYetOpen) {
		open('http://localhost:8080');
		browserYetOpen = true;
	}
});

/*===========================================*/
/*================Jade task==================*/
/*===========================================*/

var pageJadeAll = path.join(pagePath, '*/*.jade');
var componentJadeAll = path.join(componentPath, '*/*.jade');
var layoutJadeAll = path.join(layoutPath, '*/*.jade');

var pageBlockPath = path.join(sourcePath, 'page-block/');
var pageBlockAll = path.join(pageBlockPath, '*.jade');

var jadeFileToWatch = [];
jadeFileToWatch.push(layoutJadeAll);
jadeFileToWatch.push(pageJadeAll);
jadeFileToWatch.push(componentJadeAll);
jadeFileToWatch.push(pageBlockAll);

var jadeFileToRender = [];
jadeFileToRender.push(pageJadeAll);

jadeRenderDestPath = path.join(pageBuildDirectoryPath, '{basename}{extension}');

//define variables accessible in the jade files
var JadeGlobalVariables = {
	lib : require('.lib/jade'),
	commandLineOptionIndex : commandLineOptionIndex,
};

gulp.task('jade', ['pre-jade'], function () {
	gulp.src(jadeFileToRender)
		.pipe(plumber())
		.pipe(header('include {component}\n'))
		.pipe(jadeGlobbing({
			placeholder: {
				'component': componentJadeAll,
				'default-layout': path.join(layoutPath, 'default/default.jade'),
				'default-layout-footer-collapse': path.join(layoutPath, 'default/default-footer-collapse.jade'),
				'page-block' : pageBlockPath
			}
		}))
		.pipe(jade({
			locals: JadeGlobalVariables,
			pretty : '    '
		}))
		.pipe(out(jadeRenderDestPath))
});

/*===========================================*/
/*===============Stylus task=================*/
/*===========================================*/

var stylusPath = path.join(sourcePath, 'stylus');
var stylusMainFile = path.join(stylusPath, 'main.styl');

var pageStylusAll = path.join(pagePath, '*/*.styl');
var componentStylusAll = path.join(componentPath, '*/*.styl');
var layoutStylusAll = path.join(layoutPath, '*/*.styl');
var libStylusAll = path.join(stylusPath, 'lib/*.styl');

var stylusFilesToRender = [];
stylusFilesToRender.push(stylusMainFile);

var stylusFilesToWatch = [];
stylusFilesToWatch.push(stylusMainFile);
stylusFilesToWatch.push(pageStylusAll);
stylusFilesToWatch.push(componentStylusAll);
stylusFilesToWatch.push(layoutStylusAll);
stylusFilesToWatch.push(libStylusAll);

var stylusRenderDestPath = path.join(stylesheetBuildDirectoryPath, '{basename}{extension}');

gulp.task('stylus', ['pre-stylus'], function () {
    gulp.src(stylusFilesToRender)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(stylus({
            use: [nib(), jeet()],
            compress: true
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(out(stylusRenderDestPath))
});

/*===========================================*/
/*=============Javscript task================*/
/*===========================================*/

var pageScriptAll = path.join(pagePath, '*/*.js');
var componentScriptAll = path.join(componentPath, '*/*.js');
var layoutScriptAll = path.join(layoutPath, '*/*.js');
var scriptClasseAll = path.join(javascriptPath, 'classe/*.js');
var scriptLibAll = path.join(javascriptPath, 'lib/*.js');

var scriptMainFile = path.join(javascriptPath, 'main.js');

var scriptFilesToConcat = [];
scriptFilesToConcat.push(scriptLibAll);
scriptFilesToConcat.push(scriptClasseAll);
scriptFilesToConcat.push(componentScriptAll);
scriptFilesToConcat.push(layoutScriptAll);
scriptFilesToConcat.push(pageScriptAll);
scriptFilesToConcat.push(scriptMainFile);

var scriptFilesToWatch = [];
scriptFilesToWatch.push(scriptClasseAll);
scriptFilesToWatch.push(componentScriptAll);
scriptFilesToWatch.push(layoutScriptAll);
scriptFilesToWatch.push(pageScriptAll);
scriptFilesToWatch.push(scriptMainFile);
scriptFilesToWatch.push(scriptLibAll);

var javascriptRenderDestPath = path.join(javascriptBuildDirectoryPath, '{basename}{extension}');

var fallbackPath = path.join(javascriptPath, 'fallback.min.js');

gulp.task('javascript-full', ['javascript', 'javascript-bundle'], function () {
	gulp.src(fallbackPath)
		.pipe(plumber())
		.pipe(out(javascriptRenderDestPath));
});

gulp.task('javascript', ['pre-javascript'], function () {
    var temp = gulp.src(scriptFilesToConcat)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(concat('main.min.js'))
    
    if(commandLineOptionIndex.prod) {
    	temp = temp.pipe(uglify({
            compress: {
                negate_iife: false
            }
        }))
    }

    temp.pipe(sourcemaps.write('.'))
        .pipe(out(javascriptRenderDestPath));
});

var javascriptBundlePath = path.join(javascriptPath, 'bundle');
var javascriptBundleIndexPath = path.join(javascriptBundlePath, 'bundle.js');
var javascriptBundleAll = path.join(javascriptBundlePath, '*.js');

gulp.task('javascript-bundle', ['pre-javascript'], function () {
    gulp.src(javascriptBundleIndexPath)
        .pipe(browserify({
          insertGlobals : true
        }))
        .pipe(uglify({
            compress: {
                negate_iife: false
            }
        }))
        .pipe(out(javascriptRenderDestPath))
});

/*===========================================*/
/*===========================================*/
/*===========================================*/

var imagesAll = [];
imagesAll.push(path.join(sourcePath, ('image/final/**')));

var imageRenderDestPath = path.join(pageBuildDirectoryPath, 'image');

gulp.task('image-min', function () {
	if (!commandLineOptionIndex.noImage) {
		gulp.src(imagesAll)
        .pipe(plumber())
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(imageRenderDestPath));
	}
});

/*===========================================*/
/*==================Fonts====================*/
/*===========================================*/

var fontPath = path.join(sourcePath, 'font');

var fontsList = [];
fontsList.push(path.join(fontPath, '*.eot'));
fontsList.push(path.join(fontPath, '*.svg'));
fontsList.push(path.join(fontPath, '*.ttf'));
fontsList.push(path.join(fontPath, '*.woff'));
fontsList.push(path.join(fontPath, '*.woff2'));

var fontCopyDestPath = path.join(pageBuildDirectoryPath, 'font');

gulp.task('font', function () {
	gulp.src(fontsList)
		.pipe(plumber())
		.pipe(gulp.dest(fontCopyDestPath));
});

/*===========================================*/
/*===========================================*/
/*===========================================*/

gulp.task('pre-jade', function () {
	mkdirp(pageBuildDirectoryPath);
});

gulp.task('pre-stylus', function () {
	mkdirp(stylesheetBuildDirectoryPath);
});

gulp.task('pre-javascript', function () {
	mkdirp(javascriptBuildDirectoryPath);
});

/*---------------*/
var buildSubTaskList = ['font', 'image-min', 'jade', 'stylus', 'javascript-full'];
gulp.task('build', buildSubTaskList);
/*--------------*/

gulp.task('watch-javascript-full', ['javascript-full', 'watch-javascript', 'watch-javascript-bundle']);

gulp.task('watch-javascript', function () {
	watch(scriptFilesToWatch, batch(function (events, done) {
		gulp.start('javascript', done);
	}));
});

gulp.task('watch-javascript-bundle', function () {
	watch(javascriptBundleAll, batch(function (events, done) {
		gulp.start('javascript-bundle', done);
	}));
});

gulp.task('watch-jade', function () {
	watch(jadeFileToWatch, batch(function (events, done) {
		gulp.start('jade', done);
	}));
});

gulp.task('watch-stylus', function () {
	watch(stylusFilesToWatch, batch(function (events, done) {
		gulp.start('stylus', done);
	}));
});

gulp.task('watch', ['build', 'watch-jade', 'watch-stylus', 'watch-javascript-full']);

gulp.task('server', ['watch', 'connect', 'open-once']);

gulp.task('server-livereload', ['server'], function () {
	watch(serverFilesToReload, batch(function (events, done) {
		gulp.start('livereload', done);
	}))
});

gulp.task('default', ['build']);