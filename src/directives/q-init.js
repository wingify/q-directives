'use strict';

angular.module('q-directives')

.qDirective('q-init', {
	priority: 2000,
	restrict: 'A',
	update: function (scope, getValue) {
		return getValue(scope);
	}
});