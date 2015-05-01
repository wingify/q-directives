'use strict';

var _module = angular.module('q-directives', [], [
	'$controllerProvider', '$provide', '$compileProvider', '$filterProvider',
	function ($controllerProvider, $provide, $compileProvider, $filterProvider) {
		_module.controller = angular.bind(this, $controllerProvider.register);
		_module.factory = angular.bind(this, $provide.factory);
		_module.service = angular.bind(this, $provide.service);
		_module.constant = angular.bind(this, $provide.constant);
		_module.value = angular.bind(this, $provide.value);
		_module.directive = angular.bind(this, $compileProvider.directive);
		_module.filter = angular.bind(this, $filterProvider.register);
	}
]);

_module.qDirective = function qDirective(name, directive) {
	_module.uninitializedQDirectives = _module.uninitializedQDirectives || [];
	_module.uninitializedQDirectives.push({name: name, directive: directive});

	return this;
};