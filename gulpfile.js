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
	'component': app.componentJade,
	'page-block' : app.pageBlockJade,
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
		.pipe(header('include {page-block}\n'))
		.pipe(jadeGlobbing({
			placeholder: jadePlaceholder
		}))
		.pipe(jade({
			locals: jadeGlobalVariables,
			pretty : '    '
		}))
		.pipe(out(jadeBuildDestPath))
});

var jadeFileToWatch = [];
jadeFileToWatch.push(app.componentJade);
jadeFileToWatch.push(app.pageBlockJade);
jadeFileToWatch.push(app.layoutJade);
jadeFileToWatch.push(app.padeJade);

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
stylusFileToWatch.push(app.pageBlockStylus);
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
scriptFileToBuild.push(app.pageBlockScript);
scriptFileToBuild.push(app.layoutScript);
scriptFileToBuild.push(app.pageScript);
scriptFileToBuild.push(app.mainScript);

var scriptFileToWatch = [];
scriptFileToWatch.push(app.libScript);
scriptFileToWatch.push(app.componentScript);
scriptFileToWatch.push(app.pageBlockScript);
scriptFileToWatch.push(app.layoutScript);
scriptFileToWatch.push(app.pageScript);
scriptFileToWatch.push(app.mainScript);

var scriptBuildDestPath = path.join(app.javascript, '{basename}{extension}');
var scriptSingleFileTempDestPath = path.join(app.singleFileScript, '{basename}{extension}');

gulp.task('script-full', ['script', 'script-vendor'], function () {
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

// /*===========================================*/
// /*===========================================*/
// /*===========================================*/

// var imagesAll = [];
// imagesAll.push(path.join(sourcePath, ('image/final/**')));

// var imageRenderDestPath = path.join(pageBuildDirectoryPath, 'image');

// gulp.task('image-min', function () {
// 	if (!commandLineOption.noImage) {
// 		gulp.src(imagesAll)
//         .pipe(plumber())
//         .pipe(imagemin({
//             progressive: true,
//             svgoPlugins: [{removeViewBox: false}],
//             use: [pngquant()]
//         }))
//         .pipe(gulp.dest(imageRenderDestPath));
// 	}
// });

// /*===========================================*/
// /*==================Fonts====================*/
// /*===========================================*/

// var fontPath = path.join(sourcePath, 'font');

// var fontsList = [];
// fontsList.push(path.join(fontPath, '*.eot'));
// fontsList.push(path.join(fontPath, '*.svg'));
// fontsList.push(path.join(fontPath, '*.ttf'));
// fontsList.push(path.join(fontPath, '*.woff'));
// fontsList.push(path.join(fontPath, '*.woff2'));

// var fontCopyDestPath = path.join(pageBuildDirectoryPath, 'font');

// gulp.task('font', function () {
// 	gulp.src(fontsList)
// 		.pipe(plumber())
// 		.pipe(gulp.dest(fontCopyDestPath));
// });

// /*===========================================*/
// /*===========================================*/
// /*===========================================*/

// /*---------------*/
// var buildSubTaskList = ['font', 'image-min', 'jade', 'stylus', 'javascript-full'];
// gulp.task('build', buildSubTaskList);
// /*--------------*/

// gulp.task('watch-javascript-full', ['javascript-full', 'watch-javascript', 'watch-javascript-bundle']);

// gulp.task('watch-javascript', function () {
// 	watch(scriptFilesToWatch, batch(function (events, done) {
// 		gulp.start('javascript', done);
// 	}));
// });

// gulp.task('watch-javascript-bundle', function () {
// 	watch(javascriptBundleAll, batch(function (events, done) {
// 		gulp.start('javascript-bundle', done);
// 	}));
// });

// gulp.task('watch', ['build', 'watch-jade', 'watch-stylus', 'watch-javascript-full']);

// gulp.task('server', ['watch', 'connect', 'open-once']);

// gulp.task('server-livereload', ['server'], function () {
// 	watch(serverFilesToReload, batch(function (events, done) {
// 		gulp.start('livereload', done);
// 	}))
// });

// gulp.task('default', ['build']);