import type { Request, Response } from "express";

export function sendApiNotFound(_request: Request, response: Response) {
  return response.status(404).type("application/json").json({
    error: "API route not found",
  });
}
