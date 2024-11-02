const hostname = "localhost";
const port = 8000;

const connectionsCount = 4;
const requestRate = 5; // per second
const duration = 20; // seconds

const timer = Date.now();

async function handleConnection(
  connection: Deno.TcpConn,
  clientNumber: number
) {
  while (1) {
    if (Date.now() > timer + duration * 1000) break;
    const requestText = `Client: ${clientNumber}`;
    await connection.write(new TextEncoder().encode(requestText));
  }
}

async function main() {
  console.log("Client tester initialized");
  const promises = [];
  for (let i = 0; i < connectionsCount; i++) {
    const con = await Deno.connect({ hostname: "127.0.0.1", port: port });
    promises.push(handleConnection(con, i));
  }
}

await main();
