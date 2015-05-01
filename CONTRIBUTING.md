# Setup

1. [Fork **q-directives**](https://help.github.com/articles/fork-a-repo) and clone it on your system.
2. Create a new branch off `master` for your fix/feature. `git checkout new-feature master`

# Building

**q-directives** uses [Gulp](http://gulpjs.com/) for the build process which you need to have installed on your system.

To install all the dependencies, run `npm install` and `bower install`.

Once you have the dependencies installed, run `gulp` from the project directory.


#Things to remember

- Do not fix multiple issues in a single commit. Keep them one thing per commit so that they can be picked easily incase only few commits require to be merged.
- Before submitting a patch, rebase your branch on upstream `develop` to make life easier for the merger.
- **DO NOT** add the library builds (`dist/q-directives.js`) in your commits. That will be added post merge in a different commit.
