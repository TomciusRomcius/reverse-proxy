import { errorLog, infoLog } from "./logger.tsx";
import { sourceToString, type ConnectionSourceType } from "./serverSource.ts";

export default class ServerConnection {
  source: ConnectionSourceType;
  connection: Deno.TcpConn | null = null;

  constructor(source: ConnectionSourceType) {
    this.source = source;
    this.handleConnection();
  }

  private async handleConnection() {
    const connection = await Deno.connect({
      hostname: this.source.hostname,
      port: this.source.port,
    });

    this.connection = connection;
  }

  public forwardRequest(data: Uint8Array) {
    if (!this.connection) {
      errorLog(
        `Trying to forward a request to a server that the proxy has'nt connected to: ${sourceToString(
          this.source
        )}`
      );
      return;
    }
    this.connection.write(data).then(() => {
      infoLog(
        `Succesfully forwarded request to ${sourceToString(this.source)}`
      );
    });
  }
}
