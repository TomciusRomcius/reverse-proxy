import Connection from "./connection.ts";
import {
  sourceToString,
  type ConnectionSourceType,
} from "./connectionTypes.ts";
import { LoadBalancerType } from "./loadBalancer.ts";
import type ILoadBalancer from "./loadBalancer.ts";
import { loadBalancerBuilder } from "./loadBalancerBuilder.ts";
import { infoLog } from "./logger.ts";
import RoundRobin from "./roundRobin.ts";
import type Weighted from "./weighted.ts";

export default class Application {
  private serverSources: ConnectionSourceType[] = [];
  private loadBalancer: ILoadBalancer | null = null;

  public constructor(loadBalancerType: LoadBalancerType) {
    this.initialize(loadBalancerType);
  }

  private async initialize(loadBalancerType: LoadBalancerType) {
    await this.getServerIps();
    const listener = Deno.listen({ port: 8000, transport: "tcp" });
    this.loadBalancer = loadBalancerBuilder(loadBalancerType, this.serverSources);

    infoLog("Listening for client connections..");
    while (1) {
      const con = await listener.accept();
      infoLog("New client connections..");
      const source = this.loadBalancer.pickSource();
      new Connection(con, source, () => this.onConnectionClose(source));
    }
  }

  private async getServerIps() {
    const file = await Deno.open("./server-ips.txt");
    const buffer = new Uint8Array(1024);
    const bufferSize = (await file.read(buffer)) || 0;
    const content = new TextDecoder().decode(buffer.subarray(0, bufferSize));

    this.serverSources = content.split("\n").map((source) => {
      const items = source.split(":");
      const sourceObj = {
        hostname: items[0],
        port: Number(items[1] || 80),
      } as ConnectionSourceType;
      infoLog(`Loaded source: ${sourceToString(sourceObj)}`);
      return sourceObj;
    });
    file.close();
  }

  private onConnectionClose(serverSource: ConnectionSourceType) {
    if (!this.loadBalancer) {
      throw new Error("Loadbalancer not defined");
    }
    if (this.loadBalancer.type === LoadBalancerType.WEIGHTED) {
      (this.loadBalancer as Weighted).removeConnection(serverSource);
    }
  }
}
