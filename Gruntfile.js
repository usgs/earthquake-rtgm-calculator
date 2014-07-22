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
		},
		connect: {
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
					base: ['<%= app.src %>/htdocs', '.tmp', 'node_modules'],
					port: 8080,
					debug: true,
					middleware: function (connect, options) {
						var base = options.base, i, len, folder;
						var handlers = [
							lrSnippet,
							rewriteRulesSnippet
						];

						if (!Array.isArray(base)) {
							base = [base];
						}
						len = base.length;

						for (i = 0; i < len; i++) {
							folder = base[i];
							handlers.push(mountPHP(folder));
							handlers.push(mountFolder(connect, folder));
						}

						return handlers;
					}
				}
			},
			dist: {
				options: {
					base: ['<%= app.dist %>/htdocs', 'node_modules'],
					port: 8081,
					keepalive: true,
					open: true,
					middleware: function (connect, options) {
						var handlers = [], i = 0, len = options.base.length, folder;

						// Check everywhere before rewrites
						for (i = 0; i < len; i++) {
							folder = options.base[i];
							handlers.push(mountPHP(folder));
							handlers.push(mountFolder(connect, folder));
						}

						// Do rewrites
						handlers.push(rewriteRulesSnippet);

						// Check everything again after rewrites
						for (i = 0; i < len; i++) {
							folder = options.base[i];
							handlers.push(mountPHP(folder));
							handlers.push(mountFolder(connect, folder));
						}

						return handlers;
					}
				}
			},
			test: {
				options: {
					base: ['.tmp', 'node_modules', '<%= app.test %>', '<%= app.src %>/htdocs/js'],
					port: 8000
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
					baseUrl: '<%= app.src %>/htdocs/js',
					out: '<%= app.dist %>/htdocs/js/index.js',
					optimize: 'none',
					useStrict: true,
					paths: {
						'mvc': '../../../node_modules/hazdev-webutils/src/mvc',
						'util': '../../../node_modules/hazdev-webutils/src/util',
						'dygraph': '../../../node_modules/dygraphs/dygraph-combined'
					},
					shim: {
						dygraph: {
							exports: 'Dygraph'
						}
					}
				}
			}
		},
		cssmin: {
			dist: {
				options: {
					root: 'node_modules'
				},
				files: {
					'<%= app.dist %>/htdocs/css/index.css': [
						'.tmp/css/index.css'
					],
					'<%= app.dist %>/htdocs/css/theme.css': [
						'<%= app.tmp %>/css/theme.css'
					],
					'<%= app.dist %>/htdocs/css/documentation.css': [
						'<%= app.src %>/htdocs/css/documentation.css'
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
			dist: {
				files: {
					'<%= app.dist %>/htdocs/js/index.js':
							['<%= app.dist %>/htdocs/js/index.js']
				}
			},
			downgrade: {
				files: {
					'<%= app.dist %>/htdocs/js/require.js':
							['node_modules/requirejs/require.js']
				}
			}
		},
		copy: {
			dist: {
				expand: true,
				cwd: '<%= app.src %>',
				dest: '<%= app.dist %>',
				src: [
					'conf/**/*',
					'lib/**/*',
					'htdocs/_config.inc.php',
					'htdocs/documentation.php',
					'htdocs/index.php',
					'htdocs/service.php',
					'!**/*.orig'
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
			downgrade_php: {
				src: ['<%= app.dist %>/htdocs/**/*.php'],
				overwrite: true,
				replacements: [
					{
						from: 'include_once \'template.inc.php\';',
						to: 'include_once $_SERVER[\'DOCUMENT_ROOT\'] . \'/template/template.inc.php\';'
					},
					{
						from: '<!-- RequireJS provided by template -->',
						to: '<script src="js/require.js"></script>'
					},
					{
						from: '<!-- Template provides box-sizing -->',
						to: '<style>#content *{-moz-box-sizing:border-box;box-sizing:border-box;}</style>'
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
		'mocha_phantomjs',
		'_phptest_service',
		'_phptest_calc'
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

	grunt.registerTask('dist', [
		'clean',
		'copy:dist',
		'compass',
		'cssmin',
		'requirejs',
		'uglify:dist',
		'configureRewriteRules',
		'connect:dist',
		'open:dist'
	]);

	// Downgrades distributables to work on old template/server environment
	grunt.registerTask('downgrade', [
		'clean',
		'copy:dist',
		'replace:downgrade_php',
		'compass',
		'cssmin',
		'requirejs',
		'uglify'
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
