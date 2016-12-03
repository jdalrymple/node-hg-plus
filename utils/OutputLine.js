
class OutputLine {
	static FromBuffer(data, start, encoding) {
		// Get the channel from the first character
		let chan = String.fromCharCode(data.readUInt8(start));
		// Get the body length from the next 4 bytes
		let bodyLength = data.readUInt32BE(start + 1);

		// Trim the buffer of the first 5 bytes (channel and bodyLength)
		let bodyBegin = start + 5;
		let bodyData = data.slice(bodyBegin, (bodyBegin + bodyLength));

		if (chan === 'r') {
			var body = bodyData.readInt32BE(0);
		} else {
			var body = bodyData.toString(this.encoding).replace(/\0/g, "");
		}

		return new OutputLine(chan, bodyLength, body);
	}

	constructor(channel, length, body) {
		this.channel = channel;
		this.length = length;
		this.body = body;
	}
}

export default OutputLine;
