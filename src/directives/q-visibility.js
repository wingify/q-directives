'use strict';

angular.module('q-directives')

.qDirective('q-show', {
	restrict: 'A',
	update: function (scope, getValue) {
		return getValue(scope);
	},
	render: function qShow(element, value) {
		if (value) {
			element.classList.remove('ng-hide');
		} else {
			element.classList.add('ng-hide');
		}
	}
})

.qDirective('q-hide', {
	restrict: 'A',
	update: function (scope, getValue) {
		return getValue(scope);
	},
	render: function qHide(element, value) {
		if (value) {
			element.classList.add('ng-hide');
		} else {
			element.classList.remove('ng-hide');
		}
	}
});