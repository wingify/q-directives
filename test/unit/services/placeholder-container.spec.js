describe('class: PlaceholderContainer', function () {
	'use strict';

	var PlaceholderContainer, PlaceholderElement, element;

	beforeEach(module('q-directives'));
	beforeEach(inject(function (_PlaceholderContainer_) {
		PlaceholderContainer = _PlaceholderContainer_;
		PlaceholderElement = PlaceholderContainer._PlaceholderElement;

		element = document.createElement('div');
		angular.element('body').append(element);
	}));
	afterEach(function () {
		angular.element(element).remove();
		var scripts = document.body.querySelectorAll('script[type="text/x-placeholder"]');
		angular.forEach(scripts, function (script) {
			angular.element(script).remove();
		});
	});

	describe('method: uniqueId', function () {
		it('always returns a unique id that is incremented on each call', function () {
			expect(PlaceholderContainer._uniqueId()).toBe('__0');
			expect(PlaceholderContainer._uniqueId()).toBe('__1');
			expect(PlaceholderContainer._uniqueId()).toBe('__2');
			expect(PlaceholderContainer._uniqueId()).toBe('__3');
		});
	});

	describe('class: PlaceholderElement', function () {
		describe('method: constructor', function () {
			it('assigns a unique id to itself (that is unique for each element created)', function () {
				expect(new PlaceholderElement().id).toBe('__0');
				expect(new PlaceholderElement().id).toBe('__1');
			});
		});

		describe('method: nodeToInsert', function () {
			it('gives back a script node to insert in the DOM', function () {
				var el = new PlaceholderElement();
				var scriptNode = el.nodeToInsert();
				expect(scriptNode.nodeName.toLowerCase()).toBe('script');
				expect(scriptNode.type).toBe('text/x-placeholder');
				expect(scriptNode.getAttribute('id')).toBe('__0');
			});
		});

		describe('method: node', function () {
			it('throws an error if trying to access a placeholder that does not exist in the DOM', function () {
				var el = new PlaceholderElement();
				expect(function () {
					return el.node();
				}).toThrow();
			});
			it('gives back the placeholder element inserted in DOM earlier', function () {
				var el = new PlaceholderElement();
				angular.element('body').append(el.nodeToInsert());

				var scriptNode = el.node();
				expect(scriptNode.nodeName.toLowerCase()).toBe('script');
				expect(scriptNode.type).toBe('text/x-placeholder');
				expect(scriptNode.getAttribute('id')).toBe('__0');

				// cleanup
				angular.element(scriptNode).remove();
			});
			it('caches the node after getting it once in this._node', function () {
				var el = new PlaceholderElement();
				angular.element('body').append(el.nodeToInsert());

				var scriptNode = el.node();
				expect(el._node).toBe(scriptNode);
			});
		});
	});

	describe('method: constructor', function () {
		it('creates two placeholder elements and assigns to itself', function () {
			var container = new PlaceholderContainer();
			expect(container.placeholderA).toEqual(jasmine.any(PlaceholderElement));
			expect(container.placeholderB).toEqual(jasmine.any(PlaceholderElement));
		});
	});

	describe('method: wrapAround', function () {
		it('wraps the placeholder elements around the element provided', function () {
			var container = new PlaceholderContainer();
			container.wrapAround(element);

			expect(element.previousElementSibling).toBe(container.placeholderA.node());
			expect(element.nextElementSibling).toBe(container.placeholderB.node());
		});
	});

	describe('method: replace', function () {
		it('replaces the element with the placeholder elements', function () {
			var elementPrevSibling = element.previousElementSibling;
			var container = new PlaceholderContainer();
			container.replace(element);

			expect(element.parentNode).toBe(null);
			expect(elementPrevSibling.nextElementSibling).toBe(container.placeholderA.node());
			expect(elementPrevSibling.nextElementSibling.nextElementSibling).toBe(container.placeholderB.node());
		});
	});

	describe('method: append', function () {
		it('throws error if the container has not been inserted by calling replace or wrapAround', function () {
			var container = new PlaceholderContainer();
			expect(function () {
				container.append(document.createElement('div'));
			}).toThrow();
		});
		it('inserts the given node before placeholderB', function () {
			var container = new PlaceholderContainer();
			container.wrapAround(element);

			var myDiv = document.createElement('div');
			container.append(myDiv);
			expect(container.placeholderB.node().previousElementSibling).toBe(myDiv);
		});
	});

	describe('method: prepend', function () {
		it('throws error if the container has not been inserted by calling replace or wrapAround', function () {
			var container = new PlaceholderContainer();
			expect(function () {
				container.prepend(document.createElement('div'));
			}).toThrow();
		});
		it('inserts the given node after placeholderA', function () {
			var container = new PlaceholderContainer();
			container.wrapAround(element);

			var myDiv = document.createElement('div');
			container.prepend(myDiv);
			expect(container.placeholderA.node().nextElementSibling).toBe(myDiv);
		});
	});

	describe('method: children', function () {
		it('throws error if the container has not been inserted by calling replace or wrapAround', function () {
			var container = new PlaceholderContainer();
			expect(function () {
				container.children();
			}).toThrow();
		});
		it('gives back an array of all elements that exist between placeholderA and placeholderB', function () {
			var container = new PlaceholderContainer();
			container.wrapAround(element);

			var myDiv = document.createElement('div');
			var myDiv2 = document.createElement('div');
			container.prepend(myDiv);
			container.append(myDiv2);

			var children = container.children();
			expect(children[0]).toBe(myDiv);
			expect(children[1]).toBe(element);
			expect(children[2]).toBe(myDiv2);
		});
	});
});