import { EventEmitter } from "events";
import { spawn } from "child_process";
import _ from "lodash";

import OutputLine from "./common/OutputLine";

let defaults =
	{hgOpts: ['--config', 'ui.interactive=True', '--config', 'ui.merge=internal:fail', 'serve', '--cmdserver', 'pipe']};

/*
An HGCommandServer spawns the hg command server and handles communication between it and node.

Piped output is then 'emitted' via the `EventEmitter` subclass as `output`, `result` or `error` events.
*/
class HGCommandServer extends EventEmitter {

	constructor(config = {}) {

		this.config = _.defaults(config, defaults);
		this.server = this.starting = false;
	}

	/*
	Start the command server at a specified directory (path must already be an hg repository)
	*/
	start(path, done) {
		return this._spawnCommandServer(path, done);
	}

	/*
	Stop the current command server process from running
	*/
	stop() {
		if (!this.server) { return; }

		// Clean up our event listeners
		this.server.stdout.removeAllListeners("data");
		this.server.stderr.removeAllListeners("data");

		// The exit handler removes itself and sets @server = undefined.

		// Signal no more input, which should close the process and signal exit
		return this.server.stdin.end();
	}

	/*
	Commands with arguments (like runcommand 8 log -l 5)
	More info at [runcommand](http://mercurial.selenic.com/wiki/CommandServer#runcommand)
	*/
	issueCommand(cmd, ...args) {
		return this._serverSend(cmd, args);
	}

	/*
	Spawn the hg cmdserver as a child process
	*/
	_spawnCommandServer(path, done) {
		_.bindAll(this, "_handleServerExit", "_handleServerData");

		this.starting = true;
		this.server = this._makeHgProcess(path);

		// Handle the startup information, then pass off to _handleServerData
		this.server.stdout.once("data", data => {
			this.starting = false;

			// Parse the Channel information, emit an event on the channel with the data.
			let line = OutputLine.FromBuffer(data, 0, undefined);
			({capabilities: this.capabilities, encoding: this.encoding} = this._parseCapabilitiesAndEncoding(line.body));

			// Extend the server with shorthand function, ie server.runcommand "summary"
			for (let capability of this.capabilities) {
				this[capability] = (...args) => {
					return this.issueCommand.apply(this, [capability].concat(args));
				};
			}

			// Subscribe the Subsequent data events to our handler
			this.server.stdout.on("data", this._handleServerData);

			return done(null, this.capabilities, this.encoding);
		}
		);

		// Error and exit handlers
		this.server.stderr.on("data", data => {
			if (this.starting) { return done(new Error(data)); }

			return this._handleServerError(data);
		}
		);

		return this.server.on("exit", this._handleServerExit);
	}

	/*
	Create the child process (exposed for unit testing mostly)
	*/
	_makeHgProcess(path) {
		// Try to coerce the UTF-8 encoding setting
		// TODO: Make this configurable?
		let processEnv = _.extend({ "HGENCODING": "UTF-8" }, process.env);

		let spawnOpts = {
			env: processEnv,
			cwd: path || process.cwd()
		};

		return spawn('hg', this.config.hgOpts, spawnOpts);
	}


	/*
	Parse the capabilities and encoding when the cmd server starts up
	*/
	_parseCapabilitiesAndEncoding(data) {
		let capRegEx = new RegExp("capabilities: (.*?)\nencoding: (.*?)$", "g");

		let matches = capRegEx.exec(data);

		if (!matches) {
			// Version 3.2 switched up the format
			capRegEx = new RegExp("capabilities: (.*?)\nencoding: (.*?)\n(.*?)$", "g");
			matches = capRegEx.exec(data);
		}

		if (__guard__(matches, x => x.length) <= 2) {
			throw new Error(`Unable to parse capabilities: ${data}`);
		}

		let [str, capabilities, encoding] = matches;

		if (!str || !capabilities || !encoding) {
			throw new Error(`Expected capabilities and encoding: ${data}`);
		}

		capabilities = capabilities.split(" ");

		return {capabilities, encoding};
	}

	/*
	Parse the Channel information, emit an event on the channel with the data.
	*/
	_handleServerData(data) {
		let lines = [];
		let body = "";
		let getChanName = function(chan) {
			let chanName = (() => { switch (chan) {
				case "o": return "output";
				case "r": return "result";
				case "e": return "error";
				case "d": return "debug";
			} })();

			return chanName;
		};

		let chan = String.fromCharCode(data.readUInt8(0));

		let currBuffPos = 0;
		while (currBuffPos < data.length) {
			var line = OutputLine.FromBuffer(data, currBuffPos, this.encoding);
			lines.push(line);

			body += line.body + "\n";

			// Increment the buffer position the length of the line + 5 for the channel and bodyLength
			currBuffPos += line.length + 5;
		}

		// Aggregate the channel lines so we can emit the right events per line
		let chanGroups = [];
		let currChan = lines[0].channel;
		let currGroup = [];
		for (var line of lines) {
			if (line.channel === currChan) {
				currGroup.push(line);
				continue;
			}

			chanGroups.push(currGroup);

			currGroup = [line];
			currChan = line.channel;
		}

		if (currGroup.length > 0) {
			chanGroups.push(currGroup);
		}

		for (let group of chanGroups) {
			let chanName = getChanName(group[0].channel);

			body = (group.map((line) => line.body)).join("\n");

			if (chanName === "error") {
				return this.emit(chanName, new Error(body), group[0], group);
			}

			this.emit(chanName, body, group);
		}
	}

	_handleServerError(data) {
		// Emit an error event with the data.
		return this.emit("error", data);
	}

	_handleServerExit(code) {
		// Emit an exit event with the code.
		this.emit("exit", code);

		// Clean up our listeners
		this.server.removeAllListeners("exit");
		return this.server = undefined;
	}

	/*
	Send the raw command strings to the cmdserver over `stdin`
	*/
	_serverSend(cmd, args = []) {
		if (!this.server) { throw new Error("Must start the command server before issuing commands"); }

		// The space needed by the command (runcommand\n == 11)
		let cmdLength = cmd.length + 1;

		// The space needed for the command arguments
		let argParts = args.join("\0");
		let argLength = argParts.length;

		// The space for declaring the command argument size; always written as 4 bytes
		let argLengthSize = 4;

		// Total up all the sizes to get the buffer length needed
		let totalBufferSize = cmdLength + argLengthSize + argLength;

		// New up our buffer for writing to
		let toWrite = new Buffer(totalBufferSize);

		// Write the command to the buffer
		toWrite.write(`${cmd}\n`, this.encoding);
		// Write the length of the arguments to the buffer (is 4 bytes always)
		toWrite.writeUInt32BE(argLength, cmdLength);
		// Write the arguments to the buffer after 4 bytes for the argLength
		toWrite.write(argParts, cmdLength + argLengthSize, this.encoding);

		// Write out the buffer to the input of the command server
		return this.server.stdin.write(toWrite);
	}
}

export default HGCommandServer;

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}