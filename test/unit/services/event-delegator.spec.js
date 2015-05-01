describe('service: eventDelegator', function () {
	'use strict';

	var eventDelegator, element, delegate;

	beforeEach(module('q-directives'));
	beforeEach(inject(function (_eventDelegator_) {
		eventDelegator = _eventDelegator_;
		element = document.createElement('div');
		angular.element('body').append(element);
		delegate = eventDelegator(element);
	}));
	afterEach(function () {
		angular.element(element).remove();
	});

	it('when called returns an object with two methods: `on` and `off` that can be used to manage event listeners', function () {
		expect(typeof delegate.on).toBe('function');
		expect(typeof delegate.off).toBe('function');
	});

	it('adds a data attribute delegatedElementId to the supplied element', function () {
		expect(element.dataset.delegatedElementId).toBe('0');
		expect(element.getAttribute('data-delegated-element-id')).toBe('0');
	});

	it('adds the data attribute only once even if a new delegate is created', function () {
		expect(element.dataset.delegatedElementId).toBe('0');
		eventDelegator(element);
		expect(element.dataset.delegatedElementId).toBe('0');
	});

	describe('method: on', function () {
		it('adds an event listener for that event and element', function () {
			var clickSpy = jasmine.createSpy('clickSpy');
			delegate.on('click', clickSpy);
			element.click();
			expect(clickSpy).toHaveBeenCalled();
			expect(clickSpy.mostRecentCall.args[0].target).toBe(element);
		});
	});

	describe('method: off', function () {
		it('removes the given event listener for that event and element', function () {
			var clickSpy = jasmine.createSpy('clickSpy');
			var clickSpy2 = jasmine.createSpy('clickSpy2');
			delegate.on('click', clickSpy);
			delegate.on('click', clickSpy2);
			delegate.off('click', clickSpy);
			element.click();
			expect(clickSpy).not.toHaveBeenCalled();
			expect(clickSpy2).toHaveBeenCalled();
		});
		it('removes all event listeners if second parameter is omitted', function () {
			var clickSpy = jasmine.createSpy('clickSpy');
			var clickSpy2 = jasmine.createSpy('clickSpy2');
			delegate.on('click', clickSpy);
			delegate.on('click', clickSpy2);
			delegate.off('click');
			element.click();
			expect(clickSpy).not.toHaveBeenCalled();
			expect(clickSpy2).not.toHaveBeenCalled();
		});
		it('removes delegatedElementId data attribute from the element if all its listeners have been removed', function () {
			var clickSpy = jasmine.createSpy('clickSpy');
			var mousedownSpy = jasmine.createSpy('mousedownSpy');
			delegate.on('click', clickSpy);
			delegate.on('mousedown', mousedownSpy);
			expect(element.dataset.delegatedElementId).toBe('0');

			delegate.off('click');
			expect(element.dataset.delegatedElementId).toBe('0');

			delegate.off('mousedown');
			expect(element.dataset.hasOwnProperty('delegatedElementId')).toBe(false);
		});
	});
});