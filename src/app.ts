import Fastify from "fastify";
import { registerRoutes } from "./modules/routes.js";

export function buildApp() {
  const app = Fastify({
    logger: true
  });

  app.get("/health", async () => ({
    status: "ok"
  }));

  app.register(registerRoutes);

  return app;
}
