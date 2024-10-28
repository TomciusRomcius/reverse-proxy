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

  public constructor(
    clientConnection: Deno.TcpConn,
    serverSource: ConnectionSourceType,
    onClose: () => void
  ) {
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
      let timer = new Date();
      let requests = 0;
      while (1) {
        const buffer = new Uint8Array(MAX_BUFFER_SIZE);
        const bufferSize = await this.clientConnection.read(buffer);
        infoLog("Incoming request");

        // Handle request throttling
        if (new Date().getMilliseconds() - timer.getMilliseconds() < REQUEST_TIMER) {
          requests++;
          if (requests > MAX_REQUESTS) {
            /* TODO: Ignore request by setting a timer and then 
            handling the request after timer has expired
            */
            infoLog("Connection refused");
            await new Promise((resolve) => setTimeout(() => resolve(null), REQUEST_TIMER));
            infoLog("Reset timer");
            continue;
          }
        } else {
          // Reset the timer and requests count when the time frame has expired
          timer = new Date();
          requests = 0;
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
