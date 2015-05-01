describe('qDirective: q-watch', function () {
	'use strict';

	var qCompile, qUpdate, element, fragment, scope;

	beforeEach(module('q-directives'));

	beforeEach(inject(function (_qUpdate_, _qCompile_, $rootScope) {
		this.addMatchers({
			toHaveAttribute: function (attrName) {
				return this.actual.hasAttribute(attrName);
			},
			toHaveTextContent: function (textContent) {
				return this.actual.textContent === textContent;
			}
		});

		qUpdate = _qUpdate_;
		qCompile = _qCompile_;
		fragment = document.createDocumentFragment();
		element = document.createElement('div');
		element.innerHTML = '<div q-watch="someDynamicValue" q-text="someDynamicValue"></div>';
		element = element.firstChild;
		fragment.appendChild(element);
		scope = $rootScope;
		scope.someDynamicValue = 'Dynamic value 1';
	}));

	it('adds a watcher on the given scope on first render (update)', function () {
		// initially watchers are null
		expect(scope.$$watchers).toBeFalsy();

		qCompile(element);
		qUpdate(element, scope);

		// watcher added
		expect(scope.$$watchers.length).toBe(1);

		qUpdate(element, scope);

		// no watcher added after the first one
		expect(scope.$$watchers.length).toBe(1);
	});

	it('adds an attribute q-watched to the provided element on first render', function () {
		// attribute absent
		expect(element).not.toHaveAttribute('q-watched');

		qCompile(element);
		qUpdate(element, scope);

		// attribute added
		expect(element).toHaveAttribute('q-watched');

		qUpdate(element, scope);

		// attribute still present
		expect(element).toHaveAttribute('q-watched');
	});

	it('triggers qUpdate on the given element on every watch listener', function () {
		qCompile(element);
		qUpdate(element, scope);

		expect(element).toHaveTextContent('Dynamic value 1');

		scope.someDynamicValue = 'Dynamic value 2';
		scope.$digest();

		// the value updates automatically on digest
		expect(element).toHaveTextContent('Dynamic value 2');
	});
});