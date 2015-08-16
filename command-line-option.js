'use strict';

var _ = require('lodash');

var commandLineOption = {
	noOpen : _.contains(process.argv, "-no-open"),
	noImageMin : _.contains(process.argv, "-no-image-min"),
	prod : _.contains(process.argv, "-prod"),
	scriptSingleFile : _.contains(process.argv, "-script-single-file")
};

module.exports = commandLineOption;