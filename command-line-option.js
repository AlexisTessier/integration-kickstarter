'use strict';

var _ = require('lodash');

var commandLineOption = {
	noOpen : _.contains(process.argv, "-no-open"),
	noImage : _.contains(process.argv, "-no-image"),
	prod : _.contains(process.argv, "-prod"),
	scriptSingleFile : _.contains(process.argv, "-script-single-file")
};

module.exports = commandLineOption;