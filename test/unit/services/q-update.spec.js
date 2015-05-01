describe('service: qUpdate', function () {
	'use strict';

	var qCompile, qUpdate, element, fragment, scope,
		_module = angular.module('q-directives');

	beforeEach(module('q-directives'));
	beforeEach(inject(function (_qCompile_, _qUpdate_) {
		qCompile = _qCompile_;
		qUpdate = _qUpdate_;

		scope = {
			something: true,
			somethingElse: {
				hello: 'another world'
			}
		};

		fragment = document.createDocumentFragment();
		element = document.createElement('div');
		element.setAttribute('q-hide', 'something');
		element.innerHTML = '<ul attr-directive="somethingElse">' +
			'<li q-show="something" id="el0"></li>' +
			'<li q-hide="something" id="el1"></li>' +
			'<li q-class="{someClass: something}" id="el2"></li>' +
			'<my-element-directive id="el3" data-hello="originalHello" data-world="originalWorld"></my-element-directive>' +
			'</ul>';
		fragment.appendChild(element);
	}));

	it('updates the values of the directives based on the scope provided', function () {
		qCompile(element);
		qUpdate(element, scope);

		expect(element.classList.contains('ng-hide')).toBe(true);
		expect(fragment.querySelector('#el0').classList.contains('ng-hide')).toBe(false);
		expect(fragment.querySelector('#el1').classList.contains('ng-hide')).toBe(true);
		expect(fragment.querySelector('#el2').classList.contains('someClass')).toBe(true);
	});

	it('calls update and render on the directive if defined', function () {
		var updateSpy = jasmine.createSpy('updateSpy').andCallFake(angular.identity);
		var renderSpy = jasmine.createSpy('renderSpy');
		_module.qDirective('my-element-directive', {
			restrict: 'E',
			template: '<div></div>',
			update: updateSpy,
			render: renderSpy
		});

		qCompile(element);
		qUpdate(element, scope);

		expect(updateSpy).toHaveBeenCalled();
		expect(updateSpy.mostRecentCall.args[0]).toBe(scope);
		expect(renderSpy).toHaveBeenCalledWith(fragment.querySelector('#el3'), scope);
	});

	it('calls update with the $parsed value of the attribute value as second parameter (for attribute directives)', function () {
		var directive = {
			restrict: 'A',
			update: jasmine.createSpy('updateSpy').andCallFake(angular.identity)
		};

		_module.qDirective('attr-directive', directive);
		qCompile(element);
		qUpdate(element, scope);

		expect(directive.update.mostRecentCall.args[0]).toBe(scope);

		// second arg is a getter function that gets the parsed value on the scope provided
		expect(typeof directive.update.mostRecentCall.args[1]).toBe('function');
		expect(directive.update.mostRecentCall.args[1](scope)).toEqual({hello: 'another world'});
	});

	it('passes whatever is returned by the update function to the render (if defined) as second parameter', function () {
		var renderRetval = {hello: 'world'};
		var directive = {
			restrict: 'A',
			update: jasmine.createSpy('updateSpy').andReturn(renderRetval),
			render: jasmine.createSpy('renderSpy')
		};

		_module.qDirective('attr-directive', directive);
		qCompile(element);
		qUpdate(element, scope);

		// the directive is added on the first child
		expect(directive.render).toHaveBeenCalledWith(element.firstChild, renderRetval);
	});

	it('creates a new isolate scope if directive.scope is defined', function () {
		var updateSpy = jasmine.createSpy('updateSpy').andCallFake(angular.identity);
		var renderSpy = jasmine.createSpy('renderSpy');
		_module.qDirective('my-element-directive', {
			restrict: 'E',
			template: '<div></div>',
			scope: ['hello', 'world'],
			update: updateSpy,
			render: renderSpy
		});

		var scope = {
			originalHello: 'hi there',
			originalWorld: 'what a wonderful world'
		};

		qCompile(element);
		qUpdate(element, scope);

		var newScope = {
			hello: 'hi there',
			world: 'what a wonderful world'
		};

		expect(updateSpy).toHaveBeenCalled();
		expect(updateSpy.mostRecentCall.args[0]).toEqual(newScope);
		expect(renderSpy).toHaveBeenCalled();
		expect(renderSpy.mostRecentCall.args[0]).toBe(fragment.querySelector('#el3'));
		expect(renderSpy.mostRecentCall.args[1]).toEqual(newScope);
	});
});