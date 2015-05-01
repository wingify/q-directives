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
