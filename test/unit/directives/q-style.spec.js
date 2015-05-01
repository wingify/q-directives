describe('qDirective: q-style', function () {
	'use strict';

	var qCompile, qUpdate, element, fragment, scope;

	beforeEach(module('q-directives'));

	beforeEach(inject(function (_qUpdate_, _qCompile_, $rootScope) {
		qUpdate = _qUpdate_;
		qCompile = _qCompile_;
		fragment = document.createDocumentFragment();
		element = document.createElement('div');
		element.innerHTML = '<div q-style="{height: height, width: width}"></li>';
		element = element.firstChild;
		fragment.appendChild(element);
		scope = $rootScope;
		scope.height = '30px';
		scope.width = '20px';
	}));

	it('takes a hashmap that is evaluated on the passed scope and applies each item as a css style on the given element', function () {
		qCompile(element);
		qUpdate(element, scope);

		element = angular.element(element);

		// value of 'hello' on scope is 'world'
		expect(element.css('height')).toBe('30px');
		expect(element.css('width')).toBe('20px');
	});
});