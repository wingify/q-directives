'use strict';

var qDirectives,
	_module = angular.module('q-directives');

_module.factory('qDirectives', ['$injector', function ($injector) {
	qDirectives = [];
	_module.qDirective = function qDirective(name, directive) {
		if (typeof directive === 'function' ||
			(angular.isArray(directive) && typeof directive[directive.length - 1] === 'function')) {
			qDirectives.push(angular.extend($injector.invoke(directive), {name: name}));
		} else {
			directive.name = name;
			qDirectives.push(directive);
		}
		// sort in ascending order of priority, since qCompile and qUpdate iterate in the reverse order
		qDirectives.sort(function (a, b) {
			var aPriority = a.priority || 0;
			var bPriority = b.priority || 0;

			// Terminal directives always have an implicit super high priority
			if (a.terminal) { aPriority = Infinity; }
			if (b.terminal) { bPriority = Infinity; }
			return aPriority - bPriority;
		});
	};

	for (var i = _module.uninitializedQDirectives.length; i--;) {
		var d = _module.uninitializedQDirectives[i];
		_module.qDirective(d.name, d.directive);
	}

	return qDirectives;
}]);
