export type ServerSourceType = {
  hostname: string;
  port: number;
};

export function sourceToString(source: ServerSourceType) {
  return `${source.hostname}:${source.port}`;
}