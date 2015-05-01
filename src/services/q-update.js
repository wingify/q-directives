'use strict';

angular.module('q-directives')

.factory('qUpdate', ['$parse', 'qDirectives', function ($parse, qDirectives) {
	var slice = [].slice;

	/**
	 * Updates a qCompiled element with given scope.
	 * @param  {Node}   element The element to update. This element must be compiled
	 *                          beforehand by using qCompile.
	 * @param  {Object} scope   The updated scope values to refresh all the q-directives using.
	 * @return {Node}           The element itself.
	 */
	function qUpdate(element, scope) {
		var i, j, k, selectors, newScope, key, getValue;
		// iterate over all directives
		for (i = qDirectives.length; i--;) {
			// get all selectors that have the directive
			selectors = slice.call(element.getElementsByClassName('q-directive__' + qDirectives[i].name));
			if (qDirectives[i].restrict === 'A') {
				if (element.classList.contains('q-directive__' + qDirectives[i].name)) {
					selectors.push(element);
				}
			}
			for (j = selectors.length; j--;) {
				newScope = scope;
				// create a new scope if directive.scope is defined in config
				if (qDirectives[i].scope) {
					newScope = {};
					for (k = qDirectives[i].scope.length; k--;) {
						key = qDirectives[i].scope[k];
						newScope[key] = $parse(selectors[j].dataset[key])(scope);
					}
				}
				if (typeof qDirectives[i].update === 'function') {
					if (qDirectives[i].restrict === 'A') {
						getValue = $parse(selectors[j].getAttribute(qDirectives[i].name));
					}
					newScope = qDirectives[i].update(newScope, getValue);
				}

				if (typeof qDirectives[i].render === 'function') {
					qDirectives[i].render(selectors[j], newScope);
				}
			}
		}

		return element;
	}

	return qUpdate;
}]);
