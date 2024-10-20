import type { ConnectionSourceType } from "./connectionTypes.ts";
import type ILoadBalancer from "./loadBalancer.ts";

export default class RoundRobin implements ILoadBalancer {
  private serverSources: ConnectionSourceType[] = [];
  private connections: Map<string, Deno.TcpConn> = new Map<
    string,
    Deno.TcpConn
  >();
  private lastSourceIndex = -1;

  public constructor(serverSources: ConnectionSourceType[]) {
    this.serverSources = serverSources;
  }

  public pickSource() {
    this.lastSourceIndex++;
    if (this.serverSources.length === 0) {
      throw new Error("Server sources array is empty");
    }

    if (this.lastSourceIndex >= this.serverSources.length) {
      this.lastSourceIndex = 0;
    }
    return this.serverSources[this.lastSourceIndex];
  }
}
