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