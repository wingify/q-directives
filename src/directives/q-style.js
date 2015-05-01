'use strict';

angular.module('q-directives')

.qDirective('q-style', {
	restrict: 'A',
	update: function (scope, getValue) {
		return getValue(scope);
	},
	render: function qStyle(element, value) {
		angular.element(element).css(value);
	}
});