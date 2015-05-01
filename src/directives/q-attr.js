'use strict';

angular.module('q-directives')

.qDirective('q-attr', {
	restrict: 'A',
	update: function (scope, getValue) {
		return getValue(scope);
	},
	render: function qAttr(element, value) {
		var keys = Object.keys(value);
		for (var i = keys.length; i--;) {
			element.setAttribute(keys[i], value[keys[i]]);
		}
	}
});