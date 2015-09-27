module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
	       webdriver: {
	           options: {
	             desiredCapabilities: {
	               browserName: 'chrome'
	             }
	           },
	           allTest:{
	    	      tests: 'test/mocha_test.js'
	           }
        },
        watch: {
          files: ['src/*.js', 'test/*.js'],
          tasks: ['devTest']
        },
        jsdoc : {
          dist : {
            src: ['src/*.js', 'test/*.js','readme.md'],
            options: {
              destination: 'docs'
            }
          }
        },
        browserify:{
          dist: {
            src: ['src/background_origin.js'],
            dest: 'src/background.js'
          }
        }
  });
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-selenium-webdriver');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-webdriver');
  grunt.loadNpmTasks('grunt-jsdoc');

  grunt.registerTask('devTest', ['browserify','webdriver']);
  grunt.registerTask('test', ['webdriver']);

  grunt.registerTask('build', ['browserify','jsdoc']);
  //, function() {    grunt.log.write('Logging some stuff...').ok();  }

  grunt.registerTask('default', ['watch']);

};