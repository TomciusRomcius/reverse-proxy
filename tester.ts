const server = new Deno.Command("deno", {
  args: ["task", "test:server"]
}).spawn();

const client = new Deno.Command("deno", {
  args: ["task", "test:client"]
}).spawn();

await Promise.all([server, client]);