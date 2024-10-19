import type ILoadBalancer from "./loadBalancer.ts";
import type { ServerSourceType } from "./serverSource.ts";

const MAX_BUFFER_SIZE = 1024;

export default class Connection {
  connection: Deno.TcpConn;
  serverSources: ServerSourceType[] = [];
  loadBalancer: ILoadBalancer;

  public constructor(connection: Deno.TcpConn, serverSources: ServerSourceType[], loadBalancer: ILoadBalancer) {
    this.loadBalancer = loadBalancer;
    this.connection = connection;
    this.serverSources = serverSources;
    this.handleConnection();
  }

  private async handleConnection() {
    try {
      while (1) {
        const buffer = new Uint8Array(MAX_BUFFER_SIZE);
        const bufferSize = await this.connection.read(buffer);

        // If the connection is closed
        if (bufferSize === null) {
          return;
        }
        const data = new TextDecoder().decode(buffer.subarray(0, bufferSize));
        console.log(`Received new data: ${data}`);
        const serverSource = this.loadBalancer.getNextSource();
        
        
      }
    } catch (err) {
      console.error(err);
      this.connection.close();
    }
  }
}
