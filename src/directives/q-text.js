'use strict';

angular.module('q-directives')

.qDirective('q-text', {
	restrict: 'A',
	update: function (scope, getValue) {
		return getValue(scope);
	},
	render: function qText(element, value) {
		element.textContent = value;
	}
});