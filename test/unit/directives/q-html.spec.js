describe('qDirective: q-html', function () {
	'use strict';

	var qCompile, qUpdate, element, fragment, scope;

	beforeEach(module('q-directives'));

	beforeEach(inject(function (_qUpdate_, _qCompile_, $rootScope) {
		qUpdate = _qUpdate_;
		qCompile = _qCompile_;
		fragment = document.createDocumentFragment();
		element = document.createElement('div');
		element.innerHTML = '<div q-html="someCustomHtml"></div>';
		element = element.firstChild;
		fragment.appendChild(element);
		scope = $rootScope;
	}));

	it('renders whatever trusted value is passed to the directive\'s attribute value as the element\'s innerHTML', inject(function ($sce) {
		scope.someCustomHtml = $sce.trustAsHtml('<a href="#">click <b>me</b></a>');

		qCompile(element);
		qUpdate(element, scope);

		// value of 'hello' on scope is 'world'
		expect(element.innerHTML).toBe($sce.getTrustedHtml(scope.someCustomHtml));
		expect(element.textContent).toBe('click me');
	}));

	it('throws an error if trying to use a non-trusted value in strict context', function () {
		scope.someCustomHtml = '<script>alert(\'xss\');</script>';

		qCompile(element);

		expect(function () {
			qUpdate(element, scope);
		}).toThrow();
	});
});