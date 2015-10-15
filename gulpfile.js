var path = require('path');

var glob = require('glob');

var gulp = require('gulp');
var plumber = require('gulp-plumber');
var rename = require("gulp-rename");
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

var app = require('./app');

var commandLineOption = require('./command-line-option');

/*===========================================*/
/*================Livereload=================*/
/*===========================================*/

var reloadDelay = 500;
var lastReloadTimestamp = 0;

var browserYetOpen = commandLineOption.noOpen;

gulp.task('connect', function() {
  connect.server({
	root: app.path.build,
	livereload: true
  });
});

gulp.task('livereload', function() {
	var currentTimestamp = Date.now();

	if (currentTimestamp - lastReloadTimestamp >= reloadDelay) {
		gulp.src(app.path.server)
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

gulp.task('pre-jade', function () {
	mkdirp(app.path.build);
});

var jadeFileToBuild = [];
jadeFileToBuild.push(app.path.pageJade);

jadeBuildDestPath = path.join(app.path.build, '{basename}{extension}');

//define variables accessible in the jade files
var jadeGlobalVariables = {
	utils : require(app.path.jadeUtils),
	commandLineOption : commandLineOption,
};

var jadePlaceholder = {};

jadePlaceholder['component'] = app.path.componentJade;
jadePlaceholder['entity'] = app.path.entityJade;
jadePlaceholder['entity-override'] = app.path.entityOverrideJade;

var jadeLayoutFileList = glob.sync(app.path.layoutJade);

_.forEach(jadeLayoutFileList, function(file) {
	var name = path.basename(file, '.jade');
	jadePlaceholder[name+'-layout'] = path.normalize(file);
});

gulp.task('jade', ['pre-jade'], function () {
	gulp.src(jadeFileToBuild)
		.pipe(plumber())
		.pipe(header('include {component}\n'))
		.pipe(header('include {entity}\n'))
		.pipe(header('include {entity-override}\n'))
		.pipe(jadeGlobbing({
			placeholder: jadePlaceholder
		}))
		.pipe(jade({
			locals: jadeGlobalVariables,
			pretty : '\t'
		}))
		.pipe(out(jadeBuildDestPath))
});

var jadeFileToWatch = [];
jadeFileToWatch.push(app.path.componentJade);
jadeFileToWatch.push(app.path.entityJade);
jadeFileToWatch.push(app.path.entityOverrideJade);
jadeFileToWatch.push(app.path.layoutJade);
jadeFileToWatch.push(app.path.pageJade);

gulp.task('watch-jade', function () {
	watch(jadeFileToWatch, batch(function (events, done) {
		gulp.start('jade', done);
	}));
});

/*===========================================*/
/*===============Stylus task=================*/
/*===========================================*/

gulp.task('pre-stylus', function () {
	mkdirp(app.path.stylesheet);
});

var stylusFileToBuild = [];
stylusFileToBuild.push(app.path.stylusMain);

var stylusFileToWatch = [];
stylusFileToWatch.push(app.path.stylusAll);
stylusFileToWatch.push(app.path.libStylus);
stylusFileToWatch.push(app.path.componentStylus);
stylusFileToWatch.push(app.path.entityStylus);
stylusFileToWatch.push(app.path.entityOverrideStylus);
stylusFileToWatch.push(app.path.layoutStylus);
stylusFileToWatch.push(app.path.pageStylus);

var stylusBuildDestPath = path.join(app.path.stylesheet, '{basename}{extension}');

gulp.task('stylus', ['pre-stylus'], function () {
    gulp.src(stylusFileToBuild)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(stylus({
            use: [nib(), jeet()],
            compress: true
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(out(stylusBuildDestPath))
});

gulp.task('watch-stylus', function () {
	watch(stylusFileToWatch, batch(function (events, done) {
		gulp.start('stylus', done);
	}));
});

// /*===========================================*/
// /*=============Javascript task===============*/
// /*===========================================*/

gulp.task('pre-script', function () {
	mkdirp(app.path.javascript);
});

var scriptFileToBuild = [];
scriptFileToBuild.push(app.path.libScript);
scriptFileToBuild.push(app.path.componentScript);
scriptFileToBuild.push(app.path.entityScript);
scriptFileToBuild.push(app.path.entityOverrideScript);
scriptFileToBuild.push(app.path.layoutScript);
scriptFileToBuild.push(app.path.pageScript);
scriptFileToBuild.push(app.path.mainScript);

var scriptFileToWatch = [];
scriptFileToWatch.push(app.path.libScript);
scriptFileToWatch.push(app.path.componentScript);
scriptFileToWatch.push(app.path.entityScript);
scriptFileToWatch.push(app.path.entityOverrideScript);
scriptFileToWatch.push(app.path.layoutScript);
scriptFileToWatch.push(app.path.pageScript);
scriptFileToWatch.push(app.path.mainScript);

var scriptBuildDestPath = path.join(app.path.javascript, '{basename}{extension}');
var scriptSingleFileTempDestPath = path.join(app.path.singleFileScript, '{basename}{extension}');

var scriptAllTaskList = ['script', 'script-vendor'];

if (commandLineOption.scriptSingleFile) {
	scriptAllTaskList.push('script-single-file');
}

gulp.task('script-all', scriptAllTaskList, function () {
	gulp.src(app.path.fallbackScript)
		.pipe(plumber())
		.pipe(out(scriptBuildDestPath));
});

gulp.task('script', ['pre-script'], function () {
    var stream = gulp.src(scriptFileToBuild)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(concat('main.min.js'))
    
    if(commandLineOption.prod) {
    	stream = stream.pipe(uglify({
            compress: {
                negate_iife: false
            }
        }))
    }

    stream = stream.pipe(sourcemaps.write('.'))
        .pipe(out(scriptBuildDestPath));

    if (commandLineOption.scriptSingleFile) {
    	stream
    		.pipe(rename('01.js'))
    		.pipe(out(scriptSingleFileTempDestPath))
    }

});

gulp.task('script-vendor', ['pre-script'], function () {
    var stream = gulp.src(app.path.vendorScript)
        .pipe(browserify({
          insertGlobals : true
        }))
        .pipe(uglify({
            compress: {
                negate_iife: false
            }
        }))
        .pipe(out(scriptBuildDestPath))

    if (commandLineOption.scriptSingleFile) {
    	stream
    		.pipe(rename('02.js'))
    		.pipe(out(scriptSingleFileTempDestPath))
    }
});

gulp.task('script-single-file', ['pre-script'], function() {
	gulp.src(app.path.singleFileScriptAll)
		.pipe(plumber())
		.pipe(concat('all.min.js'))
		.pipe(uglify({
            compress: {
                negate_iife: false
            }
        }))
        .pipe(out(scriptBuildDestPath))
});

gulp.task('watch-script', function () {
	watch(scriptFileToWatch, batch(function (events, done) {
		gulp.start('script', done);
	}));
});

// /*===========================================*/
// /*===========================================*/
// /*===========================================*/

var imageToBuild = [];
imageToBuild.push(app.path.imageAll);
imageToBuild.push(app.path.libImageAll);
imageToBuild.push(app.path.componentImageAll);
imageToBuild.push(app.path.layoutImageAll);
imageToBuild.push(app.path.pageImageAll);

var imageBuildDestPath = path.join(app.path.build, 'asset');

gulp.task('image-min', function () {
	if (!commandLineOption.noImageMin) {
		gulp.src(imageToBuild)
        .pipe(plumber())
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(imageBuildDestPath));
	}
});

// /*===========================================*/
// /*==================Fonts====================*/
// /*===========================================*/

var fontBuildDestPath = path.join(app.path.build, 'asset');

var fontList = [];
_.forEach(app.configuration.font.formatList, function(format) {
	fontList.push(path.join(app.path.font, '*.'+format));
});

gulp.task('font', function () {
	gulp.src(fontList)
		.pipe(plumber())
		.pipe(gulp.dest(fontBuildDestPath));
});

/*===========================================*/
/*===========================================*/
/*===========================================*/

/*---------------*/
var buildSubTaskList = ['font', 'image-min', 'jade', 'stylus', 'script-all'];
gulp.task('build', buildSubTaskList);
/*--------------*/

gulp.task('watch', ['build', 'watch-jade', 'watch-stylus', 'watch-script']);

gulp.task('server', ['watch', 'connect', 'open-once']);

gulp.task('server-livereload', ['server'], function () {
	watch(app.path.server, batch(function (events, done) {
		gulp.start('livereload', done);
	}))
});

gulp.task('default', ['build']);