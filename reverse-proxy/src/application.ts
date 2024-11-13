import Connection from "./connection.ts";
import {
  sourceToString,
  type ConnectionSourceType,
} from "./connectionTypes.ts";
import { fileLogger } from "./fileLogger.ts";
import { LoadBalancerType } from "./loadBalancer.ts";
import type ILoadBalancer from "./loadBalancer.ts";
import { loadBalancerBuilder } from "./loadBalancerBuilder.ts";
import { debugLog, errorLog, infoLog } from "./logger.ts";
import type Weighted from "./weighted.ts";

async function getServerSources() {
  const content = await Deno.readTextFile("./server-ips.txt");

  const serverSources = content.split("\n")
  .filter((line) => line.length > 0)
  .map((source) => {
    
    const items = source.split(":");
    const hostname = items[0];
    const port = parseInt(items[1]) || 80;

    if (hostname.length === 0) {
      throw new Error("Failed to get server hostname");
    }

    if (isNaN(port)) {
      throw new Error("Failed to get server port");
    }

    const sourceObj = {
      hostname: items[0],
      port: Number(items[1] || 80),
    } as ConnectionSourceType;
    infoLog(`Loaded source: ${sourceToString(sourceObj)}`);
    return sourceObj;
  });
  
  return serverSources;
}

export default class Application {
  private serverSources: ConnectionSourceType[] = [];
  private loadBalancer: ILoadBalancer | null = null;

  public constructor(loadBalancerType: LoadBalancerType) {
    this.initialize(loadBalancerType);
  }

  private async initialize(loadBalancerType: LoadBalancerType) {
    await fileLogger.openFile();
    try {
      this.serverSources = await getServerSources();
    }

    catch(err) {
      if (err instanceof Error) {
        errorLog(err.message)
      }

      return;
    }
    const listener = Deno.listen({ port: 8000, transport: "tcp" });
    this.loadBalancer = loadBalancerBuilder(
      loadBalancerType,
      this.serverSources
    );
    infoLog("Listening for client connections..");
    while (1) {
      const con = await listener.accept();
      debugLog("New client connection..");
      const source = this.loadBalancer.pickSource();
      Connection.create(con, source, () => this.onConnectionClose(source));
    }
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
