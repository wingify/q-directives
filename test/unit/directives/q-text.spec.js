describe('qDirective: q-text', function () {
	'use strict';

	var qCompile, qUpdate, element, fragment, scope;

	beforeEach(module('q-directives'));

	beforeEach(inject(function (_qUpdate_, _qCompile_, $rootScope) {
		qUpdate = _qUpdate_;
		qCompile = _qCompile_;
		fragment = document.createDocumentFragment();
		element = document.createElement('div');
		element.innerHTML = '<div q-text="someCustomText"></div>';
		element = element.firstChild;
		fragment.appendChild(element);
		scope = $rootScope;
		scope.someCustomText = '<span>click me</span>';
	}));

	it('renders whatever is passed to the directive\'s attribute value as the element\'s textContent', function () {
		qCompile(element);
		qUpdate(element, scope);

		// value of 'hello' on scope is 'world'
		expect(element.textContent).toBe(scope.someCustomText);
		expect(element.innerHTML).toBe('&lt;span&gt;click me&lt;/span&gt;');
	});
});