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

var app = require('./app-path');
var config = require(app.configuration);
var commandLineOption = require('./command-line-option');

/*===========================================*/
/*================Livereload=================*/
/*===========================================*/

var reloadDelay = 500;
var lastReloadTimestamp = 0;

var browserYetOpen = commandLineOption.noOpen;

gulp.task('connect', function() {
  connect.server({
	root: app.build,
	livereload: true
  });
});

gulp.task('livereload', function() {
	var currentTimestamp = Date.now();

	if (currentTimestamp - lastReloadTimestamp >= reloadDelay) {
		gulp.src(app.server)
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
	mkdirp(app.build);
});

var jadeFileToBuild = [];
jadeFileToBuild.push(app.pageJade);

jadeBuildDestPath = path.join(app.build, '{basename}{extension}');

//define variables accessible in the jade files
var jadeGlobalVariables = {
	utils : require(app.jadeUtils),
	commandLineOption : commandLineOption,
};

var jadePlaceholder = {
	'component': app.componentJade
};

var jadeLayoutFileList = glob.sync(app.layoutJade);

_.forEach(jadeLayoutFileList, function(file) {
	var name = path.basename(file, '.jade');
	jadePlaceholder[name+'-layout'] = path.normalize(file);
});

gulp.task('jade', ['pre-jade'], function () {
	gulp.src(jadeFileToBuild)
		.pipe(plumber())
		.pipe(header('include {component}\n'))
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
jadeFileToWatch.push(app.componentJade);
jadeFileToWatch.push(app.layoutJade);
jadeFileToWatch.push(app.pageJade);

console.log(jadeFileToWatch);

gulp.task('watch-jade', function () {
	watch(jadeFileToWatch, batch(function (events, done) {
		gulp.start('jade', done);
	}));
});

/*===========================================*/
/*===============Stylus task=================*/
/*===========================================*/

gulp.task('pre-stylus', function () {
	mkdirp(app.stylesheet);
});

var stylusFileToBuild = [];
stylusFileToBuild.push(app.stylusMain);

var stylusFileToWatch = [];
stylusFileToWatch.push(app.stylusAll);
stylusFileToWatch.push(app.libStylus);
stylusFileToWatch.push(app.componentStylus);
stylusFileToWatch.push(app.layoutStylus);
stylusFileToWatch.push(app.pageStylus);

var stylusBuildDestPath = path.join(app.stylesheet, '{basename}{extension}');

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
	mkdirp(app.javascript);
});

var scriptFileToBuild = [];
scriptFileToBuild.push(app.libScript);
scriptFileToBuild.push(app.componentScript);
scriptFileToBuild.push(app.layoutScript);
scriptFileToBuild.push(app.pageScript);
scriptFileToBuild.push(app.mainScript);

var scriptFileToWatch = [];
scriptFileToWatch.push(app.libScript);
scriptFileToWatch.push(app.componentScript);
scriptFileToWatch.push(app.layoutScript);
scriptFileToWatch.push(app.pageScript);
scriptFileToWatch.push(app.mainScript);

var scriptBuildDestPath = path.join(app.javascript, '{basename}{extension}');
var scriptSingleFileTempDestPath = path.join(app.singleFileScript, '{basename}{extension}');

var scriptAllTaskList = ['script', 'script-vendor'];

if (commandLineOption.scriptSingleFile) {
	scriptAllTaskList.push('script-single-file');
}

gulp.task('script-all', scriptAllTaskList, function () {
	gulp.src(app.fallbackScript)
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
    var stream = gulp.src(app.vendorScript)
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
	gulp.src(app.singleFileScriptAll)
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
imageToBuild.push(app.imageAll);
imageToBuild.push(app.libImageAll);
imageToBuild.push(app.componentImageAll);
imageToBuild.push(app.layoutImageAll);
imageToBuild.push(app.pageImageAll);

var imageBuildDestPath = path.join(app.build, 'asset');

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

var fontBuildDestPath = path.join(app.build, 'asset');

var fontList = [];
_.forEach(config.font.formatList, function(format) {
	fontList.push(path.join(app.font, '*.'+format));
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
	watch(app.server, batch(function (events, done) {
		gulp.start('livereload', done);
	}))
});

gulp.task('default', ['build']);