'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');
var wrap = require('gulp-wrap');
var spawn = require('child_process').spawn;
var q = require('q');
var jshint = require('gulp-jshint');

gulp.task('build', function() {
	return gulp.src(['src/module.js', 'src/**/*.js'])
		.pipe(wrap('(function() {\n<%= contents %>\n})();'))
		.pipe(concat('q-directives.js'))
		.pipe(gulp.dest('dist'));
});

gulp.task('build-test', ['build'], function () {
	return gulp.src([
        'bower_components/jquery/dist/jquery.js',
        'bower_components/jasmine/lib/jasmine-core/jasmine.js',
        'bower_components/jasmine/lib/jasmine-core/jasmine-html.js',
        'bower_components/angular/angular.js',
        'bower_components/angular-mocks/angular-mocks.js',
        'dist/q-directives.js',
        'test/unit/**/*.js'
    ])
		.pipe(concat('q-directives.spec.js'))
		.pipe(gulp.dest('test'));
});

gulp.task('test', ['build-test'], function () {
    var d = q.defer();
    var testem = spawn('node_modules/testem/testem.js', ['ci']);
    var str = '';

    testem.stdout.on('data', function (data) {
        process.stdout.write(data);
        str += data;
    });

    testem.stderr.on('data', function (data) {
        process.stdout.write('Error: ' + data);
        str += data;
    });

    testem.on('close', function () {
        if (str.indexOf('not ok') >= 0) {
            d.reject('testem not ok');
        } else {
            d.resolve();
        }
    });
    return d.promise;
});

gulp.task('jshint', function () {
    return gulp.src([
        'Gulpfile.js',
        'src/*.js',
        'src/**/*.js',
        'test/unit/**/*.js'
    ])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('default', ['jshint', 'test']);