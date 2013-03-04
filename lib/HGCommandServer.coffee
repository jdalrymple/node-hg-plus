
{EventEmitter} = require "events"
{spawn} = require "child_process"

_ = require "lodash"

Logger = require "./common/logger"
OutputLine = require "./common/OutputLine"

defaults = 
	hgOpts: ['--config', 'ui.interactive=True', 'serve', '--cmdserver', 'pipe']

###
An HGCommandServer spawns the hg command server and handles communication between it and node.

Piped output is then 'emitted' via the `EventEmitter` subclass as `output`, `result` or `error` events.
###
class HGCommandServer extends EventEmitter

	constructor: (config = {}) ->

		@config = _.defaults config, defaults
		@server = @starting = false

	###
	Start the command server at a specified directory (path must already be an hg repository)
	###
	start: (path, done) ->
		@_spawnCommandServer path, done

	###
	Stop the current command server process from running
	###
	stop: ->
		return unless @server

		# Clean up our event listeners
		@server.stdout.removeAllListeners "data"
		@server.stderr.removeAllListeners "data"
		
		# The exit handler removes itself and sets @server = undefined.

		# Signal no more input, which should close the process and signal exit
		@server.stdin.end()

	###
	Commands with arguments (like runcommand 8 log -l 5)
	More info at [runcommand](http://mercurial.selenic.com/wiki/CommandServer#runcommand)
	###
	issueCommand: (cmd, args...) ->
		@_serverSend cmd, args

	###
	Spawn the hg cmdserver as a child process
	###
	_spawnCommandServer: (path, done) ->
		_.bindAll this, "_handleServerExit", "_handleServerData"

		@starting = true
		@server = @_makeHgProcess path

		# Handle the startup information, then pass off to _handleServerData
		@server.stdout.once "data", (data) =>
			@starting = false

			# Parse the Channel information, emit an event on the channel with the data.
			line = OutputLine.FromBuffer data, 0, undefined
			{@capabilities, @encoding} = @_parseCapabilitiesAndEncoding line.body

			# Extend the server with shorthand function, ie server.runcommand "summary"
			for capability in @capabilities
				@[capability] = (args...) =>
					@issueCommand.apply this, [capability].concat(args)
			
			# Subscribe the Subsequent data events to our handler
			@server.stdout.on "data", @_handleServerData

			done null, @capabilities, @encoding

		# Error and exit handlers
		@server.stderr.on "data", (data) =>
			return done(new Error(data)) if @starting

			@_handleServerError data

		@server.on "exit", @_handleServerExit

	###
	Create the child process (exposed for unit testing mostly)
	###
	_makeHgProcess: (path) ->
		spawn 'hg', @config.hgOpts, 
			cwd: path or process.cwd()

	###
	Parse the capabilities and encoding when the cmd server starts up
	###
	_parseCapabilitiesAndEncoding: (data) ->
		capRegEx = new RegExp("capabilities: (.*?)\nencoding: (.*?)$", "g")

		[str, capabilities, encoding] = capRegEx.exec data

		unless str && capabilities && encoding
			throw new Error "Expected capabilities and encoding: " + data

		capabilities = capabilities.split " "

		{capabilities, encoding}

	###
	Parse the Channel information, emit an event on the channel with the data.
	###
	_handleServerData: (data) ->
		lines = []
		body = ""
		chan = String.fromCharCode data.readUInt8(0)

		currBuffPos = 0
		while currBuffPos < data.length
			line = OutputLine.FromBuffer data, currBuffPos, @encoding
			lines.push line

			body += line.body + "\n"

			# Increment the buffer position the length of the line + 5 for the channel and bodyLength
			currBuffPos += line.length + 5

		chanName = switch chan
			when "o" then "output"
			when "r" then "result"
			when "e" then "error"
			when "d" then "debug"

		if chanName == "error"
			@emit chanName, new Error(body)
		else
			@emit chanName, body, lines

	_handleServerError: (data) ->
		# Emit an error event with the data.
		@emit "error", data

	_handleServerExit: (code) ->
		# Emit an exit event with the code.
		@emit "exit", code

		# Clean up our listeners
		@server.removeAllListeners "exit"
		@server = undefined

	###
	Send the raw command strings to the cmdserver over `stdin`
	###
	_serverSend: (cmd, args = []) ->
		throw new Error "Must start the command server before issuing commands" unless @server

		# The space needed by the command (runcommand\n == 11)
		cmdLength = cmd.length + 1

		# The space needed for the command arguments
		argParts = args.join "\0"
		argLength = argParts.length

		# The space for declaring the command argument size; always written as 4 bytes
		argLengthSize = 4

		# Total up all the sizes to get the buffer length needed
		totalBufferSize = cmdLength + argLengthSize + argLength

		# New up our buffer for writing to
		toWrite = new Buffer totalBufferSize

		# Write the command to the buffer
		toWrite.write "#{cmd}\n", @encoding
		# Write the length of the arguments to the buffer (is 4 bytes always)
		toWrite.writeUInt32BE argLength, cmdLength
		# Write the arguments to the buffer after 4 bytes for the argLength
		toWrite.write argParts, cmdLength + argLengthSize, @encoding

		# Write out the buffer to the input of the command server
		@server.stdin.write toWrite

module.exports = HGCommandServer