describe('qDirective: q-repeat', function () {
	'use strict';

	var qCompile, qUpdate, element, scope;

	beforeEach(module('q-directives'));

	beforeEach(inject(function (_qUpdate_, _qCompile_, $rootScope) {
		this.addMatchers({
			toHaveClass: function (className) {
				return this.actual.classList.contains(className);
			},
			toHaveAttribute: function (attrName, attrValue) {
				if (attrValue) {
					return this.actual.getAttribute(attrName) === attrValue;
				}
				return this.actual.hasAttribute(attrName);
			},
			toHaveNodeName: function (nodeName) {
				return this.actual.nodeName.toLowerCase() === nodeName.toLowerCase();
			}
		});

		qUpdate = _qUpdate_;
		qCompile = _qCompile_;
		element = document.createElement('div');
		element.innerHTML = '<div q-repeat="item in list" class="repeated-item"><span q-text="item"></span></div>';

		// q-repeat has to be added to DOM to work properly
		// todo: make it work without it in the future
		document.body.appendChild(element);

		scope = $rootScope;
		scope.list = ['hello world', 'yellow world', 'fellow world'];
	}));

	afterEach(function () {
		document.body.removeChild(element);
	});

	it('adds an attribute `q-repeat-compiled` on compilation and removes the `q-repeat` attribute', function () {
		qCompile(element);

		expect(element.firstChild).not.toHaveAttribute('q-repeat');
		expect(element.firstChild).toHaveAttribute('q-repeat-compiled', 'item in list');
	});

	it('compiles the element on its own, even though it is a terminal directive', function () {
		qCompile(element);
		expect(element.firstChild.firstChild).toHaveClass('q-directive__q-text');
	});

	it('adds a watcher on the list given on first render', function () {
		expect(scope.$$watchers).toBeFalsy();

		qCompile(element);
		qUpdate(element, scope);

		// adds a private property
		/* jshint camelcase: false */
		expect(scope._watched_list).toBe(true);
		expect(scope.$$watchers.length).toBe(2); // 2 watchers added

		qUpdate(element, scope);

		expect(scope.$$watchers.length).toBe(2); // no change
	});

	it('creates child scopes for each item in the list, each with an `item` property defined', function () {
		expect(scope.$$childHead).toBeFalsy();
		expect(scope.$$childTail).toBeFalsy();

		qCompile(element);
		qUpdate(element, scope);

		scope.$digest();

		// `item` is added on each of the child scopes
		expect(scope.$$childHead.item).toBe('hello world');
		expect(scope.$$childHead.$$nextSibling.item).toBe('yellow world');
		expect(scope.$$childHead.$$nextSibling.$$nextSibling.item).toBe('fellow world');

		// three child scopes added
		expect(scope.$$childHead.$$nextSibling.$$nextSibling).toBe(scope.$$childTail);
	});

	it('defines both key, value properties on the child scopes created, if defined in the attribute', function () {
		element.firstChild.setAttribute('q-repeat', 'key:value in object');
		scope.object = {
			a: 'apples',
			b: 'bananas',
			c: 'cherries'
		};

		qCompile(element);
		qUpdate(element, scope);

		scope.$digest();

		var scopes = [
			scope.$$childHead,
			scope.$$childHead.$$nextSibling,
			scope.$$childHead.$$nextSibling.$$nextSibling
		];

		// `key` and `value` are added on each of the child scopes
		expect(scopes[0].key).toBe('a');
		expect(scopes[0].value).toBe('apples');
		expect(scopes[1].key).toBe('b');
		expect(scopes[1].value).toBe('bananas');
		expect(scopes[2].key).toBe('c');
		expect(scopes[2].value).toBe('cherries');
	});

	it('adds script placeholders instead of the element on first render', function () {
		qCompile(element);
		qUpdate(element, scope);

		expect(element.firstChild).toHaveNodeName('script');
		expect(element.firstChild).toHaveAttribute('id', '__0');
		expect(element.lastChild).toHaveNodeName('script');
		expect(element.lastChild).toHaveAttribute('id', '__1');
	});

	it('clones nodes for each item in the list and renders all the q-directives in them', function () {
		// initially only one item exists
		expect(element.getElementsByClassName('repeated-item').length).toBe(1);

		qCompile(element);
		qUpdate(element, scope);

		scope.$digest();

		expect(element.getElementsByClassName('repeated-item').length).toBe(3);

		// q-text compiled for each q-repeat
		var elements = element.querySelectorAll('[q-text]');
		expect(elements[0].textContent).toBe('hello world');
		expect(elements[1].textContent).toBe('yellow world');
		expect(elements[2].textContent).toBe('fellow world');
	});

	it('works well when iterating on both arrays and objects', function () {
		scope.list = {
			a: 'apples',
			b: 'bananas',
			c: 'cherries'
		};

		qCompile(element);
		qUpdate(element, scope);

		scope.$digest();

		// `item` is added on each of the child scopes
		expect(scope.$$childHead.item).toBe('apples');
		expect(scope.$$childHead.$$nextSibling.item).toBe('bananas');
		expect(scope.$$childHead.$$nextSibling.$$nextSibling.item).toBe('cherries');

		// the elements should be updated
		var elements = element.querySelectorAll('[q-text]');
		expect(elements[0].textContent).toBe('apples');
		expect(elements[1].textContent).toBe('bananas');
		expect(elements[2].textContent).toBe('cherries');
	});

	it('calls qUpdate on each element when the list is updated', function () {
		qCompile(element);
		qUpdate(element, scope);

		scope.$digest();

		var elements = element.querySelectorAll('[q-text]');
		expect(elements[0].textContent).toBe('hello world');
		expect(elements[1].textContent).toBe('yellow world');
		expect(elements[2].textContent).toBe('fellow world');

		// update the list
		scope.list = ['apples', 'oranges', 'mangoes'];
		scope.$digest();

		// elements should be updated
		expect(elements[0].textContent).toBe('apples');
		expect(elements[1].textContent).toBe('oranges');
		expect(elements[2].textContent).toBe('mangoes');
	});

	it('does not create new scopes for each update unless a new element is added', function () {
		qCompile(element);
		qUpdate(element, scope);

		scope.$digest();

		var originalScopes = [
			scope.$$childHead,
			scope.$$childHead.$$nextSibling,
			scope.$$childHead.$$nextSibling.$$nextSibling
		];

		scope.list = ['apples', 'oranges', 'mangoes'];
		scope.$digest();

		// the scopes remain the same
		expect(scope.$$childHead).toBe(originalScopes[0]);
		expect(scope.$$childHead.$$nextSibling).toBe(originalScopes[1]);
		expect(scope.$$childHead.$$nextSibling.$$nextSibling).toBe(originalScopes[2]);
		expect(scope.$$childHead.$$nextSibling.$$nextSibling.$$nextSibling).toBeFalsy(); // just 3 scopes

		scope.list.push('bananas');
		scope.$digest();

		expect(scope.$$childHead.$$nextSibling.$$nextSibling.$$nextSibling).toBeTruthy();
		expect(scope.$$childHead.$$nextSibling.$$nextSibling.$$nextSibling.item).toBe('bananas');
	});

	it('destroys any remaining scopes if the number of items in the new list is less than the old one', function () {
		qCompile(element);
		qUpdate(element, scope);

		scope.$digest();

		// there are three scopes
		expect(scope.$$childHead.$$nextSibling.$$nextSibling).toBe(scope.$$childTail);

		// pop an item
		scope.list.pop();
		scope.$digest();

		// there are two scopes left
		expect(scope.$$childHead.$$nextSibling).toBe(scope.$$childTail);
	});

	it('destroys any remaining elements if the number of items in the new list is less than the old one', function () {
		qCompile(element);
		qUpdate(element, scope);

		scope.$digest();

		expect(element.querySelectorAll('[q-text]').length).toBe(3);

		// pop an item
		scope.list.pop();
		scope.$digest();

		// two left
		expect(element.querySelectorAll('[q-text]').length).toBe(2);
	});
});