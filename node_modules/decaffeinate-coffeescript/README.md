# decaffeinate fork of CoffeeScript

This is is a fork of the CoffeeScript implementation with some small patches
that are useful to the [decaffeinate](http://decaffeinate-project.org/) project.

It is available on npm under the name
[decaffeinate-coffeescript](https://www.npmjs.com/package/decaffeinate-coffeescript),
but the intention is that it will only be useful for decaffeinate and its
dependencies.

## Process

The main purpose of this process approach is to make it easy to make patches to
CoffeeScript while also not interfering with branch names or version numbers.
Any of these steps could probably be automated, but since this fork will likely
have very few changes, we'll just follow the process manually for now.

### Branch/release strategy

All work is done on a branch directly off of the most recent release, currently
1.10.0. Work is done on a branch called `decaffeinate-fork-1.10.0`, which is
also specified as the GitHub default branch. Ideally, the git history should be
clean, and make it clear which changes have been made on top of the official
release.

Release names are based on the CoffeeScript release, with a patch number as a
suffix. So the first patch is version `1.10.0-patch1`, then `1-10.0-patch2`,
etc. Semantic versioning isn't too important here since this package is just for
internal use within the decaffeinate project.

### Submitting a new patch

Patches are submitted as pull requests to the most recent fork branch. If the
patch is a bug fix, we also make a reasonable effort to submit a PR to the
official CoffeeScript repo on the master branch.

Once the patch is landed, we make another commit updating package.json with the
new version number publish the result to npm.

### Dealing with CoffeeScript updates

Whenever CoffeeScript releases a new version, we will switch to a new branch
based on the new release and re-apply the relevant patches using cherry-picks.
We'll skip irrelevant changes like the package.json commits. This should
hopefully keep the git history understandable and keep this repository focused
as a small set of well-understood patches.
