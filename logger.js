import winston from "winston";
import { format } from "winston";

const { timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} | ${level}: ${message}`;
});

const logger = winston.createLogger({
    level: "silly",
    // transports: [
    //     new winston.transports.File({
    //         filename: "./logs/combined.log",
    //         level: "info",
    //         format: format.combine(timestamp(), myFormat),
    //     }),
    //     new winston.transports.File({
    //         filename: "./logs/errors.log",
    //         level: "error",
    //         format: format.combine(timestamp(), myFormat),
    //     }),
    // ],
});

if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            level: "silly",
            format: winston.format.combine(
                winston.format.simple(),
                winston.format.colorize({ all: true })
            ),
        })
    );
}

if (process.env.NODE_ENV === "production") {
    logger.add(
        new winston.transports.Console({
            level: "info",
            format: winston.format.combine(
                winston.format.simple(),
                winston.format.colorize({ all: true })
            ),
        })
    );
}

export default logger;
