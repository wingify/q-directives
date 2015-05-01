(function() {
var module = angular.module('q-directives', [], ['$controllerProvider', '$provide', '$compileProvider', '$filterProvider', function ($controllerProvider, $provide, $compileProvider, $filterProvider) {
	module.controller = angular.bind(this, $controllerProvider.register);
	module.factory = angular.bind(this, $provide.factory);
	module.service = angular.bind(this, $provide.service);
	module.constant = angular.bind(this, $provide.constant);
	module.value = angular.bind(this, $provide.value);
	module.directive = angular.bind(this, $compileProvider.directive);
	module.filter = angular.bind(this, $filterProvider.register);
}]);

module.qDirective = function qDirective(name, directive) {
	module.uninitializedQDirectives = module.uninitializedQDirectives || [];
	module.uninitializedQDirectives.push({name: name, directive: directive});

	return this;
};
})();
(function() {
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
})();
(function() {
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
})();
(function() {
'use strict';

angular.module('q-directives')

.qDirective('q-compile', ['$compile', function ($compile) {
	return {
		restrict: 'A',
		update: angular.identity,
		render: function qCompile(element, scope) {
			if (element.hasAttribute('q-compiled')) { return; }

			element.removeAttribute('q-compile');
			element.setAttribute('q-compiled', '');
			$compile(element)(scope);
		}
	};
}])

.directive('qCompile', function () {
	return {
		restrict: 'A',
		terminal: true,
		priority: 10000
	};
});
})();
(function() {
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
})();
(function() {
'use strict';

angular.module('q-directives')

.qDirective('q-html', ['$sce', function ($sce) {
	return {
		restrict: 'A',
		update: function (scope, getValue) {
			return getValue(scope);
		},
		render: function qHtml(element, value) {
			element.innerHTML = $sce.getTrustedHtml(value);
		}
	};
}]);
})();
(function() {
'use strict';

angular.module('q-directives')

.qDirective('q-init', {
	priority: 2000,
	restrict: 'A',
	update: function (scope, getValue) {
		return getValue(scope);
	}
});
})();
(function() {
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
})();
(function() {
'use strict';

angular.module('q-directives')

.qDirective('q-style', {
	restrict: 'A',
	update: function (scope, getValue) {
		return getValue(scope);
	},
	render: function qStyle(element, value) {
		angular.element(element).css(value);
	}
});
})();
(function() {
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
})();
(function() {
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
})();
(function() {
'use strict';

angular.module('q-directives')

.qDirective('q-watch', ['$injector', function ($injector) {
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
			data.scope.$watch(data.getValue, function () {
				qUpdate(element, data.scope);
			});
		}
	};
}]);
})();
(function() {
'use strict';

angular.module('q-directives')

.directive('q', ['qCompile', 'qUpdate', function (qCompile, qUpdate) {
	return {
		restrict: 'A',
		priority: 11000,
		compile: function (element) {
			qCompile(element.get(0));
			return function (scope) {
				qUpdate(element.get(0), scope);
			};
		}
	};
}]);
})();
(function() {
'use strict';

var slice = Array.prototype.slice;

angular.module('q-directives')

.factory('BatchQueue', ['$timeout', function ($timeout) {
	/**
	 * A task is a simple function to be executed at some later stage.
	 *
	 * @param {Function} callback The function to execute.
	 * @param {Object}   context  The context in which the function will be invoked.
	 * @param {Array}    args     The arguments to be passed to the callback.
	 */
	function Task(callback, context, args) {
		this.callback = callback;
		this.context = context;
		this.args = args;
	}

	/**
	 * Executes the task by calling the provided function.
	 */
	Task.prototype.execute = function () {
		this.callback.apply(this.context, this.args);
	};

	/**
	 * A batch queue is a queue that can be used to batch relatively
	 * expensive tasks in several batches executed at set intervals.
	 *
	 * @param {Number} size     The size of a single batch.
	 * @param {Number} interval The interval after which the next batch should be
	 *                          executed.
	 */
	function BatchQueue(size, interval) {
		this.size = size || 1000;
		this.interval = interval || 4;
		this.queue = [];
	}

	BatchQueue.Task = Task;

	/**
	 * Adds a task to the the batch queue.
	 * @param  {Function} fn      The function to execute.
	 * @param  {Object}   context The context in which the function will be executed.
	 * @param  {...}      args    The arguments to be passed to the function (restparam).
	 */
	BatchQueue.prototype.enqueue = function (fn, context /* , args */) {
		this.queue.push(new Task(fn, context, slice.call(arguments, 2)));
		this.flush();
	};

	/**
	 * Flushes the current batch of tasks. Each batch has a fixed size as defined
	 * by the this.size variable.
	 */
	BatchQueue.prototype.flushBatch = function () {
		for (var i = 0; i < this.size && this.queue.length; i++) {
			this.queue.shift().execute();
		}
	};

	/**
	 * Begins the flushing process. A timeout is set to flush the next batch after
	 * a specific interval elapses. After the batch is flushed, the timeout is set
	 * again, recursively, until all the batches are flushed.
	 */
	BatchQueue.prototype.flush = function () {
		var self = this;
		$timeout.cancel(self.timeout);
		if (self.queue.length) {
			self.timeout = $timeout(function () {
				self.flushBatch();
				self.flush();
			}, self.interval);
		}
	};

	/**
	 * Immediately cancels the batch flushing process, thereby discarding all the
	 * pending tasks.
	 */
	BatchQueue.prototype.cancel = function () {
		this.queue.length = 0;
	};

	return BatchQueue;
}]);

})();
(function() {
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

})();
(function() {
'use strict';

angular.module('q-directives')

.factory('PlaceholderContainer', [function () {
	// Generates an ID that is always unique.
	function uniqueId() {
		uniqueId.i = uniqueId.i || 0;
		return '__' + uniqueId.i++;
	}

	/**
	 * Creates a wrapper around a placeholder element (script tag).
	 */
	function PlaceholderElement() {
		this.id = uniqueId();
	}

	PlaceholderElement.prototype = {
		/**
		 * Returns the reference to the placeholder if it has been inserted in DOM.
		 *
		 * @return {Node} A reference to the placeholder.
		 */
		node: function () {
			if (this._node) {
				return this._node;
			}

			this._node = document.getElementById(this.id);
			if (!this._node) {
				throw new Error('Cannot get node of a placeholder that does not exist in the DOM yet.');
			}
			return this._node;
		},
		/**
		 * Returns a new placeholder node that can be inserted in the DOM.
		 *
		 * @return {Node} A new placeholder that can be inserted in the DOM.
		 */
		nodeToInsert: function () {
			var node = document.createElement('script');
			node.type = 'text/x-placeholder';
			node.id = this.id;
			return node;
		}
	};

	/**
	 * A container made up of two placeholders. It can be used to freely access
	 * and modify contents between the two placeholder elements without having
	 * any impact on the DOM tree or rendering.
	 */
	function PlaceholderContainer() {
		this.placeholderA = new PlaceholderElement();
		this.placeholderB = new PlaceholderElement();
	}

	PlaceholderContainer.prototype = {
		/**
		 * Wraps the placeholder nodes around the given element. Placeholder element
		 * node A will be inserted before the given element and placeholder element
		 * node B will be inserted after the given element.
		 *
		 * The element provided should exist in the DOM for placeholders to work correctly.
		 *
		 * @param  {Node}   element The element node to wrap the placeholders around.
		 * @return {Object}         Self for chaining.
		 */
		wrapAround: function (element) {
			this.replace(element).prepend(element);
			return this;
		},
		/**
		 * Replaces the given element in the DOM with the two placeholder elements.
		 * The element provided should exist in the DOM for placeholders to work correctly.
		 *
		 * @param  {Node} element The element node to replace the placeholder nodes with.
		 * @return {Object}         Self for chaining.
		 */
		replace: function (element) {
			var parent = element.parentNode;
			var nodeA = this.placeholderA.nodeToInsert();
			var nodeB = this.placeholderB.nodeToInsert();
			parent.insertBefore(nodeA, element);
			parent.insertBefore(nodeB, element);
			parent.removeChild(element);

			nodeA.placeholder = this;
			nodeB.placeholder = this;
			return this;
		},
		/**
		 * Inserts the given element before the second placeholder.
		 * @param  {Node}   element The element to insert.
		 * @return {Object}         Self for chaining.
		 */
		append: function (element) {
			var nodeB = this.placeholderB.node();
			nodeB.parentNode.insertBefore(element, nodeB);
			return this;
		},
		/**
		 * Inserts the given element after the first placeholder.
		 * @param  {Node}   element The element to insert.
		 * @return {Object}         Self for chaining.
		 */
		prepend: function (element) {
			var nodeA = this.placeholderA.node();
			nodeA.parentNode.insertBefore(element, nodeA.nextSibling);
			return this;
		},
		/**
		 * Returns all the elements that exist between the two placeholders.
		 * @return {Node[]} A list of all the elements existing between the placeholders.
		 */
		children: function () {
			for (var arr = [],
					child = this.placeholderA.node().nextElementSibling,
					nodeB = this.placeholderB.node();
				child !== nodeB;
				child = child.nextElementSibling) {
				arr.push(child);
			}
			return arr;
		},

		/**
		 * Gets the next element of placeholderB node.
		 */
		next: function () {
			return this.placeholderB.node().nextElementSibling;
		},

		/**
		 * Gets the previous element of placeholderA node.
		 */
		prev: function () {
			return this.placeholderA.node().previousElementSibling;
		},

		/**
		 * Gets the parent of the placeholder.
		 */
		parent: function () {
			return this.placeholderA.node().parentNode;
		}
	};

	//#begin test_code
	angular.extend(PlaceholderContainer, {
		// private classes
		_PlaceholderElement: PlaceholderElement,

		// private functions
		_uniqueId: uniqueId
	});
	//#end test_code

	return PlaceholderContainer;
}]);

})();
(function() {
'use strict';

var slice = Array.prototype.slice;

function removeToInsertLater(element) {
	var parentNode = element.parentNode;
	var nextSibling = element.nextSibling;
	parentNode.removeChild(element);
	return function insertBack() {
		if (nextSibling) {
			parentNode.insertBefore(element, nextSibling);
		} else {
			parentNode.appendChild(element);
		}
	};
}

angular.module('q-directives')

.factory('qCompile', ['$injector', 'qDirectives', '$document', function ($injector, qDirectives, $document) {
	/**
	 * Pre-compiles all the q-directives in the given element.
	 * @param  {Node} element The element to compile.
	 * @return {Node}         The element itself.
	 */
	function qCompile(element) {
		var i, j, k, originalElement, selectors, templateMarkup, terminalQueue = [];
		// iterate over all directives
		for (i = qDirectives.length; i--;) {
			if (qDirectives[i].restrict === 'A') {
				// get all elements with the given directive attribute
				selectors = slice.call(element.querySelectorAll('[' + qDirectives[i].name + ']'));
				// if the element itself has the directive attribute, include it as well
				if (element.hasAttribute(qDirectives[i].name)) {
					selectors.push(element);
				}
				// add classes to help identify the elements easily at a later stage
				for (j = selectors.length; j--;) {
					selectors[j].classList.add('q-directive__' + qDirectives[i].name);

					// pass the markup to a custom compile function, if it exists
					if (typeof qDirectives[i].compile === 'function') {
						qDirectives[i].compile(selectors[j]);
					}

					if (qDirectives[i].terminal) {
						// early return if the element has a terminal directive
						if (selectors[j] === element) { return; }
						// else add the element to terminal queue
						terminalQueue.push(removeToInsertLater(selectors[j]));
					}
				}
			} else if (qDirectives[i].restrict === 'E') {
				selectors = slice.call(element.getElementsByTagName(qDirectives[i].name));
				for (j = selectors.length; j--;) {
					originalElement = selectors[j];
					// if no template, nothing to do
					if (qDirectives[i].template) {
						// replace the element directive with its template
						if (typeof qDirectives[i].template === 'string') {
							templateMarkup = $document[0].createElement('div');
							templateMarkup.innerHTML = qDirectives[i].template;
							qDirectives[i].template = templateMarkup = templateMarkup.firstChild;
						} else {
							templateMarkup = qDirectives[i].template;
						}

						templateMarkup = templateMarkup.cloneNode(true);
						templateMarkup.classList.add('q-directive__' + qDirectives[i].name);
						originalElement.parentNode.insertBefore(templateMarkup, originalElement);
						originalElement.parentNode.removeChild(originalElement);

						// copy over classes, attributes and data attributes from the old element to the new element
						for (k = originalElement.attributes.length; k--;) {
							if (originalElement.attributes[k].name === 'class') {
								templateMarkup.setAttribute(originalElement.attributes[k].name,
									[originalElement.attributes[k].value, templateMarkup.getAttribute('class')].join(' ')
								);
								continue;
							}
							templateMarkup.setAttribute(originalElement.attributes[k].name, originalElement.attributes[k].value);
						}

						for (k in originalElement.dataset) {
							if (originalElement.dataset.hasOwnProperty(k)) {
								templateMarkup.dataset[k] = originalElement.dataset[k];
							}
						}

						originalElement = templateMarkup;
					} else {
						selectors[j].classList.add('q-directive__' + qDirectives[i].name);
					}

					// pass the markup to a custom compile function, if it exists
					if (typeof qDirectives[i].compile === 'function') {
						qDirectives[i].compile(originalElement);
					}

					if (qDirectives[i].terminal) {
						// early return if the element has a terminal directive
						if (selectors[j] === element) { return; }
						// else add the element to terminal queue
						terminalQueue.push(removeToInsertLater(selectors[j]));
					}
				}
			}
		}
		for (i = terminalQueue.length; i--;) {
			terminalQueue[i]();
		}
		return element;
	}

	return qCompile;
}]);

})();
(function() {
'use strict';

var qDirectives,
	module = angular.module('q-directives');

module.factory('qDirectives', ['$injector', function ($injector) {
	qDirectives = [];
	module.qDirective = function qDirective(name, directive) {
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

	for (var i = module.uninitializedQDirectives.length; i--;) {
		var d = module.uninitializedQDirectives[i];
		module.qDirective(d.name, d.directive);
	}

	return qDirectives;
}]);

})();
(function() {
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

})();