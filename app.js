'use strict';

var app = {};

app.path = require('./app-path');

app.configuration = require(app.path.configuration);

module.exports = app;