export type ConnectionSourceType = {
  hostname: string;
  port: number;
};

export function sourceToString(source: ConnectionSourceType) {
  return `${source.hostname}:${source.port}`;
}