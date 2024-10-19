import type ILoadBalancer from "./loadBalancer.ts";
import { errorLog, infoLog } from "./logger.tsx";
import { sourceToString, type ServerSourceType } from "./serverSource.ts";

export default class RoundRobin implements ILoadBalancer {
  private serverSources: ServerSourceType[] = [];
  private connections: Map<string, Deno.TcpConn> = new Map<
    string,
    Deno.TcpConn
  >();
  private lastSourceIndex = -1;

  public constructor(serverSources: ServerSourceType[]) {
    this.serverSources = serverSources;
    this.serverSources.forEach((source) => {
      this.establishConnection(source);
    });
  }

  private async establishConnection(source: ServerSourceType) {
    const connection = await Deno.connect({
      hostname: source.hostname,
      port: source.port,
      transport: "tcp",
    });
    this.connections.set(sourceToString(source), connection);
  }

  public forwardRequest(buffer: Uint8Array) {
    const nextSource = this.getNextSource();
    const connection = this.connections.get(sourceToString(nextSource));
    if (!connection) {
      errorLog("The connection is not open!");
      return;
    }

    connection.write(buffer).then(() => {
      infoLog(`Succesfully forwarded request to ${sourceToString(nextSource)}`);
    });
  }

  private getNextSource() {
    this.lastSourceIndex++;
    if (this.serverSources.length === 0) {
      throw new Error("Server sources array is empty");
    }

    if (this.lastSourceIndex > this.serverSources.length) {
      this.lastSourceIndex = 0;
    }
    return this.serverSources[this.lastSourceIndex];
  }
}
