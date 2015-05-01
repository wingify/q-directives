describe('qDirective: q-show, q-hide', function () {
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
		element.innerHTML = '<div><div q-show="isVisible"></div><div q-hide="!isVisible"></div></div>';
		element = element.firstChild;
		fragment.appendChild(element);
		scope = $rootScope;
		scope.isVisible = true;
	}));

	it('adds a class `ng-hide` to the element if the value passed to the attribute is truthy (for ng-hide) or falsy (for ng-show)', function () {
		qCompile(element);
		qUpdate(element, scope);

		expect(element.firstChild).not.toHaveClass('ng-hide');
		expect(element.firstChild.nextSibling).not.toHaveClass('ng-hide');

		// lets toggle the values
		scope.isVisible = false;
		qUpdate(element, scope);

		expect(element.firstChild).toHaveClass('ng-hide');
		expect(element.firstChild.nextSibling).toHaveClass('ng-hide');
	});
});