export function sourceToString(source: ConnectionSourceType) {
  return `${source.hostname}:${source.port}`;
}

export type ServerSourceType = {
  serverSource: ConnectionSourceType;
  connections: number;
}

export type ConnectionSourceType = {
  hostname: string;
  port: number;
};