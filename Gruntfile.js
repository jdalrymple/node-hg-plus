
module.exports = function(grunt) {

	var cfg = {
		simplemocha: {
			options: {
				timeout: 3000,
				ignoreLeaks: false,
				ui: 'bdd',
				reporter: 'spec',
				compilers: "coffee:coffee-script"
			},
			all: ["test/*.coffee"]
		}
	};

	grunt.initConfig(cfg);

	grunt.loadNpmTasks("grunt-simple-mocha");

	grunt.registerTask("default", ["simplemocha"]);

};