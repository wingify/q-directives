'use strict';

angular.module('q-directives')

.qDirective('q-compile', ['$compile', function ($compile) {
	return {
		restrict: 'A',
		update: angular.identity,
		render: function qCompile(element, scope) {
			if (element.hasAttribute('q-compiled')) { return; }

			element.removeAttribute('q-compile');
			element.setAttribute('q-compiled', '');
			$compile(element)(scope);
		}
	};
}])

.directive('qCompile', function () {
	return {
		restrict: 'A',
		terminal: true,
		priority: 10000
	};
});