const MAX_BUFFER_SIZE = 1024;

async function handleConnection(connection: Deno.TcpConn) {
  const buffer = new Uint8Array(MAX_BUFFER_SIZE);
  while (1) {
    const bufSize = await connection.read(buffer);
    if (bufSize === null) {
      // Connection closed;
    } else {
      const text = new TextDecoder().decode(buffer.subarray(0, bufSize));
      console.log(`Server: ${text}`);
      const responseBytes = new TextEncoder().encode(text);
      connection.write(responseBytes);
    }
  }
}

async function setupServer(port: number, serverId: number) {
  const listener = Deno.listen({ port: port });
  while (1) {
    const con = await listener.accept();
    console.log(`New connection on server: ${serverId}`);
    con.setKeepAlive(true);
    handleConnection(con);
  }
}

async function main() {
  await Promise.all([
    setupServer(3000, 0),
    setupServer(3001, 1),
    setupServer(3002, 2),
    setupServer(3003, 3),
  ]);
}

await main();
