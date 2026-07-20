type LogLevel = "debug" | "info" | "warn" | "error";

class Logger {
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private log(level: LogLevel, message: string, meta?: any) {
    const formattedMeta = meta ? ` | ${JSON.stringify(meta)}` : "";
    const logString = `[${this.getTimestamp()}] [${level.toUpperCase()}] ${message}${formattedMeta}`;
    
    switch (level) {
      case "debug":
        console.debug(logString);
        break;
      case "info":
        console.log(logString);
        break;
      case "warn":
        console.warn(logString);
        break;
      case "error":
        console.error(logString);
        break;
    }
  }

  debug(message: string, meta?: any) {
    this.log("debug", message, meta);
  }

  info(message: string, meta?: any) {
    this.log("info", message, meta);
  }

  warn(message: string, meta?: any) {
    this.log("warn", message, meta);
  }

  error(message: string, meta?: any) {
    this.log("error", message, meta);
  }
}

export const logger = new Logger();
