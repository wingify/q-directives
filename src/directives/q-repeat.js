'use strict';

angular.module('q-directives')

.qDirective('q-repeat', ['$timeout', '$injector', function ($timeout, $injector) {
	return {
		priority: 10000,
		terminal: true,
		restrict: 'A',
		compile: function (element) {
			if (element.hasAttribute('q-repeat-compiled')) { return; }

			element.setAttribute('q-repeat-compiled', element.getAttribute('q-repeat'));
			element.removeAttribute('q-repeat');

			var qCompile = $injector.get('qCompile');
			qCompile(element);
		},
		update: angular.identity,
		render: function (element, scope) {
			var command, iterator, iteratorKey, list, placeholder, existingScopes;
			var PlaceholderContainer = $injector.get('PlaceholderContainer');
			var qUpdate = $injector.get('qUpdate');

			function watchCollectionListener(list) {
				var i, il, hash, key, item, current, childScope;
				var fragment = document.createDocumentFragment();
				var existingChildren = placeholder.children().filter(function (child) {
					return child.hasAttribute('q-repeat-compiled');
				});

				if (!angular.isArray(list)) {
					hash = list;
					list = Object.keys(list);
				}

				for (i = 0, il = list.length; i < il; i++) {
					if (hash) {
						key = list[i];
						item = hash[key];
					} else {
						item = list[i];
					}
					if (existingChildren[i]) {
						current = existingChildren[i];
					} else {
						current = element.cloneNode(true);
					}

					childScope = existingScopes[i] || scope.$new();
					existingScopes[i] = childScope;

					if (typeof iteratorKey !== 'undefined') {
						childScope[iteratorKey] = key;
					}
					childScope[iterator] = item;

					qUpdate(current, childScope);

					if (!existingChildren[i]) {
						fragment.appendChild(current);
					}
				}

				// remove the children that remain
				var newChildrenCount = i;
				for (il = existingChildren.length; i < il; i++) {
					existingChildren[i].parentNode.removeChild(existingChildren[i]);
					existingScopes[i].$destroy();
				}
				// destroy references to all remaining children and scopes
				existingScopes.length = existingChildren.length = newChildrenCount;

				placeholder.append(fragment);
			}

			command = element.getAttribute('q-repeat-compiled').split(/\s*in\s*/);
			iterator = command[0];
			if (iterator.indexOf(':') >= 0) {
				iterator = iterator.split(/\s*:\s*/);
				iteratorKey = iterator[0];
				iterator = iterator[1];
			}
			list = command[1];
			if (!scope['_watched_' + list]) {
				existingScopes = [];

				placeholder = new PlaceholderContainer();
				placeholder.wrapAround(element);
				element.parentNode.removeChild(element);

				scope.$watch(list, watchCollectionListener);
				scope.$watchCollection(list, watchCollectionListener);
				Object.defineProperty(scope, '_watched_' + list, { value: true });
			}
		}
	};
}]);