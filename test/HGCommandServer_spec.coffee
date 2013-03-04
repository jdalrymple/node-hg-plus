{EventEmitter} = require "events"

should = require "should"

HGCommandServer = require "../lib/HGCommandServer"

describe "HGCommandServer", ->

	makeFakeHgServe = (cmdServer) ->
		fakeServe = new EventEmitter()
		fakeServe.stdin = new EventEmitter()
		fakeServe.stdin.write = (buf) ->
		
		fakeServe.stdout = new EventEmitter()
		fakeServe.stderr = new EventEmitter()

		fakeServe

	makeIntroBuffer = ->
		sampleOutput = "capabilities: getencoding runcommand\nencoding: UTF-8"
		buf = new Buffer sampleOutput.length + 5

		buf.write "o", 0, "ascii"
		buf.writeUInt32BE sampleOutput.length, 1

		buf.write sampleOutput, 5, "ascii"

		buf

	it "can parse capabilities and encoding", ->
		toParse = "o4capabilities: getencoding runcommand\nencoding: UTF-8"

		serv = new HGCommandServer()
		parsed = serv._parseCapabilitiesAndEncoding toParse

		parsed.capabilities.should.eql ["getencoding", "runcommand"]
		parsed.encoding.should.equal "UTF-8"

	it "can start a command server", (done) ->
		serv = new HGCommandServer()
		fakeServe = null
		serv._makeHgProcess = ->
			fakeServe = makeFakeHgServe()
			return fakeServe

		serv.start process.cwd(), (err) ->
			throw err if err

			serv.starting.should.equal false, "not starting after data"

			serv.capabilities.should.eql ["getencoding", "runcommand"]
			serv.encoding.should.equal "UTF-8"

			done()

		serv.starting.should.equal true, "starting"

		fakeServe.stdout.emit "data", makeIntroBuffer()

	it "can emit output messages", (done) ->
		serv = new HGCommandServer()
		fakeServe = null
		serv._makeHgProcess = ->
			fakeServe = makeFakeHgServe()
			return fakeServe

		serv.start process.cwd(), (err) ->
			throw err if err

			serv.on "output", (body, lines) ->

				lines.length.should.equal 1
				done()

			fakeServe.stdout.emit "data", makeIntroBuffer()

		fakeServe.stdout.emit "data", makeIntroBuffer()

	it "can issue commands", (done) ->
		serv = new HGCommandServer()
		fakeServe = null
		serv._makeHgProcess = ->
			fakeServe = makeFakeHgServe()
			return fakeServe

		serv.start process.cwd(), (err) ->
			throw err if err

			fakeServe.stdin.write = (buf) ->
				buf.slice(0, 11).toString().should.equal "runcommand\n"
				bodyLength = buf.readUInt32BE 11

				bodyLength.should.equal 7

				buf.slice(15).toString().should.equal "summary"

				done()

			serv.issueCommand "runcommand", "summary"

		fakeServe.stdout.emit "data", makeIntroBuffer()

	it "works with this repository", (done) ->
		# Warning, this will only work if the project is in a mercurial repo right now.

		serv = new HGCommandServer()

		serv.start process.cwd(), (err) ->
			throw err if err

			serv.on "output", (body, lines) ->
				should.exist body
				should.exist lines

			serv.on "result", (data) ->
				serv.stop()

			serv.on "exit", (code) ->
				done()

			serv.issueCommand "runcommand", "summary"
