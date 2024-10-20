import Application from "./application.ts";

function main() {
  const app = new Application(LoadBalancerType.ROUND_ROBIN);
}

main();
