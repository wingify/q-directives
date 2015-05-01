'use strict';

function qEventDirective(event) {
	return ['eventDelegator', function (eventDelegator) {
		return {
			restrict: 'A',
			update: function eventUpdate(scope, getValue) {
				return {
					scope: scope,
					listener: function listener() {
						return getValue(scope);
					}
				};
			},
			render: function eventRender(element, data) {
				var delegate = eventDelegator(element);
				delegate.off(event);
				delegate.on(event, data.listener);
				data.scope.$on('$destroy', function () {
					delegate.off(event, data.listener);
				});
			}
		};
	}];
}

var events = ['click', 'mouseover', 'mouseout'];

for (var i = events.length; i--;) {
	angular.module('q-directives').qDirective('q-' + events[i], qEventDirective(events[i]));
}