import Fastify from "fastify";
import { registerRoutes } from "./modules/routes.js";
import { registerUiRoutes } from "./ui/routes.js";

interface BuildAppOptions {
  logger?: boolean;
}

export function buildApp(options: BuildAppOptions = {}) {
  const app = Fastify({
    logger: options.logger ?? true
  });

  app.get("/health", async () => ({
    status: "ok"
  }));

  app.register(registerRoutes);
  app.register(registerUiRoutes);

  return app;
}
