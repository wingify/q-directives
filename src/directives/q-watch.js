'use strict';

function qWatchDirective(watchFnName, deepWatch) {
	return ['$injector', function ($injector) {
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
				data.scope[watchFnName](data.getValue, function () {
					qUpdate(element, data.scope);
				}, deepWatch);
			}
		};
	}];
}

angular.module('q-directives')

.qDirective('q-watch', qWatchDirective('$watch'))
.qDirective('q-watch-deep', qWatchDirective('$watch', true))
.qDirective('q-watch-collection', qWatchDirective('$watchCollection'))
.qDirective('q-watch-group', qWatchDirective('$watchGroup'));