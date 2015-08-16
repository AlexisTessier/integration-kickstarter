'use strict';
var path = require('path');

var _ = require('lodash');

var glob = require('glob');

var app = require('./app-path');

var commandLineOption = require('./command-line-option');

var libList = glob.sync(app.libAll);

_.forEach(libList, function(lib) {
	var libName = path.basename(lib);
	var taskList = glob.sync(path.join(lib, 'task/*.js'))

	_.forEach(taskList, function(task) {
		var taskName = path.basename(task, '.js');
		var option = _.kebabCase(libName+" "+taskName);

		if (_.contains(process.argv, option)) {
			require(task)(app, commandLineOption);
		}
	})
});