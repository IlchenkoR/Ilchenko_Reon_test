/**
 *  Модуль с настройками loggera 
 */
import * as log4js from 'log4js';

log4js.configure({
	appenders: {
		out: {
			type: "stdout",
			layout: {
				type: "pattern",
				pattern: "%d %p %f:%l %m%n",
			},
		},
		everything: {
			type: "file",
			filename: "./logs/logs.log",
			maxLogSize: 1024000,
			layout: {
				type: "pattern",
				pattern: "%d %p %f:%l %m%n",
			},
		},
	},
	categories: {
		default: { appenders: ["everything", "out"], level: "debug", enableCallStack: true },
	},
});

const logger = log4js.getLogger();

export default logger;
