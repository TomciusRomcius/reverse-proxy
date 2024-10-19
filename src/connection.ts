const MAX_BUFFER_SIZE = 1024;

export default class Connection {
  connection: Deno.TcpConn;
  public constructor(connection: Deno.TcpConn) {
    this.connection = connection;
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
      }
    } catch (err) {
      console.error(err);
      this.connection.close();
    }
  }
}
