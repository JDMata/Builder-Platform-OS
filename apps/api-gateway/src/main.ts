import { buildDependencies } from "./build-dependencies.js";
import { createServer } from "./server.js";

const port = Number(process.env.SAF_API_GATEWAY_PORT ?? 3001);

const deps = await buildDependencies();
const server = createServer(deps);
server.listen(port);

process.on("SIGTERM", () => server.close());
process.on("SIGINT", () => server.close());
