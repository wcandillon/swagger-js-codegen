'use strict';

var fs = require('fs');
var Mustache = require('mustache');

exports.util = {

    keywordMap: {
        'default': 'difault'
    },

    camelCase: function(id) {
        var tokens = [];
        id = this.keywordMap[id] ? this.keywordMap[id] : id;
        id.split('-').forEach(function(token, index){
            if(index === 0) {
                tokens.push(token[0].toLowerCase() + token.substring(1));
            } else {
                tokens.push(token[0].toUpperCase() + token.substring(1));
            }
        });
        return tokens.join('');
    },
    
    renderAsAngular: function(name, data){
        return this.render('angular', name, data);
    },
    
    renderAsNode: function(name, data){
        return this.render('node', name, data);
    },
    
    render: function(type, name, data){
        var tpl = fs.readFileSync('lib/snippets/' + type + '/' + name + '.mustache', 'utf-8');
        return Mustache.render(tpl, data);
    }
};