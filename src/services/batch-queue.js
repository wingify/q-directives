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
