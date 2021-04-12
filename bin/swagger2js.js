#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');

const lib = path.join(path.dirname(fs.realpathSync(__filename)), '../lib');

// Update Notifier
updateNotifier({packageName: pkg.name, packageVersion: pkg.version}).notify();

// CLI Script
require(lib + '/cli.js');