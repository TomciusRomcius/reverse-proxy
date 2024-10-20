import type { ConnectionSourceType } from "./connectionTypes.ts";
import { LoadBalancerType } from "./loadBalancer.ts";
import { infoLog } from "./logger.ts";
import RoundRobin from "./roundRobin.ts";
import Weighted from "./weighted.ts";

export function loadBalancerBuilder(
  type: LoadBalancerType,
  serverSources: ConnectionSourceType[]
) {
  let loadBalancer;

  switch (type) {
    case LoadBalancerType.ROUND_ROBIN:
      loadBalancer = new RoundRobin(serverSources);
      infoLog("Selected load balancer: Round Robin")
      break;
    case LoadBalancerType.WEIGHTED:
      infoLog("Selected load balancer: Weighted")
      loadBalancer = new Weighted(serverSources);
      break;
    default:
      throw new Error("Invalid load balancer provided");
  }

  return loadBalancer;
}
