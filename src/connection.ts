import { infoLog } from "./logger.tsx";
import { sourceToString, type ServerSourceType } from "./serverSource.ts";

const MAX_BUFFER_SIZE = 1024;

export default class Connection {
  clientConnection: Deno.TcpConn;
  serverConnection: Deno.TcpConn;
  serverSource: ServerSourceType;

  public constructor(
    clientConnection: Deno.TcpConn,
    serverSource: ServerSourceType
  ) {
    this.clientConnection = clientConnection;
    this.serverSource = serverSource;
    this.initializeServerConnection().then((con) => {
      this.serverConnection = con;
      this.handleServerConnection(con);
      this.handleConnection();
    });
  }

  private async handleConnection() {
    try {
      // Connect to target server

      while (1) {
        const buffer = new Uint8Array(MAX_BUFFER_SIZE);
        const bufferSize = await this.clientConnection.read(buffer);

        // If the clientConnection is closed
        if (bufferSize === null) {
          return;
        }
        const data = new TextDecoder().decode(buffer.subarray(0, bufferSize));
        console.log(`Received new data: ${data}`);
        this.serverConnection.write(buffer.subarray(0, bufferSize));
      }
    } catch (err) {
      console.error(err);
      this.clientConnection.close();
    }
  }

  private async initializeServerConnection() {
    infoLog(
      `Establishing a connection with a server ${sourceToString(
        this.serverSource
      )}`
    );
    const serverConnection = await Deno.connect({
      hostname: this.serverSource.hostname,
      port: this.serverSource.port,
      transport: "tcp",
    });
    infoLog("Succesfully established connection with a server");
    return serverConnection;
  }

  private async handleServerConnection(serverConnection: Deno.TcpConn) {
    while (1) {
      const buffer = new Uint8Array(MAX_BUFFER_SIZE);
      const bufferSize = await serverConnection.read(buffer);
      // Stream closed
      if (!bufferSize) {
        infoLog("Connection closed");
        return;
      }
      const sentBuffer = buffer.subarray(0, bufferSize);
      infoLog("Forwarding data to the client");
      await this.clientConnection.write(sentBuffer);
      infoLog("Succesfully forwarded data to the client");
    }
  }
}
