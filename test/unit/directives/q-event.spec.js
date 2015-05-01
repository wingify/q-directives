describe('qDirective: q-event (q-click, q-mouseover, etc)', function () {
	'use strict';

	var qCompile, qUpdate, element, scope;

	beforeEach(module('q-directives'));

	beforeEach(inject(function (_qUpdate_, _qCompile_, $rootScope) {
		qUpdate = _qUpdate_;
		qCompile = _qCompile_;
		element = document.createElement('div');
		element.innerHTML = '<ul>' +
			'<li q-click="helloSpy();" id="el0"></li>' +
			'</ul>';
		element = element.firstChild;
		document.body.appendChild(element);

		scope = $rootScope;
		scope.helloSpy = jasmine.createSpy('helloSpy');
	}));

	afterEach(function () {
		document.body.removeChild(element);
	});

	it('registers an event with the eventDelegator that is called whenever the provided event is triggered on the element', function () {
		qCompile(element);
		qUpdate(element, scope);

		// not called yet
		expect(scope.helloSpy).not.toHaveBeenCalled();

		// called only after the click is triggered
		document.querySelector('#el0').click();
		expect(scope.helloSpy).toHaveBeenCalled();

		// lets change the value of the spy
		var originalSpy = scope.helloSpy;
		scope.helloSpy = jasmine.createSpy('helloSpy2');
		originalSpy.reset();

		document.querySelector('#el0').click();
		expect(originalSpy).not.toHaveBeenCalled();
		expect(scope.helloSpy).toHaveBeenCalled();
	});

	it('removes the event handler previously added on scope\'s $destroy event', function () {
		qCompile(element);
		qUpdate(element, scope);

		// lets destroy the scope
		scope.$destroy();

		// trigger the click
		document.querySelector('#el0').click();

		// the listener shouldn't be called since the scope has been destroyed
		expect(scope.helloSpy).not.toHaveBeenCalled();
	});
});