'use strict';

angular.module('q-directives')

.factory('eventDelegator', ['$rootScope', function ($rootScope) {
	var listeners = {}, delegatedElements = 0;
	var globalListeners = {};

	/**
	 * Adds a global event listener for the particular event.
	 * This event listener manages all event listeners delegated to the
	 * eventDelegator for this particular event.
	 *
	 * @param {String} event The name of the event to add the listener for.
	 */
	function addGlobalEventListener(event) {
		if (typeof globalListeners[event] === 'function') {
			return; // listener already added
		}
		listeners[event] = {};
		globalListeners[event] = function globalEventListener(e) {
			var target = e.target;
			var elemId;
			while (true) {
				if (!target) { return; } // no element found
				elemId = target.dataset && target.dataset.delegatedElementId;
				if (elemId) { break; } // element found
				target = target.parentNode;
			}

			var currentListeners = listeners[event][elemId];
			if (angular.isArray(currentListeners)) {
				for (var i = currentListeners.length; i--;) {
					// execute the listener
					currentListeners[i].call(target, e);
					var scope = angular.element(target).scope();
					// and apply scope
					(scope || $rootScope).$apply();
				}
			}
		};

		document.body.addEventListener(event, globalListeners[event]);
	}

	/**
	 * Removes the listener added in the function above for the given
	 * event name.
	 *
	 * @param  {String} event The event name to add the listener for.
	 */
	function removeGlobalEventListener(event) {
		if (typeof globalListeners[event] === 'function') {
			document.body.removeEventListener(event, globalListeners[event]);
			delete globalListeners[event];
		}
	}

	/**
	 * Returns an object that can be used to add and remove event listeners
	 * for the provided element.
	 *
	 * @param  {Node}   element The element to delegate events for.
	 * @return {Object}         An object with methods `on` and `off` that can be
	 *                          used to manage event listeners.
	 */
	function eventDelegator(element) {
		if (!element.dataset.hasOwnProperty('delegatedElementId')) {
			element.dataset.delegatedElementId = delegatedElements++;
		}
		var elemId = element.dataset.delegatedElementId;
		return {
			/**
			 * Adds an event listener on the given element for the event provided.
			 * @param  {String}   event    The name of the event to add the listener for.
			 * @param  {Function} listener The callback function to call when the event occurs.
			 * @return {Object}            Self for chaining.
			 */
			on: function (event, listener) {
				if (!listeners[event]) {
					addGlobalEventListener(event);
				}

				if (!listeners[event][elemId]) {
					listeners[event][elemId] = [];
				}
				listeners[event][elemId].push(listener);
				return this;
			},
			/**
			 * Removes the provided event listener from the event list of the given element.
			 * If the second argument is omitted, all listeners for the given event are
			 * removed.
			 *
			 * @param  {String}   event    The name of the event to remove the event listener for.
			 * @param  {Function} listener Reference to the listener callback function to remove.
			 * @return {Object}            Self for chaining.
			 */
			off: function (event, listener) {
				var currentListeners = listeners[event] && listeners[event][elemId];
				if (!currentListeners) { return; }
				if (listener) {
					for (var i = currentListeners.length; i--;) {
						if (currentListeners[i] === listener) {
							currentListeners.splice(i, 1);
						}
					}
				} else {
					currentListeners.length = 0;
				}

				if (!currentListeners.length) {
					delete listeners[event][elemId];
				}

				if (angular.equals({}, listeners[event])) {
					delete listeners[event];
					removeGlobalEventListener(event);
				}

				if (angular.equals({}, listeners)) {
					delete element.dataset.delegatedElementId;
				}
				return this;
			}
		};
	}

	//#begin test_code
	angular.extend(eventDelegator, {
		// private functions
		_addGlobalEventListener: addGlobalEventListener,
		_removeGlobalEventListener: removeGlobalEventListener
	});
	//#end test_code

	return eventDelegator;
}]);
