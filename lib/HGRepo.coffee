fs = require "fs"
os = require "os"
fspath = require "path"
{spawn} = require "child_process"

uuid = require "uuid"
_ = require "lodash"

HGCommandServer = require "./HGCommandServer"

class HGRepo
	###
	Create a new repo in a random temp directory.  Useful for no-repo commands like init and clone
	that require a repo
	###
	@MakeTempRepo: (done) ->
		tmpDir = fspath.join(os.tmpDir(), uuid.v1())

		fs.mkdir tmpDir, (err) ->
			done err if err

			initProcess = spawn "hg", ["init"], 
				cwd: tmpDir

			initProcess.on "exit", (code) ->
				unless code == 0
					err = new Error "Non zero status code returned when creating temporary repo: " + code
					return done err

				done null, new HGRepo(tmpDir)

	constructor: (@path = process.cwd()) ->

	###
	Initialize a new repository at the provided path.  Due to limitations of the cmdserver, 
	this must be run from an existing repo.
	###
	init: (initPath, done) ->
		serverCmd = (server) -> 
			server.runcommand "init", initPath

		@_runCommandGetOutput @path, serverCmd, done

	###
	Add files to a repository.
	###
	add: (paths, done) ->
		# Curry the optional paths parameter
		if _.isFunction paths
			done = paths
			paths = []

		serverCmd = (server) ->
			server.runcommand.apply server, ["add"].concat(paths)

		@_runCommandGetOutput @path, serverCmd, done

	###
	Commit changes to a repository
	###
	commit: (opts, done) ->
		opts = @_parseOptions opts

		serverCmd = (server) ->
			server.runcommand.apply server, ["commit"].concat(opts)

		@_runCommandGetOutput @path, serverCmd, done

	###
	Clone a repository.  Due to limitations of the cmdserver, this must be run from an 
	existing location.
	###
	clone: (from, to, done) ->
		serverCmd = (server) ->
			server.runcommand "clone", from, to

		@_runCommandGetOutput @path, serverCmd, done

	###
	Get a summary of the current repository path.
	###
	summary: (done) ->
		serverCmd = (server) ->
			server.runcommand "summary"

		@_runCommandGetOutput @path, serverCmd, done

	###
	Get a log of commits for this repository.

	`opts` is optional and can be either an object or array of arguments.
	###
	log: (opts, done) ->
		# Curry the arguments if no opts passed
		if _.isFunction opts
			done = opts 
			opts = []

		# Convert an object to an array of opts
		opts = @_parseOptions opts

		serverCmd = (server) ->
			server.runcommand.apply server, ["log"].concat(opts)

		@_runCommandGetOutput @path, serverCmd, done

	_parseOptions: (opts) ->
		# Convert an object to an array of opts
		if _.isObject opts
			newOpts = []
			for own key, val of opts
				newOpts.push key
				if _.isArray val
					# Push an array of values
					_.each val, (v) -> 
						newOpts.push key
						newOpts.push val
				else
					# Push a single value
					newOpts.push val

			opts = newOpts

		opts

	###
	Helper methods for running commands
	###

	_startServer: (path, done) ->
		server = new HGCommandServer()
		server.start path, (err) ->
			return done err if err

			done null, server

	_runCommandGetOutput: (path, serverAction, done) ->
		@_startServer path, (err, server) ->
			return done err if err

			cleanUp = ->
				server.removeAllListeners "output"
				server.removeAllListeners "error"

			allOutput = []

			server.on "output", (body, lines) ->
				allOutput = allOutput.concat lines

			server.on "error", (err) ->
				cleanUp()
				done err

			server.once "result", (body, lines) ->
				allOutput = allOutput.concat lines if lines.length > 0

				server.stop()

			server.once "exit", (code) ->
				cleanUp()

				done null, allOutput, server

			serverAction server

module.exports = HGRepo

				


		


