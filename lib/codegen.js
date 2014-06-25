'use strict';

var nodeCodeGen = require('./node/codegen').CodeGen;

exports.CodeGen = {
    getCode: function(opts){
        opts.generator = opts.generator ? opts.generator : 'node';
        if(opts.generator === 'node') {
            var gen = new nodeCodeGen('Queries', opts.swagger);
            return gen.getCode();
        } else {
            throw new Error('Unknown generator: ' + opts.generator);
        }
    }
};
