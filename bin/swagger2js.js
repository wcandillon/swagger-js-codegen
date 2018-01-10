#!/usr/bin/env node
var path = require('path');
var fs = require('fs');
var lib = path.join(path.dirname(fs.realpathSync(__filename)), '../lib');
var updateNotifier = require('update-notifier');

//1. Update Notifier
var pkg = require('../package.json');
updateNotifier({packageName: pkg.name, packageVersion: pkg.version}).notify();

//4. CLI Script
require(lib + '/cli.js');