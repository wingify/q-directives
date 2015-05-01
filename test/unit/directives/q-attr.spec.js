describe('qDirective: q-attr', function () {
	'use strict';

	var qCompile, qUpdate, element, fragment, scope;

	beforeEach(module('q-directives'));

	beforeEach(inject(function (_qUpdate_, _qCompile_, $rootScope) {
		qUpdate = _qUpdate_;
		qCompile = _qCompile_;
		fragment = document.createDocumentFragment();
		element = document.createElement('div');
		element.innerHTML = '<ul>' +
			'<li q-attr="{title: hello, class: hello ? \'hello-world\' : \'\'}" id="el0"></li>' +
			'</ul>';
		element = element.firstChild;
		fragment.appendChild(element);
		scope = $rootScope;
		scope.hello = 'world';
	}));

	it('takes a hashmap and adds attributes to the given element where keys are attribute names and values are attribute values', function () {
		qCompile(element);
		qUpdate(element, scope);

		// value of 'hello' on scope is 'world'
		expect(fragment.querySelector('#el0').getAttribute('title')).toBe('world');
		expect(fragment.querySelector('#el0').getAttribute('class')).toBe('hello-world');
	});
});