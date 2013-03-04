winston = require "winston"

class Logger
	constructor: (logger) ->
		@logger = logger || 
			log: winston.log
			info: winston.info
