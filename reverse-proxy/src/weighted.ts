import type { ServerSourceType } from "./connectionTypes.ts";
import type { ConnectionSourceType } from "./connectionTypes.ts";
import { LoadBalancerType } from "./loadBalancer.ts";
import type ILoadBalancer from "./loadBalancer.ts";
import { infoLog } from "./logger.ts";

export default class Weighted implements ILoadBalancer {
  public type = LoadBalancerType.WEIGHTED;
  private serverSources: ServerSourceType[] = [];

  public constructor(serverSources: ConnectionSourceType[]) {
    serverSources.forEach((source) => {
      this.serverSources.push({
        serverSource: source,
        connections: 0,
      });
    });
  }

  public removeConnection(serverSource: ConnectionSourceType) {
    this.serverSources.forEach((source) => {
      if (
        source.serverSource.hostname === serverSource.hostname &&
        source.serverSource.port === serverSource.port
      ) {
        infoLog("Removed a connection");
        source.connections--;
      }
    });
  }

  public pickSource() {
    let minReference = this.serverSources[0];
    this.serverSources.forEach((source) => {
      if (source.connections < minReference.connections) {
        minReference = source;
      }
    });

    minReference.connections++;
    return minReference.serverSource;
  }
}
