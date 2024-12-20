const hostname = "127.0.0.1";
const port = 8000;

const connectionsCount = 4;
const throttleSeconds = .5; // seconds
const numberOfRequests = 10;

async function handleConnection(
  connection: Deno.TcpConn,
  clientNumber: number
) {
  let timer = Date.now();
  let requests = 0;
  while (1) {
    if (requests >= numberOfRequests) break;
    if (Date.now() - timer < throttleSeconds * 1000) continue;
    const requestText = `Client: ${clientNumber}`;
    await connection.write(new TextEncoder().encode(requestText));
    timer = Date.now();
    await new Promise(resolve => setTimeout(resolve, 10));
    requests++;
  }

  connection.close();
}

async function main() {
  console.log("Client tester initialized");
  const promises = [];
  for (let i = 0; i < connectionsCount; i++) {
    const con = await Deno.connect({ hostname: hostname, port: port });
    console.log(`Connecting client: ${i}`);
    const promise = handleConnection(con, i);
    promises.push(promise);
  }

  Promise.all(promises);
}

await main();
