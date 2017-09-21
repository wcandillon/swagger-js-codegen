#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const updateNotifier = require('update-notifier');
const lib = path.join(path.dirname(fs.realpathSync(__filename)), '../lib');
const pkg = require('../package');

updateNotifier({
    packageName: pkg.name,
    packageVersion: pkg.version
}).notify();

require(lib + '/cli.js');