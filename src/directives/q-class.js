'use strict';

angular.module('q-directives')

.qDirective('q-class', {
	restrict: 'A',
	update: function (scope, getValue) {
		return getValue(scope);
	},
	render: function qClass(element, value) {
		if (value && typeof value === 'string') {
			return element.classList.add(value);
		}
		if (typeof value !== 'object') { return; }
		var classesToAdd = [], classesToRemove = [];
		var keys = Object.keys(value);
		for (var i = keys.length; i--;) {
			var klass = keys[i];
			var valid = value[klass];
			var classes = klass.split(/\s+/);
			for (var j = classes.length; j--;) {
				if (!classes[j]) { continue; }
				if (valid) {
					classesToAdd.push(classes[j]);
				} else {
					classesToRemove.push(classes[j]);
				}
			}
		}

		element.classList.add.apply(element.classList, classesToAdd);
		element.classList.remove.apply(element.classList, classesToRemove);
	}
});