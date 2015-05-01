describe('qDirective: q-class', function () {
	'use strict';

	var qCompile, qUpdate, element, fragment, scope;

	beforeEach(module('q-directives'));

	beforeEach(inject(function (_qUpdate_, _qCompile_, $rootScope) {
		this.addMatchers({
			toHaveClass: function (className) {
				return this.actual.classList.contains(className);
			}
		});

		qUpdate = _qUpdate_;
		qCompile = _qCompile_;
		fragment = document.createDocumentFragment();
		element = document.createElement('div');
		element.innerHTML = '<ul>' +
			'<li q-class="{valid: isValid, invalid: !isValid}" id="el0"></li>' +
			'<li q-class="hello" id="el1"></li>' +
			'</ul>';
		element = element.firstChild;
		fragment.appendChild(element);
		scope = $rootScope;
		scope.isValid = true;
	}));

	it('takes a hashmap and adds classes to the given element where keys are class names and values are booleans indicating whether the class should be added or not', function () {
		var targetElement = fragment.querySelector('#el0');
		qCompile(element);
		qUpdate(element, scope);

		// value of 'hello' on scope is 'world'
		expect(targetElement).toHaveClass('valid');
		expect(targetElement).not.toHaveClass('invalid');

		scope.isValid = false;
		qUpdate(element, scope);
		expect(targetElement).toHaveClass('invalid');
		expect(targetElement).not.toHaveClass('valid');
	});

	it('also accepts a string value to be given', function () {
		var targetElement = fragment.querySelector('#el1');

		scope.hello = 'world';
		qCompile(element);
		qUpdate(element, scope);

		expect(targetElement).toHaveClass('world');
	});
});