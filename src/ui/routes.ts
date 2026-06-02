import { createReadStream, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import type { FastifyInstance, FastifyReply } from "fastify";

const frontendRoot = resolve("dist", "frontend");

export async function registerUiRoutes(app: FastifyInstance) {
  app.get("/", async (_request, reply) => {
    const indexPath = join(frontendRoot, "index.html");
    if (!existsSync(indexPath)) {
      return reply.type("text/html").send("<p>Admin UI has not been built yet. Run <code>npm run build</code>.</p>");
    }

    return reply.type("text/html").send(createReadStream(indexPath));
  });

  app.get<{ Params: { "*": string } }>("/assets/*", async (request, reply) => {
    const assetPath = join(frontendRoot, "assets", request.params["*"]);
    if (!assetPath.startsWith(join(frontendRoot, "assets")) || !existsSync(assetPath)) {
      return reply.code(404).send({ error: "not_found" });
    }

    return reply.type(contentType(assetPath)).send(createReadStream(assetPath));
  });
}

function contentType(filePath: string) {
  if (filePath.endsWith(".js")) return "text/javascript";
  if (filePath.endsWith(".css")) return "text/css";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}
