describe('service: qDirectives', function () {
	'use strict';

	var qDirectives, spyService,
		_module = angular.module('q-directives');

	beforeEach(module('q-directives'));

	beforeEach(inject(function (_qDirectives_) {
		qDirectives = _qDirectives_;

		spyService = jasmine.createSpy('spyService').andReturn({thisIs: 'spyService'});
		_module.service('spyService', spyService);

		this.addMatchers({
			toContainItem: function (item) {
				for (var i = this.actual.length; i--;) {
					if (angular.equals(this.actual[i], item)) {
						return true;
					}
				}
			}
		});
	}));

	it('returns an array containing all directives registered thus far', function () {
		expect(qDirectives instanceof Array).toBeTruthy();
	});

	describe('method: _module.qDirective', function () {
		it('adds a new directive to the qDirectives list', function () {
			var directive = { restrict: 'A' };
			_module.qDirective('myDirective', directive);

			expect(qDirectives).toContainItem({ restrict: 'A', name: 'myDirective' });
		});
		it('invokes the directive via $injector if the directive as any dependencies', function () {
			var spyDirective = jasmine.createSpy('spyDirective').andReturn({ restrict: 'A' });
			_module.qDirective('spyDirective', ['spyService', spyDirective]);

			expect(qDirectives).toContainItem({ restrict: 'A', name: 'spyDirective' });

			// the directive should have been invoked with spyService as the first injection
			expect(spyDirective).toHaveBeenCalledWith({thisIs: 'spyService'}); // value returned by the spyService
			expect(spyService).toHaveBeenCalled();
		});
		it('sorts the directives added in increasing order priority', function () {
			var directive1 = { restrict: 'A', priority: 200000 };
			var directive2 = { restrict: 'A', priority: 100000 };

			_module.qDirective('directive1', directive1);
			_module.qDirective('directive2', directive2);

			// directive 2 comes before directive 1
			var i = qDirectives.indexOf(directive1);
			var j = qDirectives.indexOf(directive2);
			expect(i).toBeGreaterThan(j);
		});
		it('considers terminal directives to have maximum priority', function () {
			var directive1 = { restrict: 'A', terminal: true };
			var directive2 = { restrict: 'A', priority: 1e100 }; // super high priority

			_module.qDirective('directive1', directive1);
			_module.qDirective('directive2', directive2);

			// directive 2 comes before directive 1
			var i = qDirectives.indexOf(directive1);
			var j = qDirectives.indexOf(directive2);
			expect(i).toBeGreaterThan(j);
		});
	});
});