describe('service: qCompile', function () {
	'use strict';

	var qCompile, element, fragment,
		_module = angular.module('q-directives');

	beforeEach(module('q-directives'));
	beforeEach(inject(function (_qCompile_) {
		this.addMatchers({
			toHaveClass: function (className) {
				return this.actual.classList.contains(className);
			},
			toHaveNodeName: function (nodeName) {
				return this.actual.nodeName.toLowerCase() === nodeName;
			}
		});

		qCompile = _qCompile_;
		fragment = document.createDocumentFragment();
		element = document.createElement('div');
		element.setAttribute('q-hide', 'something');
		element.innerHTML = '<ul>' +
			'<li q-show="something" id="el0"></li>' +
			'<li q-hide="something" id="el1"></li>' +
			'<li q-class="{}" id="el2">' +
				'<my-element-directive id="el3" data-custom-attr="hello world" class="originalClass" title="originalTitle"></my-element-directive>' +
				'<terminal terminal q-class="{\"hello\": something}" id="el4">' +
					'<div q-show="something" id="el5"></div>' +
					'<div q-hide="something" id="el6"></div>' +
				'</terminal>' +
			'</li>' +
			'</ul>';
		fragment.appendChild(element);
	}));

	it('adds classes to all elements containing q-directives (with restrict: A) for easier access later', function () {
		qCompile(element);

		expect(element).toHaveClass('q-directive__q-hide');
		expect(fragment.querySelector('#el0')).toHaveClass('q-directive__q-show');
		expect(fragment.querySelector('#el1')).toHaveClass('q-directive__q-hide');
		expect(fragment.querySelector('#el2')).toHaveClass('q-directive__q-class');
	});

	it('calls the compile function on the directive if it exists', function () {
		var compileSpy = jasmine.createSpy('compileSpy');
		_module.qDirective('my-element-directive', {
			restrict: 'E',
			compile: compileSpy
		});

		qCompile(element);

		expect(compileSpy).toHaveBeenCalled();

		expect(fragment.querySelector('#el3').classList.contains('q-directive__my-element-directive')).toBe(true);
		expect(fragment.querySelector('#el3')).toHaveClass('q-directive__my-element-directive');
	});

	it('uses replaces the element with the template provided (if provided) and copies over attributes, data attributes and classes', function () {
		_module.qDirective('my-element-directive', {
			restrict: 'E',
			template: '<ul class="templateClass" title="templateTitle"><li class="item1">item 1</li></ul>'
		});

		qCompile(element);

		var compiledEl = fragment.querySelector('#el3');

		// make sure the element has been replaced with the template provided
		expect(compiledEl.nodeName.toLowerCase()).toBe('ul');
		expect(compiledEl.firstChild.nodeName.toLowerCase()).toBe('li');

		// make sure classes are merged correctly
		expect(compiledEl).toHaveClass('q-directive__my-element-directive');
		expect(compiledEl).toHaveClass('originalClass');
		expect(compiledEl).toHaveClass('templateClass');

		// make sure the attributes on the original element are copied over to the template
		// (orignal attributes are higher priority than the attribuets on the template)
		expect(compiledEl.getAttribute('title')).toBe('originalTitle');

		// make sure data attributes are copied correctly
		expect(compiledEl.dataset.customAttr).toBe('hello world');
	});

	it('does not compile any elements (or children) of an element is a terminal directive', function () {
		_module.qDirective('terminal', {
			terminal: true,
			restrict: 'E'
		});

		qCompile(element);

		// original directives work just fine
		expect(fragment.querySelector('#el0')).toHaveClass('q-directive__q-show');
		expect(fragment.querySelector('#el1')).toHaveClass('q-directive__q-hide');
		expect(fragment.querySelector('#el2')).toHaveClass('q-directive__q-class');

		// directives alongside or inside terminal don't
		expect(fragment.querySelector('#el4')).not.toHaveClass('q-directive__q-class');
		expect(fragment.querySelector('#el5')).not.toHaveClass('q-directive__q-show');
		expect(fragment.querySelector('#el6')).not.toHaveClass('q-directive__q-hide');
	});

	it('does not compile any elements (or children) of an element that has a terminal attribute directive', function () {
		_module.qDirective('terminal', {
			terminal: true,
			restrict: 'A'
		});

		qCompile(element);

		// no directive should compile
		expect(fragment.querySelector('#el0')).toHaveClass('q-directive__q-show');
		expect(fragment.querySelector('#el1')).toHaveClass('q-directive__q-hide');
		expect(fragment.querySelector('#el2')).toHaveClass('q-directive__q-class');

		// directives alongside or inside terminal don't
		expect(fragment.querySelector('#el4')).not.toHaveClass('q-directive__q-class');
		expect(fragment.querySelector('#el5')).not.toHaveClass('q-directive__q-show');
		expect(fragment.querySelector('#el6')).not.toHaveClass('q-directive__q-hide');
	});

	it('does not compile any elements at all if the root node to be compiled is a terminal', function () {
		_module.qDirective('terminal', {
			terminal: true,
			restrict: 'A'
		});
		element.setAttribute('terminal', '');

		qCompile(element);

		expect(element.getElementsByClassName('q-directive__q-show').length).toBe(0);
		expect(element.getElementsByClassName('q-directive__q-hide').length).toBe(0);
		expect(element.getElementsByClassName('q-directive__q-class').length).toBe(0);
	});
});