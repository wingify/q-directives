'use strict';

angular.module('q-directives')

.qDirective('q-html', ['$sce', function ($sce) {
	return {
		restrict: 'A',
		update: function (scope, getValue) {
			return getValue(scope);
		},
		render: function qHtml(element, value) {
			element.innerHTML = $sce.getTrustedHtml(value);
		}
	};
}]);