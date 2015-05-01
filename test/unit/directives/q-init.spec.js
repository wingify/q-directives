describe('qDirective: q-init', function () {
	'use strict';

	var qCompile, qUpdate, element, fragment, scope;

	beforeEach(module('q-directives'));

	beforeEach(inject(function (_qUpdate_, _qCompile_, $rootScope) {
		qUpdate = _qUpdate_;
		qCompile = _qCompile_;
		fragment = document.createDocumentFragment();
		element = document.createElement('div');
		element.innerHTML = '<div q-init="someCustomText = \'overriden value\'" q-text="someCustomText"></div>';
		element = element.firstChild;
		fragment.appendChild(element);
		scope = $rootScope;
		scope.someCustomText = 'default value';
	}));

	it('executes whatever is passed to directive\'s attribute value before any other non-prior q-directives are executed', function () {
		qCompile(element);
		qUpdate(element, scope);

		expect(scope.someCustomText).toBe('overriden value');
		expect(element.textContent).not.toBe('default value');
		expect(element.textContent).toBe('overriden value');

		// lets override it once more
		scope.someCustomText = 'overriden once again';

		qUpdate(element, scope);

		// q-init executes and overrides the scope again
		expect(scope.someCustomText).toBe('overriden value');
		expect(element.textContent).not.toBe('default value');
		expect(element.textContent).toBe('overriden value');
	});
});