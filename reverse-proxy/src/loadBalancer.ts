import type { ConnectionSourceType } from "./connectionTypes.ts";

export enum LoadBalancerType {
  ROUND_ROBIN = 0,
  WEIGHTED = 1,
}

export default interface ILoadBalancer {
  type: LoadBalancerType;
  pickSource: () => ConnectionSourceType;
}
