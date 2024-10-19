import Application from "./application.ts";
import Connection from "./connection.ts";
import { LoadBalancerType } from "./loadBalancer.ts";
import RoundRobin from "./roundRobin.ts";

const connections = new Set<Connection>;

function main() {
  const app = new Application(LoadBalancerType.ROUND_ROBIN);
}

main();
