import {
  sourceToString,
  type ConnectionSourceType,
} from "./connectionTypes.ts";
import { infoLog } from "./logger.ts";

const MAX_BUFFER_SIZE = 1024;
const MAX_REQUESTS = 5;
const REQUEST_TIMER = 1000;

export default class Connection {
  clientConnection: Deno.TcpConn;
  serverConnection: Deno.TcpConn | null = null;
  serverSource: ConnectionSourceType;
  onClose: () => void;
  rateLimiter: RateLimiter;

  public constructor(
    clientConnection: Deno.TcpConn,
    serverSource: ConnectionSourceType,
    onClose: () => void
  ) {
    this.rateLimiter = new RateLimiter(2, 0.2);
    this.clientConnection = clientConnection;
    this.serverSource = serverSource;
    this.onClose = onClose;

    // FIXME: May break things. The user may send data before the server connection is established
    this.initializeServerConnection().then((con) => {
      this.serverConnection = con;
      this.handleServerConnection(con);
      this.handleConnection();
    });
  }

  private async handleConnection() {
    if (!this.serverConnection) {
      throw new Error("Server connection is null");
    }
    try {
      // Connect to target server
      while (1) {
        const buffer = new Uint8Array(MAX_BUFFER_SIZE);
        const bufferSize = await this.clientConnection.read(buffer);
        infoLog("Incoming request");

        // Handle request throttling
        const throttle = this.rateLimiter.tryRequest();
        if (!throttle) {
          infoLog("Applying ratelimiting");
          await this.rateLimiter.delayUntilNextRequest();
          infoLog("Done ratelimiting");
        }

        // If the clientConnection is closed
        if (bufferSize === null) {
          return;
        }

        // Forward the request to the server
        this.serverConnection.write(buffer.subarray(0, bufferSize));
      }
    } catch (err) {
      console.error(err);
      this.clientConnection.close();
      this.onClose();
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
      // Check if stream closed
      if (!bufferSize) {
        infoLog("Connection closed");
        break;
      }
      const sentBuffer = buffer.subarray(0, bufferSize);
      infoLog("Forwarding data to the client");
      await this.clientConnection.write(sentBuffer);
      infoLog("Succesfully forwarded data to the client");
    }
    this.onClose();
  }
}

/*
  avg = reqs / time
  
  
  on request
    if currentTime - timer < 1min
      if reqCount > MAX
        cap requests
      else
        requests++
*/
