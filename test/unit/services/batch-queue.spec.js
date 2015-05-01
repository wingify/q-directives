describe('class: BatchQueue', function () {
	'use strict';

	var BatchQueue;

	beforeEach(module('q-directives'));
	beforeEach(inject(function (_BatchQueue_) {
		BatchQueue = _BatchQueue_;
	}));

	describe('class: Task', function () {
		describe('method: constructor', function () {
			it('assigns callback, context and args to itself', function () {
				var spy = jasmine.createSpy('taskCallback');
				var ctx = {};
				var args = [1, 2, 3];
				var task = new BatchQueue.Task(spy, ctx, args);

				expect(task.callback).toBe(spy);
				expect(task.context).toBe(ctx);
				expect(task.args).toEqual(args);
			});
		});
		describe('method: execute', function () {
			it('executes the callback function provided earlier', function () {
				var spy = jasmine.createSpy('taskCallback');
				var ctx = {};
				var args = [1, 2, 3];
				var task = new BatchQueue.Task(spy, ctx, args);

				task.execute();
				expect(spy.mostRecentCall.object).toBe(ctx);
				expect(spy.mostRecentCall.args).toEqual(args);
			});
		});
	});

	describe('method: constructor', function () {
		it('assigns size and interval onto itself and creates a new queue', function () {
			var queue = new BatchQueue();
			expect(queue.size).toBe(1000);
			expect(queue.interval).toBe(4);
			expect(queue.queue).toEqual([]);

			queue = new BatchQueue(100, 50);
			expect(queue.size).toBe(100);
			expect(queue.interval).toBe(50);
		});
	});

	describe('method: enqueue', function () {
		it('adds a task to the list and calls flush', function () {
			var queue = new BatchQueue();
			var spy = jasmine.createSpy('taskCallback');
			var ctx = {};
			var args = [1, 2, 3];

			spyOn(queue, 'flush');

			queue.enqueue(spy, ctx, args);

			expect(queue.queue.length).toBe(1);
			expect(queue.queue[0].callback).toBe(spy);
			expect(queue.queue[0].context).toBe(ctx);
			expect(queue.queue[0].args[0]).toBe(args);
			expect(queue.flush).toHaveBeenCalled();
		});
	});

	describe('method: flushBatch', function () {
		it('executes and removes the current batch of tasks in the queue', function () {
			var batchSize = 2;
			var queue = new BatchQueue(batchSize);
			var spy = jasmine.createSpy('taskCallback');

			// enqueue three tasks
			queue.enqueue(spy);
			queue.enqueue(spy);
			queue.enqueue(spy);

			expect(queue.queue.length).toBe(3);

			// flush current batch
			queue.flushBatch();

			// two executed, one remains
			expect(spy.calls.length).toBe(2);
			expect(queue.queue.length).toBe(1);

			queue.flushBatch();

			// all gone
			expect(spy.calls.length).toBe(3);
			expect(queue.queue.length).toBe(0);
		});
	});

	describe('method: flush', function () {
		it('delegates flushing of the current batch to the next interval call', inject(function ($timeout) {
			var batchSize = 2;
			var interval = 10;
			var queue = new BatchQueue(batchSize, interval);
			var spy = jasmine.createSpy('taskCallback');
			spyOn(queue, 'flushBatch').andCallThrough();

			queue.enqueue(spy);
			queue.enqueue(spy);
			queue.enqueue(spy);

			$timeout.flush();

			expect(queue.flushBatch).toHaveBeenCalled();
			expect(queue.flushBatch.calls.length).toBe(1);
			expect(queue.queue.length).toBe(1);
			expect(spy.calls.length).toBe(2);

			$timeout.flush();

			expect(queue.flushBatch.calls.length).toBe(2);
			expect(queue.queue.length).toBe(0);
			expect(spy.calls.length).toBe(3);
		}));
	});
});