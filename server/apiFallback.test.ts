import { describe, expect, it, vi } from "vitest";
import { sendApiNotFound } from "./_core/apiFallback";

describe("API fallback", () => {
  it("returns a JSON 404 rather than a frontend HTML document", () => {
    const response = {
      status: vi.fn().mockReturnThis(),
      type: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    sendApiNotFound({} as never, response as never);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.type).toHaveBeenCalledWith("application/json");
    expect(response.json).toHaveBeenCalledWith({ error: "API route not found" });
  });
});
