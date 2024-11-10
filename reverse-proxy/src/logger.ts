import { fileLogger } from "./fileLogger.ts";

function getDate() {
  return new Date().toLocaleString();
}

export function debugLog(message: string) {
  console.log(`DEBUG [${getDate()}]: ${message}`);
  const logMessage = `DEBUG [${getDate()}]: ${message}`;
  fileLogger.writeLogs(logMessage);
}

export function infoLog(message: string) {
  console.log(`INFO [${getDate()}]: ${message}`);
  const logMessage = `INFO [${getDate()}]: ${message}`;
  fileLogger.writeLogs(logMessage);
}

export function errorLog(message: string) {
  console.log(`\x1b[31mERROR [${getDate()}]: ${message}\x1b[0m`);
  const logMessage = `ERROR [${getDate()}]: ${message}`;
  fileLogger.writeLogs(logMessage);
}
