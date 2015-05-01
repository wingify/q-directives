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
