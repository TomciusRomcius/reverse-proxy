import type { ConnectionSourceType } from "./serverSource.ts";

export enum LoadBalancerType {
  ROUND_ROBIN = 0,
}

export default interface ILoadBalancer {
  pickSource: () => ConnectionSourceType;
}
