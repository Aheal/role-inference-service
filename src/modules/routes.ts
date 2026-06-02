import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import {
  ingestProfile,
  listProfiles,
  listRoles,
  overrideMapping,
  rerunInference,
  resetMapping,
  resolveCurrentMapping
} from "./mapping-service.js";

export async function registerRoutes(app: FastifyInstance) {
  app.get("/roles", async () => listRoles());

  app.get("/profiles", async () => listProfiles());

  app.post("/profiles", async (request, reply) => {
    try {
      return await ingestProfile(request.body);
    } catch (error) {
      return handleError(reply, error);
    }
  });

  app.post<{ Params: { id: string } }>("/profiles/:id/infer", async (request, reply) => {
    try {
      return await rerunInference(request.params.id);
    } catch (error) {
      return handleError(reply, error);
    }
  });

  app.get<{ Params: { id: string } }>("/profiles/:id/mapping", async (request, reply) => {
    try {
      return await resolveCurrentMapping(request.params.id);
    } catch (error) {
      return handleError(reply, error);
    }
  });

  app.post<{ Params: { id: string } }>("/profiles/:id/override", async (request, reply) => {
    try {
      return await overrideMapping(request.params.id, request.body);
    } catch (error) {
      return handleError(reply, error);
    }
  });

  app.post<{ Params: { id: string } }>("/profiles/:id/reset", async (request, reply) => {
    try {
      return await resetMapping(request.params.id);
    } catch (error) {
      return handleError(reply, error);
    }
  });
}

function handleError(reply: { code: (statusCode: number) => { send: (payload: unknown) => unknown } }, error: unknown) {
  if (error instanceof ZodError) {
    return reply.code(400).send({
      error: "invalid_request",
      issues: error.issues
    });
  }

  if (error instanceof Error && error.message.includes("not found")) {
    return reply.code(404).send({
      error: "not_found",
      message: error.message
    });
  }

  throw error;
}
