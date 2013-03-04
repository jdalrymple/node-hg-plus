
HGCommandServer = require "./HGCommandServer"
HGRepo = require "./HGRepo"

###
The public facing API of the node-hg module exposes convenience methods for various common Mercurial tasks.
###
class HGAPI
	constructor: ->

	init: (path, opts, done) ->

	clone: (from, to, opts, done) ->

	add: (path, opts, done) ->

	commit: (path, opts, done) ->

	summary: (path, opts, done) ->

	log: (path, opts, done) ->

api = new HGAPI()

api.HGCommandServer = HGCommandServer
api.HGRepo = HGRepo

module.exports = api