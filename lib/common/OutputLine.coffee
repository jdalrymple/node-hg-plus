
class OutputLine
	@FromBuffer: (data, start, encoding) ->
		# Get the channel from the first character
		chan = String.fromCharCode data.readUInt8(start)
		# Get the body length from the next 4 bytes
		bodyLength = data.readUInt32BE(start + 1)

		# Trim the buffer of the first 5 bytes (channel and bodyLength)
		bodyBegin = start + 5
		bodyData = data.slice bodyBegin, (bodyBegin + bodyLength)

		body = bodyData.toString(@encoding).replace(/\0/g, "")

		new OutputLine chan, bodyLength, body

	constructor: (@channel, @length, @body) ->

module.exports = OutputLine