import Application from "./application.ts";
import { LoadBalancerType } from "./loadBalancer.ts";

function main() {
  const app = new Application(LoadBalancerType.ROUND_ROBIN);
}

main();
