path = require( "path" )

module.exports = (grunt) ->
	# Project configuration.
	grunt.initConfig
		pkg: grunt.file.readJSON('package.json')
		regarde:
			js:
				files: ["_src/**/*.coffee"]
				tasks: [ "build-core-js"]
			tmpls:
				files: ["_src/**/*.jade"]
				tasks: [ "build-core-js"]
			css:
				files: ["_src/css/**/*.styl"]
				tasks: [ "build-core-css"]
		stylus:
			options:
				"include css": true
			base:
				files:
					"css/iggy.css": ["_src/css/main.styl"]

		clean:
			base:
				src: [ "js", "test" ]

		browserify:
			base:
				files:
					'js/iggy.js': "_src/js/main.coffee"

			options:
				transform: ["jadeify", "coffeeify"]
				browserifyOptions:
					debug: true
					extensions: ".coffee"
					standalone: "IGGY"
					external: true

		copy: 
			dist:
				src: ['js/iggy.js']
				dest: 'dist/iggy.js'

		karma:
			local:
				configFile: 'karma.conf.coffee'

		includereplace:
			pckg:
				options:
					globals:
						version: "0.0.11"

					prefix: "@@"
					suffix: ''

				files:
					"index.js": ["index.js"]

		
		

	# Load npm modules
	grunt.loadNpmTasks "grunt-regarde"
	grunt.loadNpmTasks "grunt-contrib-copy"
	grunt.loadNpmTasks "grunt-contrib-stylus"
	grunt.loadNpmTasks "grunt-contrib-clean"
	grunt.loadNpmTasks "grunt-include-replace"
	grunt.loadNpmTasks "grunt-browserify"
	grunt.loadNpmTasks "grunt-karma"

	# just a hack until this issue has been fixed: https://github.com/yeoman/grunt-regarde/issues/3
	grunt.option('force', not grunt.option('force'))
	
	# ALIAS TASKS
	grunt.registerTask "watch", "regarde"
	grunt.registerTask "default", "build"
	grunt.registerTask "clear", [ "clean:base" ]
	grunt.registerTask "test-local", "karma:local"

	# build the project
	grunt.registerTask "build-core-js", [ "browserify" ]
	grunt.registerTask "build-core-css", [ "stylus:base"]
	grunt.registerTask "build-core", [ "build-core-js", "build-core-css"]


	grunt.registerTask "build", [ "clear", "build-core"]
	grunt.registerTask "release", [ "build" ]