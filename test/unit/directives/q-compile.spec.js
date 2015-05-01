describe('qDirective: q-compile', function () {
	'use strict';

	var qCompile, qUpdate, element, fragment, scope, $compile;

	beforeEach(module('q-directives', function ($provide) {
		$provide.decorator('$compile', ['$delegate', function ($delegate) {
			return jasmine.createSpy('$compileSpy').andCallFake($delegate);
		}]);
	}));

	beforeEach(inject(function (_qUpdate_, _qCompile_, $rootScope, _$compile_) {
		this.addMatchers({
			toHaveAttribute: function (attrName) {
				return this.actual.hasAttribute(attrName);
			},
			toHaveClass: function (className) {
				return this.actual.classList.contains(className);
			}
		});

		$compile = _$compile_;
		qUpdate = _qUpdate_;
		qCompile = _qCompile_;

		fragment = document.createDocumentFragment();
		element = document.createElement('div');
		element.innerHTML = '<div q-compile ng-class="{visible: isVisible, invisible: !isVisible}"></div>';
		element = element.firstChild;
		fragment.appendChild(element);
		scope = $rootScope;
		scope.isVisible = true;
	}));

	it('prevents the compilation of a regular angular directive on the given element', function () {
		$compile(element)(scope);

		// ng-class should not have done its work
		expect(element).toHaveAttribute('ng-class');
		expect(element).not.toHaveClass('visible');
		expect(element).not.toHaveClass('invisible');
	});

	it('adds an attribute q-compiled on the first render (update)', function () {
		expect(element).not.toHaveAttribute('q-compiled');

		qCompile(element);
		qUpdate(element, scope);

		expect(element).toHaveAttribute('q-compiled');

		// the attribute will remain on subsequent updates
		qUpdate(element, scope);

		expect(element).toHaveAttribute('q-compiled');
	});

	it('compiles the element using $compile on the first update of the element', function () {
		qCompile(element);
		qUpdate(element, scope);

		expect($compile).toHaveBeenCalledWith(element);

		scope.$digest();

		expect(element).toHaveClass('visible');
		expect(element).not.toHaveClass('invisible');

		// lets update the value on scope
		scope.isVisible = false;
		scope.$digest();

		expect(element).not.toHaveClass('visible');
		expect(element).toHaveClass('invisible');
	});
});