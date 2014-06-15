module.exports = function (grunt) {
    'use strict';
    // Project configuration.
    grunt.initConfig({
        jshint: {
            all: ['Gruntfile.js', 'lib/**/*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        }
    });

    // Load local tasks.
    grunt.loadTasks('tasks');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Default task.
    grunt.registerTask('default', ['jshint']);
};
