should = require "should"

HGAPI = require "../lib"

describe "HGAPI", ->

	it "exposes core classes", ->

		should.exist HGAPI.HGCommandServer, "command server"
		should.exist HGAPI.HGRepo, "repo"
