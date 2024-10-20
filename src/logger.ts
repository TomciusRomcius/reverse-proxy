function getDate() {
  return new Date().toLocaleString();
}

export function infoLog(message: string) {
  console.log(`INFO [${getDate()}]: ${message}`);
}

export function errorLog(message: string) {
  console.log(`\x1b[31mERROR [${getDate()}]: ${message}\x1b[0m`);
}
