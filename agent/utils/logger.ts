import winston from "winston";
import path from "path";

// Define structured format for console and file output
const logFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  if (Object.keys(metadata).length > 0 && !metadata.label) {
    msg += ` | ${JSON.stringify(metadata)}`;
  }
  return msg;
});

const loggerInstance = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.metadata({ fillExcept: ["message", "level", "timestamp", "label"] }),
    logFormat
  ),
  transports: [
    // Console output
    new winston.transports.Console(),
    // Combined log file target
    new winston.transports.File({ 
      filename: path.join("logs", "combined.log"),
      level: "info"
    }),
    // Error-only log file target
    new winston.transports.File({ 
      filename: path.join("logs", "error.log"),
      level: "error"
    })
  ]
});

class WinstonLogger {
  debug(message: string, meta?: any) {
    loggerInstance.debug(message, meta);
  }

  info(message: string, meta?: any) {
    loggerInstance.info(message, meta);
  }

  warn(message: string, meta?: any) {
    loggerInstance.warn(message, meta);
  }

  error(message: string, meta?: any) {
    loggerInstance.error(message, meta);
  }
}

export const logger = new WinstonLogger();
