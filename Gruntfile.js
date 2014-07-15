'use strict';

var LIVE_RELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({port: LIVE_RELOAD_PORT});
var gateway = require('gateway');

var mountFolder = function (connect, dir) {
	return connect.static(require('path').resolve(dir));
};

var mountPHP = function (dir, options) {
	options = options || {
		'.php': 'php-cgi',
		'env': {
			'PHPRC': process.cwd() + '/node_modules/hazdev-template/src/conf/php.ini'
		}
	};

	return gateway(require('path').resolve(dir), options);
};

var rewriteRulesSnippet = require('grunt-connect-rewrite/lib/utils').rewriteRequest;

module.exports = function (grunt) {

	// Load grunt tasks
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	// App configuration, used throughout
	var appConfig = {
		src: 'src',
		dist: 'dist',
		test: 'test',
		tmp: '.tmp'
	};

	grunt.initConfig({
		app: appConfig,
		watch: {
			scripts: {
				files: ['<%= app.src %>/htdocs/js/**/*.js'],
				tasks: ['concurrent:scripts'],
				options: {
					livereload: LIVE_RELOAD_PORT
				}
			},
			scss: {
				files: ['<%= app.src %>/htdocs/css/**/*.scss'],
				tasks: ['compass:dev']
			},
			tests: {
				files: ['<%= app.test %>/*.html', '<%= app.test %>/**/*.js'],
				tasks: ['concurrent:tests']
			},
			livereload: {
				options: {
					livereload: LIVE_RELOAD_PORT
				},
				files: [
					'<%= app.src %>/htdocs/**/*.html',
					'<%= app.src %>/htdocs/css/**/*.css',
					'<%= app.src %>/htdocs/img/**/*.{png,jpg,jpeg,gif}',
					'.tmp/css/**/*.css'
				]
			},
			gruntfile: {
				files: ['Gruntfile.js'],
				tasks: ['jshint:gruntfile']
			}
		},
		concurrent: {
			scripts: ['jshint:scripts', 'mocha_phantomjs'],
			tests: ['jshint:tests', 'mocha_phantomjs'],
			predist: [
				'jshint:scripts',
				'jshint:tests',
				'compass'
			],
			dist: [
				'requirejs:dist',
				'cssmin:dist',
				'htmlmin:dist',
				'uglify',
				'copy'
			]
		},
		connect: {
			options: {
				hostname: 'localhost'
			},
			rules: [
				{
					from: '^/service/([^/]+)/([^/]+)/?([^/]*)$',
					to: '/service.php?x=$1&y=$2&c=$3'
				},
				{
					from: '^/theme/(.*)$',
					to: '/hazdev-template/src/htdocs/$1'
				}
			],
			dev: {
				options: {
					base: '<%= app.src %>/htdocs',
					port: 8080,
					debug: true,
					middleware: function (connect, options) {
						return [
							lrSnippet,
							rewriteRulesSnippet,
							mountFolder(connect, '.tmp'),
							mountPHP(options.base),
							mountFolder(connect, options.base),
							mountFolder(connect, 'node_modules'),
						];
					}
				}
			},
			dist: {
				options: {
					base: '<%= app.dist %>/htdocs',
					port: 8081,
					keepalive: true,
					middleware: function (connect, options) {
						return [
							mountPHP(options.base),
							mountFolder(connect, options.base)
						];
					}
				}
			},
			test: {
				options: {
					base: '<%= app.test %>',
					port: 8000,
					middleware: function (connect, options) {
						return [
							mountFolder(connect, '.tmp'),
							mountFolder(connect, 'node_modules'),
							mountFolder(connect, options.base),
							mountFolder(connect, appConfig.src + '/htdocs/js')
						];
					}
				}
			}
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			gruntfile: ['Gruntfile.js'],
			scripts: ['<%= app.src %>/htdocs/js/**/*.js'],
			tests: ['<%= app.test %>/**/*.js']
		},
		compass: {
			dev: {
				options: {
					sassDir: '<%= app.src %>/htdocs/css',
					cssDir: '<%= app.tmp %>/css',
					environment: 'development'
				}
			}
		},
		mocha_phantomjs: {
			all: {
				options: {
					urls: [
						'http://localhost:<%= connect.test.options.port %>/index.html'
					]
				}
			}
		},
		requirejs: {
			dist: {
				options: {
					name: 'index',
					baseUrl: appConfig.src + '/htdocs/js',
					out: appConfig.dist + '/htdocs/js/index.js',
					optimize: 'uglify2',
					mainConfigFile: appConfig.src + '/htdocs/js/index.js',
					useStrict: true,
					wrap: true,
					uglify2: {
						report: 'gzip',
						mangle: true,
						compress: true,
						preserveComments: 'some'
					}
				}
			}
		},
		cssmin: {
			dist: {
				files: {
					'<%= app.dist %>/htdocs/css/index.css': [
						'<%= app.src %>/htdocs/css/**/*.css',
						'.tmp/css/**/*.css'
					]
				}
			}
		},
		htmlmin: {
			dist: {
				options: {
					collapseWhitespace: true
				},
				files: [{
					expand: true,
					cwd: '<%= app.src %>',
					src: '**/*.html',
					dest: '<%= app.dist %>'
				}]
			}
		},
		uglify: {
		},
		copy: {
			app: {
				expand: true,
				cwd: '<%= app.src %>/htdocs',
				dest: '<%= app.dist %>/htdocs',
				src: [
					'img/**/*.{png,gif,jpg,jpeg}',
					'**/*.php'
				]
			},
			conf: {
				expand: true,
				cwd: '<%= app.src %>/conf',
				dest: '<%= app.dist/conf',
				src: [
					'**/*',
					'!**/*.orig'
				]
			},
			lib: {
				expand: true,
				cwd: '<%= app.src %>/lib',
				dest: '<%= app.dist %>/lib',
				src: [
					'**/*'
				]
			},
			dygraph_axes: {
				expand: true,
				cwd: 'node_modules/dygraphs/plugins',
				src: ['axes.js'],
				dest: 'node_modules/dygraphs/plugins',
				rename: function (dest, src) {
					return dest + '/' + src.replace('.js', '-orig.js');
				}
			},
			dygraph_axes_orig: {
				expand: true,
				cwd: 'node_modules/dygraphs/plugins',
				src: ['axes-orig.js'],
				dest: 'node_modules/dygraphs/plugins',
				rename: function (dest, src) {
					return dest + '/' + src.replace('-orig.js', '.js');
				}
			}
		},
		replace: {
			dist: {
				src: [
					'<%= app.dist %>/htdocs/index.html',
					'<%= app.dist %>/**/*.php'
				],
				overwrite: true,
				replacements: [
					{
						from: 'requirejs/require.js',
						to: 'lib/requirejs/require.js'
					},
					{
						from: 'html5shiv-dist/html5shiv.js',
						to: 'lib/html5shiv/html5shiv.js'
					}
				]
			},
			dygraph_axes: {
				src: ['node_modules/dygraphs/plugins/axes-orig.js'],
				dest: 'node_modules/dygraphs/plugins/axes.js',
				replacements: [
					{
						from: '        /* Tick marks are currently clipped, so don\'t bother drawing them.',
						to: ''
					},
					{
						from: '        */',
						to: ''
					},
					{
						from: 'context.lineTo(halfUp(x - sgn * this.attr_(\'axisTickSize\')), halfDown(y));',
						to: 'context.lineTo(halfUp(x + sgn * g.getOption(\'axisTickSize\')), halfDown(y));'
					},
					{
						from: 'context.lineTo(halfUp(x), halfDown(y + this.attr_(\'axisTickSize\')));',
						to: 'context.lineTo(halfUp(x), halfDown(y - g.getOption(\'axisTickSize\')));'
					}
				]
			}
		},
		shell: {
			dygraphs: {
				command: 'pwd && ./generate-combined.sh',
				options: {
					execOptions: {
						cwd: 'node_modules/dygraphs'
					}
				}
			}
		},
		open: {
			dev: {
				path: 'http://localhost:<%= connect.dev.options.port %>'
			},
			test: {
				path: 'http://localhost:<%= connect.test.options.port %>'
			},
			dist: {
				path: 'http://localhost:<%= connect.dist.options.port %>'
			}
		},
		clean: {
			dist: ['<%= app.dist %>'],
			dev: ['<%= app.tmp %>', '.sass-cache'],
			dygraph_axes_orig: ['node_modules/dygraphs/plugins/axes-orig.js']
		}
	});

	grunt.event.on('watch', function (action, filepath) {
		// Only lint the file that actually changed
		grunt.config(['jshint', 'scripts'], filepath);
	});

	grunt.registerTask('test', [
		'clean:dist',
		'configureRewriteRules',
		'connect:test',
		'connect:dev',
		'mocha_phantomjs'//,
		// '_phptest_service',
		// '_phptest_calc'
	]);

	/**
	 * This test automates running the PHP calculator test(s).
	 */
	grunt.registerTask('_phptest_calc', function () {
		var done = this.async(),
		    spawn = require('child_process').spawn,
		    calc = spawn('php', ['RTGM.test.php'], {cwd: 'test/lib/classes'});

		calc.stdout.on('data', function (data) {
			grunt.log.writeln(data);
		});
		calc.stderr.on('data', function (data) {
			grunt.log.writeln(data);
		});
		calc.on('close', function (code) {
			done(code === 0);
		});
	});

	/**
	 * Tests the service.php HTTP request. Task connect:dev must be running
	 * for the server to accept connections. This test will make a single request
	 * to the service and verify the expected outputs.
	 */
	grunt.registerTask('_phptest_service', function () {
		grunt.task.requires('configureRewriteRules');
		grunt.task.requires('connect:dev');
		var done = this.async(),
		http = require('http'),
		xs = [0.01,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,1.1,1.2,1.4,1.7,2],
		ys = [0.5696,0.088335,0.02925,0.01229725,0.00564925,0.00275075,0.001385175,
		      0.000733875,0.0003984225,0.0002205625,0.0001235975,0.00006881825,
		      0.0000382493775,0.0000113329875,0.00000134645,0.000000064884],
		opts = {
			'host': 'localhost',
			'port': 8080,
			'path': '/service/' + xs.join(',') + '/' + ys.join(',')
		},
		callback = function (resp) {
			var str = [];
			resp.on('data', function (chunk) {
				str.push(chunk);
			});
			resp.on('end', function () {
				var result = JSON.parse(str.join(''));
				if (result.status !== 200) {
					grunt.log.write('Service returned enexpected status.\n');
					done(false);
				}
				var rtgm = result.rtgm;

				// Verify the RTGM value
				if (Math.abs(rtgm.rtgm - 0.83485096873974) > 0.001) {
					grunt.log.write('Failed: Incorrect RTGM calculation.\n');
					done(false);
				}

				// Verify the riskCoefficient value
				if (Math.abs(rtgm.riskCoefficient - 1.0467706564954) > 0.001) {
					grunt.log.write('Failed: Incorrect RTGM calculation.\n');
					done(false);
				}

				// TODO :: More tests...

				grunt.log.write('Passed.\n');
				done();
			});
		};

		var req = http.request(opts, callback);
		req.end();
	});

	grunt.registerTask('build', [
		'clean:dist',
		'concurrent:predist',
		'concurrent:dist',
		'replace',
		'configureRewriteRules',
		'connect:dist',
		'open:dist'
	]);

	grunt.registerTask('default', [
		'clean:dist',
		'enable-tickmarks',
		'compass:dev',
		'configureRewriteRules',
		'connect:test',
		'connect:dev',
		'open:test',
		'open:dev',
		'watch'
	]);

	grunt.registerTask('enable-tickmarks', [
		'copy:dygraph_axes', // Make a backup copy in a axes-orig.js
		'replace:dygraph_axes', // Replace out of axes-orig.js file into axes.src
		'shell:dygraphs', // Build dygraphs
		'copy:dygraph_axes_orig', // Put original back in place
		'clean:dygraph_axes_orig' // Get rid of copy
	]);

};
