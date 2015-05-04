# q-directives for angular.js

## Introduction

Performance matters. An Angular.js developer would know that several watchers in a digest cycle can often be a bottleneck, and while there are workarounds to performance optimize an application by reducing the number of watchers, q-directives take the approach to a whole new level. By using a directive system called q **(where q = quick)** that runs separate from the native one, it exponentially reduces the number of watchers in your application.

### Compromises for Performance

In order to achieve performance, one must make compromises. q-directives exposes a brand new directive system takes an approach that make several compromises on features provided by the native directive system. That is a fair barter, because `#PerfMatters`. The major one is that `q-directives` does away with watchers. That's right:

**Adding a q-directive in your app like q-show, q-hide or q-text adds zero watchers to your Angular.js application.**

But then how do you update the view when the model changes? Using a special q-directive called q-watch. Here's a simple example:

```html
<div ng-controller="MyCtrl">
	<div q q-watch="user">
		Hello there,
		<strong q-text="user.fullName"></strong>!
		Your registered username is <strong q-text="user.username"></strong>, and email is <span q-text="user.email"></span>.
		You have liked <em q-text="user.likedPosts"></em> posts.
	</div>
</div>
```

```javascript
function MyCtrl($scope) {
	$scope.user = {
		fullName: 'John Doe',
		email: 'john@johndoe.com',
		username: 'johndoe',
		likedPosts: 30
	}
}
```

The basic idea is separation of concerns at the core. Only the `q-watch` directive listens for changes, and updates all other directives when it detects a change. Other directives do not add any watchers whatsoever.

In the above example, there are 4 `q-text` directives. However there is only one watcher reegistered (by `q-watch`). Whenever the reference to `user` changes, all the q-directives inside that DOM element get updated at the same time. You might wonder how is this approach more performant than native angular directives. Long story short, after performance testing over many samples, it comes out to be faster because of the following reasons:

* Updating several nodes in one go triggers a single paint cycle after the execution stack completes.
* If the text, class or any other property of a DOM element is updated with the same value it had previously, no reflow and paint cycles are triggered.
* Using certain DOM query functions like `getElementsByClassName` is faster than using others like `querySelectorAll`.
* Adding event listeners on nodes is discouraged, event delegation is a much faster approach.
* Bindings should be updated only when needed, without a bloat of unnecessary watchers.

## Setting Up

### Installation (via Bower)

* Just run `bower install q-directives --save`

### Direct Download

* Download [dist/q-directives.js](https://github.com/wingify/q-directives/blob/master/dist/q-directives.js) and include it in your project and you're good to go!

### Old School Git Clone

* Clone the repository on the local system and `cd` to it.
* Run `bower install` and `npm install` to install all dependencies.
* Install gulp globally by running `npm install -g gulp`.
* To build `dist/q-directives.js`, type `gulp build`.

### Running Tests

* To run tests in the console, run `gulp test` (from the root directory of the repository)
* To run tests in the browser, run `gulp build-test; testem server`.

## Documentation

A general usage documentation and reference manual can be found on http://engineering.wingify.com/q-directives/

## Contributing

See [CONTRIBUTING.md](https://github.com/wingify/q-directives/blob/master/CONTRIBUTING.md)

## License

See [LICENSE.md](https://github.com/wingify/q-directives/blob/master/LICENSE.md)
