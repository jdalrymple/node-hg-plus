import winston from "winston";

class Logger {
	constructor(logger) {
		this.logger = logger ||{ 
			log: winston.log,
			info: winston.info
		};
	}
}
