'use strict';

angular.module('q-directives')

.qDirective('q-watch', ['$injector', function ($injector) {
	return {
		restrict: 'A',
		update: function (scope, getValue) {
			return {
				scope: scope,
				getValue: getValue
			};
		},
		render: function qWatch(element, data) {
			// get using injector, otherwise a cyclic dependency issue is caused
			var qUpdate = $injector.get('qUpdate');
			if (element.hasAttribute('q-watched')) { return; }

			element.setAttribute('q-watched', '');
			data.scope.$watch(data.getValue, function () {
				qUpdate(element, data.scope);
			});
		}
	};
}]);