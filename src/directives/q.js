'use strict';

angular.module('q-directives')

.directive('q', ['qCompile', 'qUpdate', function (qCompile, qUpdate) {
	return {
		restrict: 'A',
		priority: 11000,
		compile: function (element) {
			qCompile(element.get(0));
			return function (scope) {
				qUpdate(element.get(0), scope);
			};
		}
	};
}]);