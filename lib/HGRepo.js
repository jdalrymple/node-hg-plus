import fs from "fs";
import os from "os";
import fspath from "path";
import { spawn } from "child_process";

import uuid from "uuid";
import _ from "lodash";

import HGCommandServer from "./HGCommandServer";

class HGRepo {
	/*
	Create a new repo in a random temp directory.  Useful for no-repo commands like init and clone
	that require a repo
	*/
	static MakeTempRepo(done) {
		let tmpDir = fspath.join(os.tmpDir(), uuid.v1());

		return fs.mkdir(tmpDir, function(err) {
			if (err) { done(err); }

			let initProcess = spawn("hg", ["init"],
				{cwd: tmpDir});

			return initProcess.on("exit", function(code) {
				if (code !== 0) {
					err = new Error(`Non zero status code returned when creating temporary repo: ${code}`);
					return done(err);
				}

				return done(null, new HGRepo(tmpDir));
			});
		});
	}

	/*
	Create a new HGRepo with a rootpath defined by the passed in `@path` (defaults to `process.cwd()`)
	*/
	constructor(path = process.cwd()) {
		this.path = path;
	}

	/*
	Initialize a new repository at the provided path.  Due to limitations of the cmdserver,
	this must be run from an existing repo.
	*/
	init(initPath, done) {
		let serverCmd = server => server.runcommand("init", initPath);

		return this._runCommandGetOutput(this.path, serverCmd, done);
	}

	/*
	Add files to a repository.
	*/
	add(paths, done) {
		return this.runCommand("add", paths, done);
	}

	/*
	Commit changes to a repository
	*/
	commit(paths, opts, done) {
		if (_.isFunction(paths)) {
			done = paths;
			paths = [];
		} else if (_.isFunction(opts)) {
			done = opts;
			if (_.isObject(paths)) {
				opts = paths;
				paths = [];
			}
		}
		return this.runCommand(["commit"].concat(paths), opts, done);
	}

	/*
	Clone a repository.  Due to limitations of the cmdserver, this must be run from an
	existing location.
	*/
	clone(from, to, opts, done) {
		return this.runCommand(["clone", from, to], opts, done);
	}

	/*
	Get a summary of the current repository path.
	*/
	summary(opts, done) {
		return this.runCommand("summary", opts, done);
	}

	/*
	Get a log of commits for this repository.

	`opts` is optional and can be either an object or array of arguments.
	*/
	log(opts, done) {
		return this.runCommand("log", opts, done);
	}

	/*
	Pull changes from another repository.
	*/
	pull(from, opts, done) {
		return this.runCommand(["pull", from], opts, done);
	}

	/*
	Update to the latest changes in a repository.
	*/
	update(opts, done) {
		return this.runCommand("update", opts, done);
	}

	/*
	Push changes to another repository
	*/
	push(to, opts, done) {
		return this.runCommand(["push", to], opts, done);
	}

	/*
	Merge changes from another repository
	*/
	merge(opts, done) {
		return this.runCommand("merge", opts, done);
	}

	/*
	Resolve conflicts in a repository.
	*/
	resolve(opts, done) {
		return this.runCommand("resolve", opts, done);
	}

	/*
	Create tags in repo.
	*/
	tag(tagname, opts, done) {
		return this.runCommand(["tag", tagname], opts, done);
	}

	/*
	Retrieve repo tags.
	*/
	tags(opts, done) {
		return this.runCommand("tags", opts, done);
	}

	/*
	Repo status.
	*/
	status(opts, done) {
		return this.runCommand("status", opts, done);
	}

	/*
	Repo branches.
	*/
	branches(opts, done) {
		return this.runCommand("branches", opts, done);
	}

	/*
	Repo heads list
	*/
	heads(opts, done) {
		return this.runCommand("heads", opts, done);
	}

	/*
	Diff
	*/
	diff(opts, done) {
		return this.runCommand("diff", opts, done);
	}

	/*
	Version of hg process
	*/
	version(done) {
		return this.runCommand("version", done);
	}

	/*
	Remove files from a repository.
	*/
	remove(paths, done) {
		return this.runCommand("remove", paths, done);
	}

	/*
	Execute server command

	@param arg [String, Array] command to execute.
	@param opts [Object, Array, String, Function] optional arguments to append
	       to command args. If opts is a function it is treated as the callback function.
	@param done [Function] callback when command completes
	*/
	runCommand(args, opts, done) {
		if (_.isFunction(opts)) {
			done = opts;
			opts = [];
		}

		if (_.isString(args)) {
			args = [args];
		}

		args = args.concat(this._parseOptions(opts));

		let serverCmd = server => server.runcommand.apply(server, args);

		return this._runCommandGetOutput(this.path, serverCmd, done);
	}

	/*
	Parse an object into an array of command line arguments
	*/
	_parseOptions(opts) {
		// Convert an object to an array of opts
		if (_.isArray(opts)) {
			return opts;
		}
		if (_.isString(opts)) {
			return [opts];
		}

		let newOpts = [];
		let currKey = "";
		let pushVal = function(v) {
			newOpts.push(currKey);
			if (v) { return newOpts.push(v); }
		};

		for (let key of Object.keys(opts)) {
			let val = opts[key];
			currKey = key;
			if (_.isArray(val)) {
				// Push an array of values
				_.each(val, pushVal);
			} else {
				// Push a single value
				pushVal(val);
			}
		}

		return newOpts;
	}

	/*
	Start a command server and return it for use
	*/
	_startServer(path, done) {
		let server = new HGCommandServer();
		return server.start(path, function(err) {
			if (err) { return done(err); }

			return done(null, server);
		});
	}

	/*
	Convenience wrapper for starting a command server and executing a command
	*/
	_runCommandGetOutput(path, serverAction, done) {
		return this._startServer(path, function(err, server) {
			if (err) { return done(err); }

			let cleanUp = function() {
				server.removeAllListeners("output");
				return server.removeAllListeners("error");
			};

			let allOutput = [];

			server.on("output", (body, lines) => allOutput = allOutput.concat(lines));

			server.on("error", function(err, line) {
				// Skip warnings, store as output
				// TODO: Allow this to be configured
				if (__guard__(__guard__(line, x1 => x1.body), x => x.slice(0, 7)) === "warning") {
					return allOutput.push(line);
				}

				cleanUp();
				return done(err);
			});

			server.once("result", function(body, lines) {
				if (lines.length > 0) { allOutput = allOutput.concat(lines); }

				return server.stop();
			});

			server.once("exit", function(code) {
				cleanUp();

				return done(null, allOutput, server);
			});

			return serverAction(server);
		});
	}
}

export default HGRepo;

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}