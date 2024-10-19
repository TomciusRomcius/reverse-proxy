import Connection from "./connection.ts";

const connections = new Set<Connection>;

async function main() {
  const listener = Deno.listen({ port: 8000, transport: "tcp" });
  while (true) {
    const connection = await listener.accept();
    console.log("New connection");
    connections.add(new Connection(connection));
  }
}

main();
