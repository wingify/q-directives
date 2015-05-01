describe('directive: qDirective', function () {
	'use strict';

	var qCompile, qUpdate, $compile, $rootScope, element;

	beforeEach(module('q-directives', function ($provide) {
		$provide.decorator('qCompile', function () {
			qCompile = jasmine.createSpy('qCompile');
			return qCompile;
		});
		$provide.decorator('qUpdate', function () {
			qUpdate = jasmine.createSpy('qUpdate');
			return qUpdate;
		});
	}));

	beforeEach(inject(function (_$compile_, _$rootScope_) {
		$compile = _$compile_;
		$rootScope = _$rootScope_;

		var fragment = document.createDocumentFragment();
		element = document.createElement('div');
		element.innerHTML = '<ul q></ul>';
		element = element.firstChild;
		fragment.appendChild(element);
	}));

	it('calls qCompile with the current element on compile', function () {
		$compile(element);
		expect(qCompile).toHaveBeenCalledWith(element);
	});

	it('calls qUpdate with the current element and given scope on link', function () {
		$compile(element)($rootScope);
		expect(qUpdate).toHaveBeenCalledWith(element, $rootScope);
	});
});